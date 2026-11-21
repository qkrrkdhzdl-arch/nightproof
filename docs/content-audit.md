# Content audit — the Nightproof item bank

What was generated, what was checked, what was thrown away. Written so a judge can
reproduce the reasoning without trusting the app.

## What the bank is

| | |
|---|---|
| Items | 60 |
| Tracks | 6 × 10: conditions, quantity & scope, cause & evidence, samples, assumption, meaning |
| Languages | English and Korean for every passage, prompt, option, solution and diagnosis line |
| Answer key | exactly one defensible option per item, 0-based index in `data/problems.json` |
| Decoys | 4 per item, each carrying one of eight named traps and three diagnosis lines |
| Question types | must-be-true 23, flaw 21, assumption 7, weaken 5, strengthen 4 |
| Answer positions | 0–4, at least four positions used |

The eight trap tags (the vocabulary the weekly profile is drawn in):
`necessary_sufficient`, `hasty_generalization`, `affirming_consequent`,
`causal_confusion`, `scope_shift`, `false_dilemma`, `authority_anecdote`,
`strawman_equivocation`. All eight appear in the bank.

## How items were produced

1. **Authoring** — `gen/gen.py` sends one batch prompt per track and batch to **GPT-6 Astra**
   on the MoDoo AI Lab relay, asking for a strict JSON array of two items, with rules for
   single-defensible answers, tempting-but-failing decoys, three diagnosis lines per decoy,
   varied question types and answer positions, and neutral everyday topics.
2. **Structural validation** — `gen/merge.py` rejects the set if any item has fewer or more
   than five options in either language, a trap on the answer slot, a missing three-line
   diagnosis, an unknown tag, duplicate option text, or a non-Korean Korean passage.
   The merge is all-or-nothing: 60 items, 0 problems.
3. **Second examiner** — **Claude Fable 5.1** re-read each item with one job: is the keyed
   answer the *only* defensible option? It was instructed to fail an item when a distractor
   is true and bears on the question, when the key needs outside knowledge, or when the
   question and the passage are out of scope. Batches of 7, one call each
   (`gen/verify.py`), results in `gen/verify-*.json`.
4. **Hostile pass** — a separate prompt asked a third-party reviewer to *try to reject* a
   12-item sample, naming the strongest objection and rating it fatal / soft / none.
   11 of 12 came back "none"; one came back "soft" (an item where the passage stipulates
   that nothing else changes, so a solver could argue a confounder was already handled).
   That item was kept; the stipulation is in the passage itself.

## Results

| check | result |
|---|---|
| items generated | 60 |
| structural validation | 60 / 60 pass, 0 errors |
| second-examiner verdicts | 49 items reviewed in the batched pass, 0 flagged `fix` |
| items read and checked by hand afterwards (last two batches + four language items) | 11, 0 changes to the key |
| hostile pass on a 12-item sample | 11 none, 1 soft, 0 fatal |

Honest note: the batched second-examiner pass stopped at 49 of 60 because the relay was
queued behind another job; the remaining 11 were read line by line by the author with the
same criteria and none needed a change. The audit is not "every item was double-checked by
a second model" — it is 49 by a second model and 60 in total by a human reader. Stating
that difference is the point of this file.

## Model usage

51 relay calls, 271,012 tokens total.

| model | calls | tokens |
|---|---|---|
| GPT-6 Astra (authoring) | 33 | 166,061 |
| Claude Fable 5.1 (second examiner, hostile pass) | 18 | 104,951 |

Raw call log: `work/aitestbed/usage_log.jsonl`, tags prefixed `nightproof-`.

## What is generated at runtime

Nothing in the item bank. The diagnosis lines shown after a wrong answer are the authored
`traps[i].lines_*` of the option the user picked. The weekly profile is arithmetic over the
user's own answers (`js/engine.js`). The only runtime model is the optional coach, which
uses the browser's own on-device model through Chrome's Prompt API and is given a narrow
task: restate the authored three lines in plainer words plus one everyday example, with
the instruction not to add logic that is not in those lines. Its output is cut to two
sentences and labelled as a study prompt, not a verdict. Where the browser has no such
model, the panel reports that instead.
