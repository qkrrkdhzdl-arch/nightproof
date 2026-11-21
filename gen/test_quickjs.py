#!/usr/bin/env python3
"""Run the Nightproof test suite in quickjs (same files the browser loads)."""
import json
import sys
from pathlib import Path

import quickjs

SITE = Path("/workspace/work/64cha-byaa")
ctx = quickjs.Context()

ctx.eval("globalThis.window = globalThis;")
for name in ("engine.js", "i18n.js", "coach.js"):
    ctx.eval((SITE / "js" / name).read_text())
raw = (SITE / "data/problems.json").read_text()
ctx.eval("window.__PROBLEMS__ = " + raw + ";")
ctx.eval((SITE / "js" / "tests.js").read_text())
summary = ctx.get("__TEST_SUMMARY__")
results = json.loads(ctx.eval("JSON.stringify(__TEST_RESULTS__)"))
print("TESTS:", summary)
for r in results:
    if not r["pass"]:
        print(" FAIL", r["name"], "—", r["detail"])
sys.exit(0 if all(r["pass"] for r in results) else 1)
