## Inspiration

I am a Korean university student preparing for the LEET — the exam that decides law-school admission here. Its reasoning section (추리논증) is not about memorising law; it is about reading one argument carefully, once, and knowing exactly where your reading bent.

The last thing I do at night and the first thing I do in the morning is open a feed, and that habit is the exact opposite of the skill the exam rewards: twenty minutes of fragments, nothing retained, a slightly worse mood. I wanted something that took the same two moments — the last one before sleep and the first one after waking — and put one careful read in them instead.

The hard part is not serving a puzzle. It is what happens after you get it wrong. A generic "the answer is C" teaches nothing; what you need to know is *which* mistake you just made, named, in the smallest number of words that will still be there tomorrow morning.

## What it does

**Two slots, one ritual.** One problem is delivered at night (20:00–03:59) and a different one in the morning (04:00–11:59). The problem for a given day and slot is derived from the date — 30 days visit every item exactly once — so it cannot be re-rolled into something easier.

**The morning gate.** Set a wake time and the app locks itself in the first 90 minutes after it until the morning problem is answered, or until its reasoning is read. Two five-minute snoozes exist, because a ritual you cannot survive gets deleted. A preview button lets anyone see the gate without waiting for 7 a.m.

**A three-line trap diagnosis.** Every wrong option carries one named logical trap — necessary/sufficient swap, hasty generalisation, affirming the consequent, cause from correlation, scope shift, false dilemma, authority/anecdote, claim moved — and three lines written for that exact option: what you did, why it fails, the move to remember. These are authored per decoy and stored in the item, so the app can never invent an explanation at the moment you tap.

**A weekly logic profile.** Eight traps on a radar, the two you are leaking the most points on with a drill for each, accuracy by track, and a seven-day strip. All arithmetic over your own answers.

**Urge surfing.** A button that says "I want to scroll" gives you 60 seconds of breathing and a place to name what you were reaching for, then logs it to the "minutes of feed replaced" number instead of opening the feed.

**English and Korean.** Language is guessed from the browser, one tap to switch, and every passage, option, diagnosis and drill exists in both.

**Offline.** A service worker caches the ritual; added to the home screen it behaves like an app.

## How I built it

Vanilla JavaScript, no framework, no build step. Three small modules — a pure engine (slots, deterministic delivery, streaks, trap profile, alarm gate), an i18n table, and the views — plus one optional module for the coach. State lives in `localStorage` and can be exported as JSON. It is 60 problems and a static site; that is all it needs to be.

**The item bank** was written with GPT-6 Astra on the MoDoo AI Lab relay, six tracks × ten items, bilingual, with a strict JSON contract (five options, one key, one trap per decoy, three diagnosis lines each). A validator rejects a set if any of that is missing. Every key was then re-read by Claude Fable 5.1 with one job: is this the *only* defensible option? Anything arguable was rewritten or cut. The whole audit — including the honest part about how many items got the second-model read — is in `docs/content-audit.md`.

**The coach** is a separate, optional thing, and it ships no weights: it asks the browser for the model the browser already has (Chrome's Prompt API / Gemini Nano) and hands it a narrow job — restate the authored three lines in plainer words, plus one everyday example, without adding new logic. No key, no server, nothing about you leaving the device. I tried shipping a small ONNX model in the page first; a 0.5B model took minutes and a 135M model wrote nonsense, and both were a 100 MB+ download for a worse answer than the authored lines. Using the browser's model is the honest version, and when the browser has none the panel says so in one line.

## Challenges

- **Diagnosis without a runtime model.** The obvious build calls an LLM every time someone misses a question. That puts a key in a static site or a bill behind a beginner's app, and it means an answer can be met with a hallucinated explanation. I moved the model to authoring time and made the runtime path authored and instant; the AI that remains at runtime is opt-in and on-device.
- **A gate a browser can actually keep.** The web cannot ring an alarm like a phone. I made the gate block the app itself, refuse to be dismissed by a swipe, and admit in the Method page exactly what it can and cannot do.
- **Making 60 items that survive scrutiny.** Two models agreeing is not enough; the useful work was writing the rule ("a distractor that is true and bears on the question is a defect") and then checking against it.

## What I learned

The model writes a plausible item in seconds and a *sound* item slowly — and the difference is entirely in the checking. I also learned that for a beginner app the framework is the least interesting decision: what mattered was the item contract, the deterministic delivery, and being honest in the UI about the parts that are just arithmetic.

## What's next

Spaced repetition of the traps you keep missing (the profile already knows them), a larger bank, a native wrapper so the alarm can ring properly, and a teacher view that shows a class's trap profile without collecting names.
## Try it

- **Live app:** https://qkrrkdhzdl-arch.github.io/nightproof/
- **Source (MIT):** https://github.com/qkrrkdhzdl-arch/nightproof
- **Test suite (56 passing in the browser):** https://qkrrkdhzdl-arch.github.io/nightproof/tests.html

To see the morning gate without waiting for tomorrow, open **Settings → Preview the morning gate**.
The app stores everything in your browser; nothing is sent anywhere.
