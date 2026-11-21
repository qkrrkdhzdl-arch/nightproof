/* Nightproof — one proof before sleep, one after you wake.
 * Pure logic: no DOM, no storage. Tested by tests.html. */
(function (global) {
  const NP = global.NP || (global.NP = {});

  const TRACKS = ['condition', 'quantity', 'cause', 'sample', 'assumption', 'language'];
  const TAGS = [
    'necessary_sufficient',
    'hasty_generalization',
    'affirming_consequent',
    'causal_confusion',
    'scope_shift',
    'false_dilemma',
    'authority_anecdote',
    'strawman_equivocation'
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function dayNumber(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  /* Which part of the ritual a moment belongs to.
   * night  20:00-03:59   morning 04:00-11:59   day 12:00-19:59 */
  function phase(now) {
    const h = now.getHours();
    if (h >= 20 || h < 4) return 'night';
    if (h < 12) return 'morning';
    return 'day';
  }

  /* The problem served for a given day and slot. Deterministic: the same day and
   * slot always return the same item, so the app cannot re-roll for an easier one. */
  function pickIndex(dayNum, slotName, count) {
    const offset = slotName === 'morning' ? 1 : 0;
    const step = 23; // coprime with the set sizes we ship, so the walk visits every item
    return (((dayNum * 2 + offset) * step) % count + count) % count;
  }

  function pick(problems, dayNum, slotName) {
    return problems[pickIndex(dayNum, slotName, problems.length)];
  }

  function answersOf(state) {
    return (state && state.answers) || [];
  }

  function answered(state, key, slotName) {
    return answersOf(state).find((a) => a.date === key && a.slot === slotName);
  }

  /* Streak in days. A day counts when at least one proof was answered (or read)
   * that day. The streak survives the current day not being done yet, and one
   * missed day per rolling week is forgiven (freeze). */
  function keyOfDayNumber(n) {
    const d = new Date(n * 86400000);
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }

  function streak(state, now) {
    const done = new Set(answersOf(state).map((a) => a.date));
    const today = dayNumber(now);
    let cursor = done.has(dateKey(now)) ? today : today - 1;
    let count = 0;
    let gaps = 0;
    for (let i = 0; i < 400; i++) {
      if (done.has(keyOfDayNumber(cursor))) {
        count += 1;
      } else {
        gaps += 1;
        if (gaps >= 2) break; // one missed day in a run is forgiven, two end it
      }
      cursor -= 1;
    }
    return count;
  }

  function bestStreak(state) {
    const answers = answersOf(state);
    const days = Array.from(new Set(answers.map((a) => Date.parse(a.date + 'T00:00:00Z') / 86400000))).sort((a, b) => a - b);
    let best = 0, run = 0, prev = null;
    for (const d of days) {
      run = prev !== null && d === prev + 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    }
    return best;
  }

  function withinDays(key, now, days) {
    const t = Date.parse(key + 'T00:00:00Z');
    const today = dayNumber(now) * 86400000;
    return t > today - days * 86400000 && t <= today + 86400000;
  }

  /* Tag profile: every wrong pick is charged to the trap it fell into. Exposure
   * counts how often a trap was on the board at all, so a rare trap is not
   * punished for being rare. */
  function tagProfile(state, problems, now, days) {
    const answers = answersOf(state).filter((a) => withinDays(a.date, now, days));
    const out = {};
    for (const tag of TAGS) out[tag] = { wrong: 0, exposure: 0 };
    for (const a of answers) {
      const p = problems.find((x) => x.id === a.id);
      if (!p) continue;
      (p.traps || []).forEach((t) => { if (t) out[t.tag].exposure += 1; });
      if (!a.correct) {
        const trap = (p.traps || [])[a.choice];
        if (trap) out[trap.tag].wrong += 1;
      }
    }
    return out;
  }

  function trackProfile(state, problems, now) {
    const answers = answersOf(state).filter((a) => withinDays(a.date, now, 7));
    const out = {};
    for (const t of TRACKS) out[t] = { seen: 0, correct: 0 };
    for (const a of answers) {
      const p = problems.find((x) => x.id === a.id);
      if (!p) continue;
      out[p.track].seen += 1;
      if (a.correct) out[p.track].correct += 1;
    }
    return out;
  }

  function weakest(profile, n) {
    return Object.entries(profile)
      .filter(([, v]) => v.wrong > 0)
      .sort((a, b) => (b[1].wrong - a[1].wrong) || (a[1].exposure - b[1].exposure))
      .slice(0, n || 2)
      .map(([tag, v]) => ({ tag, wrong: v.wrong, exposure: v.exposure }));
  }

  function summary(state, problems, now) {
    const answers = answersOf(state).filter((a) => withinDays(a.date, now, 7));
    const scored = answers.filter((a) => typeof a.correct === 'boolean');
    const correct = scored.filter((a) => a.correct).length;
    return {
      answered: answers.length,
      correct,
      accuracy: scored.length ? correct / scored.length : 0,
      streak: streak(state, now),
      best: bestStreak(state),
      tags: tagProfile(state, problems, now, 7),
      tracks: trackProfile(state, problems, now),
      urges: (state.urges || []).filter((u) => withinDays(u.date, now, 7)).length
    };
  }

  /* Detox minutes: a resisted urge is counted at the documented 8-minute
   * estimate, a solved proof at 6 minutes of reading it replaces. Both are
   * self-report estimates, stated as such in the app. */
  const URGE_MINUTES = 8;
  const PROOF_MINUTES = 6;

  function detoxMinutes(state, now) {
    const urges = (state.urges || []).filter((u) => withinDays(u.date, now, 7)).length;
    const answers = answersOf(state).filter((a) => withinDays(a.date, now, 7)).length;
    return urges * URGE_MINUTES + answers * PROOF_MINUTES;
  }

  /* The alarm gate: open when the alarm is on, the morning proof is unanswered,
   * and the clock is inside the first 90 minutes after the wake time. */
  function gateDue(state, now) {
    const cfg = state.alarm || {};
    if (!cfg.enabled) return false;
    const [h, m] = String(cfg.time || '07:00').split(':').map(Number);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    const minute = (now - start) / 60000;
    if (minute < 0 || minute > 90) return false;
    const key = dateKey(now);
    if ((cfg.dismissed || []).includes(key)) return false;
    if (answered(state, key, 'morning')) return false;
    return true;
  }

  /* A 7-day strip for the streak view: newest last. */
  function weekStrip(state, now, days) {
    const n = days || 7;
    const done = new Set(answersOf(state).map((a) => a.date));
    const out = [];
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base.getTime() - i * 86400000);
      const key = dateKey(d);
      out.push({ key, label: d.getDate(), done: done.has(key), today: i === 0 });
    }
    return out;
  }

  NP.Engine = {
    TRACKS, TAGS, URGE_MINUTES, PROOF_MINUTES,
    dateKey, dayNumber, phase, pickIndex, pick, answered, answersOf,
    streak, bestStreak, tagProfile, trackProfile, weakest, summary,
    detoxMinutes, gateDue, weekStrip, withinDays
  };
})(typeof window !== 'undefined' ? window : globalThis);
