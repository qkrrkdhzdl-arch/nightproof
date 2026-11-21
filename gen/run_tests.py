#!/usr/bin/env python3
"""Run the browser test suite against a local static server."""
import json
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path("/workspace/work/64cha-byaa")
PORT = 8141
BASE = f"http://127.0.0.1:{PORT}"


def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=ROOT,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page()
            errors = []
            pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errors.append(str(e)))
            pg.goto(f"{BASE}/tests.html")
            pg.wait_for_function("window.__TEST_SUMMARY__", timeout=20000)
            print("TESTS:", pg.evaluate("window.__TEST_SUMMARY__"))
            fails = pg.evaluate("window.__TEST_RESULTS__.filter(r=>!r.pass)")
            for f in fails:
                print("  FAIL", f["name"], "—", f["detail"])
            if errors:
                print("console errors:", errors)
            b.close()
    finally:
        srv.terminate()


if __name__ == "__main__":
    main()
