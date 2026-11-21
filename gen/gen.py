#!/usr/bin/env python3
"""Generate Nightproof problem sets with the MoDoo AI Lab relay.

Usage:  python3 gen.py <track> <batch> [count] [model]
Writes: gen/out/<track>-<batch>.json
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "aitestbed"))
from ask_model import ask  # noqa: E402

TAGS = [
    "necessary_sufficient",   # treated a necessary condition as sufficient (or the reverse)
    "hasty_generalization",   # jumped from a small or skewed sample to a general rule
    "affirming_consequent",   # affirmed the consequent / denied the antecedent
    "causal_confusion",       # read correlation, sequence or a story as proof of cause
    "scope_shift",            # slid between 'some' and 'all', 'not all' and 'none'
    "false_dilemma",          # forced two options where more exist, or built on a false premise
    "authority_anecdote",     # leaned on authority, popularity or one anecdote instead of evidence
    "strawman_equivocation",  # restated the claim as something weaker, stronger or different
]

TRACKS = {
    "condition": "conditions and if-then reasoning (necessary vs sufficient, contrapositive, chained conditionals)",
    "quantity": "quantity and scope (some/all/none, 'only', 'unless', 'at least', 'most', percentages vs absolute numbers)",
    "cause": "cause and evidence (correlation vs causation, confounders, reverse causation, controlled comparison)",
    "sample": "samples and generalisation (sample size, selection bias, response bias, survivorship, base rates)",
    "assumption": "argument repair (unstated assumptions, which evidence strengthens or weakens, what must be true)",
    "language": "meaning and definition (ambiguous terms, equivocation, shifting definitions, loaded wording, vague quantifiers)",
}

SYSTEM = (
    "You write reasoning-test items in the style of Korea's LEET (legal education eligibility test) "
    "sachui-nonjeung section, but with everyday, globally readable topics so that an English-speaking "
    "reader with no local knowledge can solve them. You are exact about logic: every item has exactly "
    "one defensible answer, and every distractor fails for one identifiable reason. You never write "
    "items whose answer depends on outside facts, politics, religion, or a real named person."
)

PROMPT = """Write {n} original reasoning items about {topic}.

Return ONE JSON array and nothing else (no prose, no code fence).

Each item is an object with exactly these keys:
{{
  "id": "{track}-{batch}-{{k}}"        // k = 1..{n}, zero padded to 2 digits
  "track": "{track}",
  "level": 1|2|3,                      // 1 = a careful reader gets it, 3 = hard
  "question_type": "weaken" | "assumption" | "must_be_true" | "flaw" | "conclusion" | "principle",
  "passage_en": "...",                 // 55-95 words, 3-5 sentences, plain modern English
  "passage_ko": "...",                 // natural Korean rendering of the same passage (not word-for-word)
  "prompt_en": "...",                  // the question, e.g. "Which one of the following, if true, most weakens the argument?"
  "prompt_ko": "...",
  "options_en": ["...", "...", "...", "...", "..."],   // exactly 5
  "options_ko": ["...", "...", "...", "...", "..."],   // exactly 5, same order
  "answer": 0..4,                      // index of the one defensible option
  "solution_en": "...",                // 3-6 sentences: why the answer works, line by line
  "solution_ko": "...",
  "traps": [                           // one entry per option, same order; the answer's slot is null
     {{"tag": "<one of the tags>", "lines_en": ["...","...","..."], "lines_ko": ["...","...","..."]}},
     null,
     ...
  ]
}}

Allowed trap tags (use the one that best names why that option fails):
{tags}

Rules that decide whether the item is worth writing:
1. Exactly one option is defensible. The other four are tempting but each fails for one clear reason.
2. A distractor must never be a "true but irrelevant" sentence that a reasonable examiner could also credit:
   if an option is true and bears on the question, cut it and write a weaker one.
3. Wrong options must be written as the mistake a real solver makes, not as nonsense. A common pattern:
   the option that repeats the passage's wording but reverses the direction of the condition.
4. `lines_en` answers the solver in the second person, three lines, each at most 16 words:
   line 1 what they just did ("You read 'only if' as 'if'."), line 2 why it fails ("The passage makes
   the fee a requirement, not a guarantee."), line 3 the move to remember ("For A only if B, B is
   necessary — it never secures A."). `lines_ko` is the same three lines in Korean, 반말 아닌 해요체 없이
   짧은 개조식 문장.
5. Vary the question type across the set; do not write {n} items of the same type.
6. Vary the answer index; do not put the answer in the middle every time.
7. Topics: neutral and concrete. Commuting, sleep, coffee, libraries, buses, city policy, gyms,
   packaging, batteries, office air, online reviews, second-hand sales, weather, plants, music practice,
   study habits. No brand names, no real people, no politics, no religion, no medical advice.
8. Korean must read like a Korean test paper, not a translation: 해요체 아님, '~이다'체 평서문.
"""


def build(track, batch, n, hint=""):
    text = PROMPT.format(n=n, topic=TRACKS[track], track=track, batch=batch,
                         tags="\n".join("- " + t for t in TAGS))
    if hint:
        text += "\nExtra requirement for this batch: " + hint + "\n"
    return text


def parse(text):
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    start = text.find("[")
    if start < 0:
        raise ValueError("no JSON array in output")
    frag = text[start:]
    frag = re.sub(r",(\s*[\]}])", r"\1", frag)
    try:
        return json.loads(frag)
    except Exception:
        pass
    # truncated output: keep every complete object
    idx = len(frag)
    while True:
        idx = frag.rfind("}", 0, idx)
        if idx < 0:
            raise ValueError("cannot repair output")
        head = frag[:idx + 1] + "]"
        try:
            items = json.loads(head)
            if items:
                return items
        except Exception:
            continue


def main():
    track = sys.argv[1]
    batch = sys.argv[2]
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 3
    hint = sys.argv[4] if len(sys.argv) > 4 else ""
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    os.makedirs(out_dir, exist_ok=True)
    prompt = build(track, batch, n, hint)
    with open(os.path.join(out_dir, f"{track}-{batch}.prompt.txt"), "w") as f:
        f.write(prompt)
    last_err = None
    for attempt in range(3):
        text = ask(prompt, model="gpt-6-astra", system=SYSTEM, max_tokens=7000,
                   temperature=0.75, tag=f"nightproof-{track}-{batch}")
        try:
            items = parse(text)
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            with open(os.path.join(out_dir, f"{track}-{batch}.raw{attempt}.txt"), "w") as f:
                f.write(text)
            continue
        items = [it for it in items if isinstance(it, dict) and it.get("options_en")]
        with open(os.path.join(out_dir, f"{track}-{batch}.json"), "w") as f:
            json.dump(items, f, ensure_ascii=False, indent=1)
        print(f"ok {track}-{batch}: {len(items)} items (attempt {attempt})")
        return
    print("FAILED", track, batch, last_err)
    sys.exit(1)


if __name__ == "__main__":
    main()
