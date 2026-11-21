#!/usr/bin/env python3
"""Validate generated items and merge them into data/problems.json."""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "out")
TAGS = ["necessary_sufficient", "hasty_generalization", "affirming_consequent",
        "causal_confusion", "scope_shift", "false_dilemma", "authority_anecdote",
        "strawman_equivocation"]
HANGUL = re.compile("[\uac00-\ud7a3]")


def check(it):
    errs = []
    iid = it.get("id", "?")
    for k in ("passage_en", "passage_ko", "prompt_en", "prompt_ko", "solution_en", "solution_ko"):
        v = it.get(k)
        if not isinstance(v, str) or len(v.split()) < 4:
            errs.append(f"{iid}: {k} missing/short")
    oe, ok_ = it.get("options_en", []), it.get("options_ko", [])
    if len(oe) != 5 or len(ok_) != 5:
        errs.append(f"{iid}: options length {len(oe)}/{len(ok_)}")
    if len(set(x.strip().lower() for x in oe)) != len(oe):
        errs.append(f"{iid}: duplicate EN options")
    a = it.get("answer")
    if not isinstance(a, int) or not 0 <= a <= 4:
        errs.append(f"{iid}: bad answer {a}")
    traps = it.get("traps")
    if not isinstance(traps, list) or len(traps) != 5:
        errs.append(f"{iid}: traps length {len(traps) if isinstance(traps, list) else traps}")
        return errs
    if traps[a] is not None:
        errs.append(f"{iid}: trap present at answer index")
    for i, t in enumerate(traps):
        if i == a:
            continue
        if not isinstance(t, dict):
            errs.append(f"{iid}: trap {i} null on a distractor")
            continue
        if t.get("tag") not in TAGS:
            errs.append(f"{iid}: trap {i} bad tag {t.get('tag')}")
        for lk in ("lines_en", "lines_ko"):
            ls = t.get(lk) or []
            if len(ls) != 3 or any(len(x.split()) < 3 for x in ls):
                errs.append(f"{iid}: trap {i} {lk} bad ({len(ls)})")
    if not HANGUL.search(it.get("passage_ko", "")):
        errs.append(f"{iid}: passage_ko not Korean")
    if len(it.get("passage_en", "").split()) > 130:
        errs.append(f"{iid}: passage_en too long")
    return errs


def main():
    items, problems = [], []
    for f in sorted(glob.glob(os.path.join(OUT, "*.json"))):
        ps = json.load(open(f))
        for p in ps:
            problems.extend(check(p))
        items.extend(ps)
    ids = [i.get("id") for i in items]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        problems.append(f"duplicate ids: {dup}")
    print(f"{len(items)} items, {len(problems)} problems")
    for p in problems:
        print(" -", p)
    if problems and "--keep" not in sys.argv:
        sys.exit(1)
    # order: track order, then id
    order = ["condition", "quantity", "cause", "sample", "assumption", "language"]
    items.sort(key=lambda i: (order.index(i["track"]), i["id"]))
    dest = os.path.join(ROOT, "data", "problems.json")
    json.dump(items, open(dest, "w"), ensure_ascii=False, indent=1)
    print("wrote", dest, os.path.getsize(dest), "bytes")


if __name__ == "__main__":
    main()
