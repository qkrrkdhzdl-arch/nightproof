/* Nightproof — browser tests. Open /tests.html on the live site, or run
 * `node tests.js` after loading data/problems.json. Plain assertions, no deps. */
(function (global) {
  const results = [];
  const { Engine, I18n, Coach } = global.NP;

  function ok(name, cond, detail) {
    results.push({ name, pass: !!cond, detail: cond ? '' : (detail || '') });
  }
  function eq(name, a, b) { ok(name, JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

  function d(y, m, day, h, min) { return new Date(y, m - 1, day, h, min || 0, 0, 0); }

  /* ---- phase ---- */
  eq('phase: 03:59 is night', Engine.phase(d(2026, 11, 22, 3, 59)), 'night');
  eq('phase: 04:00 is morning', Engine.phase(d(2026, 11, 22, 4, 0)), 'morning');
  eq('phase: 11:59 is morning', Engine.phase(d(2026, 11, 22, 11, 59)), 'morning');
  eq('phase: 12:00 is day', Engine.phase(d(2026, 11, 22, 12, 0)), 'day');
  eq('phase: 19:59 is day', Engine.phase(d(2026, 11, 22, 19, 59)), 'day');
  eq('phase: 20:00 is night', Engine.phase(d(2026, 11, 22, 20, 0)), 'night');

  /* ---- deterministic delivery ---- */
  const n = 60;
  ok('pick: same day and slot gives the same item', Engine.pickIndex(100, 'night', n) === Engine.pickIndex(100, 'night', n));
  ok('pick: night and morning of a day differ', Engine.pickIndex(100, 'night', n) !== Engine.pickIndex(100, 'morning', n));
  const seen = new Set();
  for (let i = 0; i < n / 2; i++) { seen.add(Engine.pickIndex(i, 'night', n)); seen.add(Engine.pickIndex(i, 'morning', n)); }
  eq('pick: 30 days covers every item once', seen.size, n);
  ok('pick: index is always inside the bank', Array.from({ length: 400 }, (_, i) => Engine.pickIndex(i, i % 2 ? 'morning' : 'night', n)).every((x) => x >= 0 && x < n));

  /* ---- streak ---- */
  function st(days) { return { answers: days.map((k) => ({ date: k, slot: 'night', id: 'x', choice: 0, correct: true })) }; }
  const t0 = d(2026, 11, 22, 21, 0);
  eq('streak: three days in a row counting today', Engine.streak(st(['2026-11-20', '2026-11-21', '2026-11-22']), t0), 3);
  eq('streak: today not done yet still counts yesterday back', Engine.streak(st(['2026-11-19', '2026-11-20', '2026-11-21']), t0), 3);
  eq('streak: one missed day inside the run is forgiven', Engine.streak(st(['2026-11-18', '2026-11-19', '2026-11-21', '2026-11-22']), t0), 4);
  eq('streak: two missed days in a row end the run', Engine.streak(st(['2026-11-10', '2026-11-11', '2026-11-12']), t0), 0);
  eq('streak: empty history is zero', Engine.streak(st([]), t0), 0);
  eq('best: longest run is remembered', Engine.bestStreak(st(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-10'])), 3);

  /* ---- profile ---- */
  const items = global.__PROBLEMS__ || [];
  if (items.length) {
    const p = items[0];
    const wrong = p.traps.findIndex((x) => x && x.tag);
    const s = {
      answers: [
        { date: '2026-11-22', slot: 'night', id: p.id, choice: wrong, correct: false },
        { date: '2026-11-21', slot: 'night', id: p.id, choice: null, correct: null, read: true }
      ]
    };
    const prof = Engine.tagProfile(s, items, t0, 7);
    const tag = p.traps[wrong].tag;
    eq('profile: wrong pick charges its trap once', prof[tag].wrong, 1);
    ok('profile: exposure counts the trap being on the board', prof[tag].exposure >= 1);
    const sum = Engine.summary(s, items, t0);
    eq('summary: a read-only record is not scored as wrong', sum.correct, 0);
    eq('summary: accuracy divides by scored answers only', Math.round(sum.accuracy * 100), 0);
    eq('summary: answered counts both records', sum.answered, 2);
    eq('detox: one proof and no urge is six minutes', Engine.detoxMinutes({ answers: [{ date: '2026-11-22' }], urges: [] }, t0), 6);
    eq('detox: one resisted urge adds eight minutes', Engine.detoxMinutes({ answers: [], urges: [{ date: '2026-11-22' }] }, t0), 8);
  }

  /* ---- alarm gate ---- */
  const gateState = (over) => Object.assign({
    alarm: { enabled: true, time: '07:00', dismissed: [], snoozeUntil: null, snoozes: { date: null, n: 0 } },
    answers: []
  }, over);
  ok('gate: open 30 minutes after wake with nothing answered', Engine.gateDue(gateState(), d(2026, 11, 22, 7, 30)));
  ok('gate: closed before the wake time', !Engine.gateDue(gateState(), d(2026, 11, 22, 6, 59)));
  ok('gate: closed after 90 minutes', !Engine.gateDue(gateState(), d(2026, 11, 22, 8, 31)));
  ok('gate: closed when the alarm is off', !Engine.gateDue(gateState({ alarm: { enabled: false, time: '07:00', dismissed: [] } }), d(2026, 11, 22, 7, 30)));
  ok('gate: closed once dismissed', !Engine.gateDue(gateState({ alarm: { enabled: true, time: '07:00', dismissed: ['2026-11-22'] } }), d(2026, 11, 22, 7, 30)));
  ok('gate: closed when the morning proof already has an answer', !Engine.gateDue(gateState({ answers: [{ date: '2026-11-22', slot: 'morning', id: 'x', choice: 1, correct: true }] }), d(2026, 11, 22, 7, 30)));
  ok('gate: a night answer does not close it', Engine.gateDue(gateState({ answers: [{ date: '2026-11-22', slot: 'night', id: 'x', choice: 1, correct: true }] }), d(2026, 11, 22, 7, 30)));

  /* ---- week strip ---- */
  const strip = Engine.weekStrip({ answers: [{ date: '2026-11-22' }] }, t0, 7);
  eq('week: strip is seven cells', strip.length, 7);
  ok('week: the last cell is today', strip[6].today === true);
  ok('week: an answered day is marked', strip[6].done === true && strip[5].done === false);

  /* ---- i18n parity ---- */
  const enKeys = Object.keys(I18n.dict.en).sort();
  const koKeys = Object.keys(I18n.dict.ko).sort();
  const missingKo = enKeys.filter((k) => !koKeys.includes(k));
  const missingEn = koKeys.filter((k) => !enKeys.includes(k));
  eq('i18n: every English key has Korean', missingKo, []);
  eq('i18n: every Korean key has English', missingEn, []);
  const koValues = Object.entries(I18n.dict.ko).filter(([k]) => !['app.name', 'common.lang'].includes(k)).map(([, v]) => v);
  ok('i18n: Korean strings actually contain Hangul', koValues.filter((v) => /[\uac00-\ud7a3]/.test(v)).length / koValues.length > 0.98, 'some Korean strings are not Korean');
  I18n.setLang('ko');
  eq('i18n: switching language changes the string', I18n.t('nav.today'), '오늘 밤');
  I18n.setLang('en');
  eq('i18n: unknown keys fall back to the key', I18n.t('nope.nope'), 'nope.nope');

  /* ---- the problem bank ---- */
  if (items.length) {
    eq('bank: 60 items', items.length, 60);
    eq('bank: every id is unique', new Set(items.map((i) => i.id)).size, items.length);
    eq('bank: six tracks of ten', Engine.TRACKS.map((tr) => items.filter((i) => i.track === tr).length), [10, 10, 10, 10, 10, 10]);
    ok('bank: every item has five options in both languages', items.every((i) => i.options_en.length === 5 && i.options_ko.length === 5));
    ok('bank: every answer index is inside the options', items.every((i) => i.answer >= 0 && i.answer < 5));
    ok('bank: the answer slot has no trap', items.every((i) => i.traps.length === 5 && i.traps[i.answer] === null));
    ok('bank: every decoy has a tag and three lines in both languages',
      items.every((i) => i.traps.every((tr, k) => k === i.answer || (tr && Engine.TAGS.includes(tr.tag) && tr.lines_en.length === 3 && tr.lines_ko.length === 3))));
    ok('bank: every Korean passage is Korean', items.every((i) => /[\uac00-\ud7a3]/.test(i.passage_ko)));
    ok('bank: no duplicate English options inside an item', items.every((i) => new Set(i.options_en.map((x) => x.toLowerCase())).size === 5));
    const tagCount = {};
    items.forEach((i) => i.traps.forEach((tr) => { if (tr) tagCount[tr.tag] = (tagCount[tr.tag] || 0) + 1; }));
    eq('bank: all eight traps appear', Engine.TAGS.filter((tg) => !tagCount[tg]), []);
    ok('bank: answer positions are spread', new Set(items.map((i) => i.answer)).size >= 4);
    ok('bank: question types vary', new Set(items.map((i) => i.question_type)).size >= 4);
  }

  /* ---- coach prompt ---- */
  const prompt = Coach.buildPrompt({ passage: 'P', prompt: 'Q', choice: 'C', trapName: 'T', key: 'K', wrong: 2, exposure: 5, accuracy: 50 }, 'en');
  ok('coach: the prompt carries the tally, not a generic question', prompt.includes('2 times') && prompt.includes('5 times'));
  ok('coach: the prompt forbids invention', prompt.toLowerCase().includes('invent nothing'));

  global.__TEST_RESULTS__ = results;
  const passed = results.filter((r) => r.pass).length;
  global.__TEST_SUMMARY__ = passed + '/' + results.length;

  if (typeof document !== 'undefined') {
    const root = document.getElementById('out');
    if (root) {
      root.innerHTML = `<p class="sum">${passed}/${results.length} passed</p><ul>` +
        results.map((r) => `<li class="${r.pass ? 'p' : 'f'}"><b>${r.pass ? 'PASS' : 'FAIL'}</b> ${r.name}${r.pass ? '' : ' — ' + r.detail}</li>`).join('') + '</ul>';
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
