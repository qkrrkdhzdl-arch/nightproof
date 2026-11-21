# Nightproof

**One proof before sleep. One after you wake.**

Live app: **https://qkrrkdhzdl-arch.github.io/nightproof/**
Test suite: https://qkrrkdhzdl-arch.github.io/nightproof/tests.html
Built for **Build Your First AI App 2026** (Yasir Insights, Devpost).

---

## The problem

The last thing most students do at night and the first thing they do in the morning is
open a feed. It costs twenty minutes, teaches nothing, and leaves a slightly worse mood
than the one they had. At the same time, the reasoning section of Korea's LEET
(추리논증) — the exam that decides law-school admission here — rewards exactly the habit
the feed destroys: reading one argument carefully, once, without a timer.

Nightproof replaces two scrolls a day with two reasoning problems, and turns the
mistake into the useful part.

## What it does

- **A two-slot ritual.** One problem is served at night (20:00–03:59) and a different one
  in the morning (04:00–11:59). The problem for a given day and slot is computed from the
  date, not drawn at random, so it cannot be re-rolled into something easier.
- **The morning gate.** Set a wake time and the app locks itself in the first 90 minutes
  after it until the morning problem is answered — or until its reasoning is read. Two
  five-minute snoozes exist, because a ritual that cannot be survived gets deleted.
- **A three-line trap diagnosis.** Every wrong option carries a named logical trap
  (necessary/sufficient swap, hasty generalisation, affirming the consequent, cause from
  correlation, scope shift, false dilemma, authority/anecdote, claim moved) and three
  lines written for that specific option: what you just did, why it fails, and the move to
  remember. It is authored per decoy, never generated at the moment you tap, so a wrong
  pick can never be met with an invented explanation.
- **A weekly logic profile.** Eight traps on a radar, the two you are leaking points on,
  a drill for each, accuracy by track, and a seven-day strip. All arithmetic on your own
  answers, on your own device.
- **Urge surfing instead of a counter.** A button that says *I want to scroll* opens a
  60-second breathing + naming exercise, logs the resisted urge, and adds it to the
  "minutes of feed replaced" number.
- **English and Korean**, with the language guessed from the browser and one tap to
  switch. Every problem, option, diagnosis and drill exists in both.
- **Offline.** A service worker caches the whole ritual; add it to the home screen and it
  behaves like an app.

## How AI is used — precisely

Two different things, and it matters which is which.

**1. The item bank was built with AI, then audited.**
Sixty items in the shape of LEET 추리논증 were written with **GPT-6 Astra** through the
MoDoo AI Lab relay (six tracks × ten items). Every answer key was then re-read by
**Claude Fable 5.1** as a second, hostile examiner; anything either model called arguable
was rewritten or cut. The pipeline is in [`gen/`](gen/), and
[`docs/content-audit.md`](docs/content-audit.md) records what was generated, what was
checked, and what the checker flagged. Nothing about an item is generated at runtime.

**2. The coach runs on your device, if you ask it to.**
`js/coach.js` loads **Qwen2.5-0.5B-Instruct** (q4 ONNX, ~0.3 GB, one time) through
**Transformers.js**, inside the tab, on WebAssembly. It receives the item you just missed
and your own seven-day tally for that trap, and writes three sentences: where the error
comes from, what it costs, and one drill for today. No API key, no server, no request
carrying your answers anywhere. If it never loads — no WebAssembly, no network for the
first download — every other feature keeps working and the app says so in the same panel.

What is *not* AI: the diagnosis text, the weekly profile, the streaks, the alarm gate.
Those are authored content and arithmetic, so they are identical for everyone, instant,
and offline.

## Stack

Vanilla JavaScript, no framework, no build step, no dependencies at runtime. Static files
on GitHub Pages. State in `localStorage`, exportable and importable as JSON. One optional
dynamic import (Transformers.js) for the coach.

```
site/
  index.html            shell
  css/app.css           the whole design
  js/engine.js          pure logic: slots, deterministic delivery, streaks, profiles, gate
  js/i18n.js            English/Korean strings, trap names, drills
  js/coach.js           on-device 0.5B coach (Transformers.js)
  js/app.js             views and events
  js/tests.js           52 assertions over engine, i18n, bank and coach prompt
  tests.html            the same suite in a browser
  data/problems.json    60 items, bilingual, with per-decoy diagnoses
  sw.js, manifest.webmanifest
gen/                    generation, repair, merge, verify and test scripts
docs/content-audit.md   what the models wrote, what the checker found
```

## Run it

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000
```

Open `http://localhost:8000/tests.html` for the suite. There is nothing to install and
nothing to compile.

## Tests

`52/52` pass — in quickjs on the same files the browser loads
(`python3 gen/test_quickjs.py`) and in a browser at `/tests.html`. They cover the phase
boundaries, deterministic delivery (30 days visit every item exactly once), the streak
with its one-day forgiveness, the trap profile and accuracy denominators, the alarm gate
in seven states, i18n key parity in both directions, the coach prompt's safety rules, and
integrity of all sixty items (five options in both languages, the answer slot carries no
trap, every decoy has a valid tag and three lines, answer positions and question types
vary).

## Limits, stated plainly

- A 0.5B model is a study companion, not an examiner. Its note is a prompt to think, not
  a verdict, and the app prints that under every note.
- A web alarm cannot ring a phone like a native alarm. The gate blocks this app and, while
  the tab is open, is the thing standing between you and everything else in it. Add
  Nightproof to the home screen for the closest thing the web allows.
- The detox number is a self-report estimate (8 minutes per resisted urge, 6 per proof).
  It measures the ritual, not your screen time.
- The items are original problems in the LEET style, not past LEET questions.

## Credits

- Item bank written with GPT-6 Astra, keys audited with Claude Fable 5.1 (MoDoo AI Lab).
- Coach: [Qwen2.5-0.5B-Instruct](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct)
  (Apache-2.0) via [Transformers.js](https://github.com/huggingface/transformers.js) (Apache-2.0).
- Design, code and copy: Park Gaon.

MIT licensed. © 2026 Park Gaon.
