#!/usr/bin/env python3
"""Cross-check answer keys with a second model (claude-fable-5-1)."""
import json
import os
import re
import sys

sys.path.insert(0, "/workspace/work/aitestbed")
from ask_model import ask  # noqa: E402

ROOT = "/workspace/work/64cha-byaa"
ITEMS = json.load(open(os.path.join(ROOT, "site/data/problems.json")))

SYS = ("You are a strict item-reviewer for a reasoning test. You only look at logic: whether exactly "
       "one option is defensible, whether the stated key is right, and whether any other option could "
       "reasonably be credited by a careful examiner.")

TPL = """Review these reasoning items. For each item, decide whether the stated answer is the only
defensible option.

Return ONLY a JSON array, one object per item:
  {{"id": "...", "verdict": "ok" | "fix", "issue": "<at most 25 words; empty when ok>"}}

Judge strictly:
- If a distractor is factually true AND bears on the question asked, that is "fix" (a careful solver could credit it).
- If the keyed answer needs outside knowledge, is unclear, or is only arguably correct, that is "fix".
- If the question and the passage's scope do not line up, that is "fix".
- Do not rewrite anything. Do not comment on style or length.

Items:
{payload}
"""


def main():
    chunk = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    reports = []
    for start in [start]:
        part = ITEMS[start:start + chunk]
        slim = [{"id": i["id"], "passage": i["passage_en"], "question": i["prompt_en"],
                 "options": i["options_en"], "answer_index": i["answer"],
                 "keyed_answer": i["options_en"][i["answer"]],
                 "solution": i["solution_en"]} for i in part]
        prompt = TPL.format(payload=json.dumps(slim, ensure_ascii=False, indent=1))
        text = ask(prompt, model="claude-fable-5-1", system=SYS, max_tokens=2000,
                   temperature=0.2, tag="nightproof-verify")
        text = re.sub(r"^```(json)?|```$", "", text.strip()).strip()
        s, e = text.find("["), text.rfind("]")
        try:
            rep = json.loads(text[s:e + 1])
        except Exception:
            print("PARSE FAIL at", start, text[:200])
            continue
        reports.extend(rep)
        print("checked", start, "->", len(rep))
    dest = os.path.join(ROOT, f"gen/verify-{start:02d}.json")
    json.dump(reports, open(dest, "w"), ensure_ascii=False, indent=1)
    bad = [r for r in reports if r.get("verdict") != "ok"]
    print(f"{len(reports)} checked, {len(bad)} flagged")
    for b in bad:
        print(" -", b["id"], b.get("issue"))


if __name__ == "__main__":
    main()
