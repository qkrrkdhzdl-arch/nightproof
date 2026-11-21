/* Nightproof — interface. Vanilla JS, no build step, all state on this device. */
(function () {
  const { Engine, I18n, Coach } = window.NP || {};
  const t = (k, v) => I18n.t(k, v);
  const STORE = 'nightproof.v1';

  let state = null;
  let problems = [];
  let route = 'today';
  let puzzle = { slot: null, reveal: false, note: null, noteBusy: false, noteErr: null };
  let gate = { open: false, preview: false, choice: null, reveal: false };
  let coachUi = { busy: false, progress: 0, err: null };

  /* ---------- state ---------- */

  function defaults() {
    return {
      lang: null,
      bed: '23:00',
      wake: '07:00',
      alarm: { enabled: true, time: '07:00', dismissed: [], snoozeUntil: null, snoozes: { date: null, n: 0 } },
      answers: [],
      urges: [],
      onboarded: false,
      coach: false
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      const base = defaults();
      const merged = Object.assign({}, base, parsed, { alarm: Object.assign({}, base.alarm, parsed.alarm || {}) });
      const validTime = (v) => typeof v === 'string' && v.length === 5 && v[2] === ':' && !isNaN(Number(v.slice(0, 2))) && !isNaN(Number(v.slice(3)));
      if (!validTime(merged.bed)) merged.bed = defaults().bed;
      if (!validTime(merged.wake)) merged.wake = defaults().wake;
      if (!validTime(merged.alarm.time)) merged.alarm.time = merged.wake;
      return merged;
    } catch (e) {
      return defaults();
    }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function detectLang() {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (const l of list) {
      if (String(l).toLowerCase().startsWith('ko')) return 'ko';
      if (String(l).toLowerCase().startsWith('en')) return 'en';
    }
    return 'en';
  }

  const now = () => new Date();
  const todayKey = () => Engine.dateKey(now());
  const L = (obj, field) => obj[field + '_' + I18n.getLang()] || obj[field + '_en'];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function problemFor(slot) {
    return Engine.pick(problems, Engine.dayNumber(now()), slot);
  }

  function record() {
    return Engine.answered(state, todayKey(), puzzle.slot);
  }

  /* ---------- chrome ---------- */

  function header() {
    const tabs = [['today', 'nav.today'], ['progress', 'nav.progress'], ['about', 'nav.about'], ['settings', 'nav.settings']];
    return `
      <header class="top">
        <a class="brand" href="#today" data-act="route" data-route="today">
          <span class="brand-mark" aria-hidden="true">◐</span>
          <span class="brand-name">${t('app.name')}</span>
        </a>
        <nav class="tabs">
          ${tabs.map(([r, k]) => `<a href="#${r}" data-act="route" data-route="${r}" class="tab${route === r ? ' on' : ''}">${t(k)}</a>`).join('')}
        </nav>
        <button class="lang" data-act="lang" aria-label="Language">${t('common.lang')}</button>
      </header>`;
  }

  function weekStrip(days) {
    const cells = Engine.weekStrip(state, now(), days || 7).map((d) => `
      <div class="day${d.done ? ' done' : ''}${d.today ? ' today' : ''}">
        <span class="day-n">${d.label}</span>
        <span class="day-dot" aria-hidden="true"></span>
      </div>`).join('');
    return `<div class="week" role="img" aria-label="${t('today.week')}">${cells}</div>`;
  }

  function statTile(value, label) {
    return `<div class="tile"><div class="tile-v">${value}</div><div class="tile-k">${label}</div></div>`;
  }

  /* ---------- today ---------- */

  function todayView() {
    const p = Engine.phase(now());
    const key = todayKey();
    const morningDone = !!Engine.answered(state, key, 'morning');
    const nightDone = !!Engine.answered(state, key, 'night');
    const s = Engine.summary(state, problems, now());
    const detox = Engine.detoxMinutes(state, now());
    const primary = p === 'morning' ? 'morning' : 'night';
    const primaryDone = primary === 'morning' ? morningDone : nightDone;
    const yesterday = Engine.weekStrip(state, now(), 3)[1];
    const missed = yesterday && !yesterday.done && state.answers.length > 0;

    const card = (slot, done, labelKey, openKey, locked) => {
      const item = problemFor(slot);
      return `
        <div class="card proof-card${locked ? ' locked' : ''}${done ? ' done' : ''}">
          <div class="proof-top">
            <span class="eyebrow">${t(labelKey)}</span>
            <span class="chip">${esc(I18n.trackName(item.track))}</span>
            <span class="chip ghost">${t('common.level')} ${item.level}</span>
          </div>
          <p class="proof-teaser">${esc(L(item, 'prompt'))}</p>
          ${done
            ? `<button class="btn ghost wide" data-act="open" data-slot="${slot}">✓ ${t(slot === 'morning' ? 'today.doneMorning' : 'today.doneNight')} · ${t('common.review')}</button>`
            : locked
              ? `<div class="proof-state">${t(slot === 'morning' ? 'today.waitMorning' : 'today.waitNight')}</div>`
              : `<button class="btn primary wide" data-act="open" data-slot="${slot}">${t(openKey)}</button>`}
        </div>`;
    };

    const showMorning = primary === 'morning' || morningDone || p === 'day';
    const showNight = primary === 'night' || p === 'day';

    return `
      ${header()}
      <main class="wrap">
        <section class="hero-block">
          <h1 class="hero-line">${t(p === 'morning' ? 'today.heroMorning' : p === 'night' ? 'today.heroNight' : 'today.heroDay')}</h1>
          <p class="hero-sub">${t(p === 'morning' ? 'today.subMorning' : p === 'night' ? 'today.subNight' : 'today.subDay')}</p>
        </section>

        ${showMorning && p !== 'night' ? card('morning', morningDone, 'today.morning', 'today.openMorning', false) : ''}
        ${showNight ? card('night', nightDone, 'today.night', 'today.openNight', p === 'day' && !nightDone) : ''}

        <div class="tiles">
          ${statTile(s.streak, t('today.streakLabel'))}
          ${statTile(detox, t('today.detoxLabel'))}
          ${statTile(Math.round(s.accuracy * 100) + '%', t('progress.accuracy'))}
        </div>

        <section class="block">
          <div class="block-head"><h2>${t('today.week')}</h2>${missed ? `<span class="warn">${t('today.catchUp')}</span>` : ''}</div>
          ${weekStrip(7)}
        </section>

        <button class="urge" data-act="urge">
          <span class="urge-title">${t('today.urge')}</span>
          <span class="urge-sub">${t('today.urgeHint')}</span>
        </button>

        <footer class="foot">${t('app.tag')} · ${t('onboard.note')}</footer>
      </main>`;
  }

  /* ---------- solve ---------- */

  function solveView() {
    const slot = puzzle.slot || (Engine.phase(now()) === 'morning' ? 'morning' : 'night');
    puzzle.slot = slot;
    const item = problemFor(slot);
    const rec = Engine.answered(state, todayKey(), slot);
    const chosen = rec ? rec.choice : null;
    const answered = !!rec;
    const correct = rec && rec.correct === true;

    return `
      ${header()}
      <main class="wrap solve">
        <div class="solve-head">
          <button class="link" data-act="route" data-route="today">← ${t('common.back')}</button>
          <div class="meta">
            <span class="chip">${esc(I18n.trackName(item.track))}</span>
            <span class="chip ghost">${t('common.level')} ${item.level}</span>
          </div>
        </div>

        <article class="paper">
          <p class="passage">${esc(L(item, 'passage'))}</p>
          <p class="prompt">${esc(L(item, 'prompt'))}</p>
          <ol class="options">
            ${(item['options_' + I18n.getLang()] || item.options_en).map((opt, i) => {
              const cls = answered
                ? (i === item.answer ? ' right' : (i === chosen ? ' wrong' : ' dim'))
                : '';
              return `<li><button class="opt${cls}" data-act="pick" data-i="${i}" ${answered ? 'disabled' : ''}>
                <span class="num">${i + 1}</span><span class="opt-text">${esc(opt)}</span></button></li>`;
            }).join('')}
          </ol>
          ${!answered ? `<p class="hint">${t('solve.hint')}</p>` : feedback(item, chosen, correct)}
        </article>

        ${answered ? solutionBlock(item) : ''}
        ${answered ? avoidedBlock(item, chosen) : ''}
        ${answered && !correct ? coachBlock(item, chosen) : ''}
        ${answered ? `<div class="solve-foot"><button class="btn primary wide" data-act="route" data-route="today">${t('common.next')}</button>
          <p class="fine center">${t('solve.finished')}</p></div>` : ''}
      </main>`;
  }

  function feedback(item, chosen, correct) {
    if (correct) {
      return `<div class="fb ok"><div class="fb-head">✓ ${t('solve.correct')}</div>
        <p class="fb-line">${t('solve.whyTitle')} ↓</p></div>`;
    }
    const trap = item.traps[chosen] || null;
    if (!trap) return '';
    const lines = trap['lines_' + I18n.getLang()] || trap.lines_en;
    return `
      <div class="fb bad">
        <div class="fb-head">${t('solve.wrong')}</div>
        <p class="fb-yourpick">${t('solve.yourPick')} ${chosen + 1}. ${esc((item['options_' + I18n.getLang()] || item.options_en)[chosen])}</p>
        <div class="trap-card">
          <div class="trap-top"><span class="tag">${esc(I18n.tagName(trap.tag))}</span><span class="trap-label">${t('solve.trapTitle')}</span></div>
          <ol class="trap-lines">${lines.slice(0, 3).map((l) => `<li>${esc(l)}</li>`).join('')}</ol>
          <p class="drill"><span>${t('progress.drill')}</span> ${esc(I18n.tagDrill(trap.tag))}</p>
        </div>
      </div>`;
  }

  function solutionBlock(item) {
    return `<section class="block solution">
      <h2>${t('solve.whyTitle')}</h2>
      <p>${esc(L(item, 'solution'))}</p>
    </section>`;
  }

  function avoidedBlock(item, chosen) {
    const rows = item.traps.map((tr, i) => {
      if (!tr) return '';
      return `<li class="avoid${i === chosen ? ' hit' : ''}">
        <span class="tag">${esc(I18n.tagName(tr.tag))}</span>
        <span class="avoid-text">${esc((item['options_' + I18n.getLang()] || item.options_en)[i])}</span>
      </li>`;
    }).join('');
    return `<details class="block avoided">
      <summary><h2>${t('solve.avoidedTitle')}</h2><span class="hint-inline">${t('solve.avoidedHint')}</span></summary>
      <ul class="avoid-list">${rows}</ul>
    </details>`;
  }

  const key = (i) => ['A', 'B', 'C', 'D', 'E'][i];

  function coachBlock(item, chosen) {
    const trap = item.traps[chosen];
    const profile = Engine.tagProfile(state, problems, now(), 7);
    const tally = profile[trap ? trap.tag : ''] || { wrong: 0, exposure: 0 };
    const head = `<h2>${t('coach.title')}</h2>`;
    const tallyLine = `<p class="fine">${esc(I18n.tagName(trap.tag))} · ${esc(t('progress.weakLine', { w: tally.wrong, e: tally.exposure }))}</p>`;

    if (Coach.status === 'ready') {
      if (puzzle.note) {
        return `<section class="block coach">${head}
          <p class="coach-note">${esc(puzzle.note)}</p>
          <p class="fine">${t('coach.disclaimer')}</p></section>`;
      }
      return `<section class="block coach">${head}${tallyLine}
        <button class="btn" data-act="coach" ${puzzle.noteBusy ? 'disabled' : ''}>${puzzle.noteBusy ? t('coach.thinking') : t('coach.ask')}</button>
        ${puzzle.noteErr ? `<p class="warn">${esc(puzzle.noteErr)}</p>` : ''}
        <p class="fine">${t('coach.disclaimer')}</p></section>`;
    }
    if (Coach.status === 'loading' || Coach.status === 'checking') {
      return `<section class="block coach">${head}<p class="fine">${t('coach.loading', { p: Coach.progress })}</p></section>`;
    }
    if (Coach.status === 'unavailable') {
      return `<section class="block coach">${head}<p class="fine">${t('coach.unavailable')}</p></section>`;
    }
    return `<section class="block coach">${head}
      <p class="fine">${t('coach.notLoaded')}</p>
      <button class="btn ghost" data-act="coach-check">${t('coach.check')}</button>
      ${puzzle.noteErr ? `<p class="warn">${esc(puzzle.noteErr)}</p>` : ''}</section>`;
  }

  /* ---------- progress ---------- */

  function radarSvg(tags) {
    const n = Engine.TAGS.length;
    const cx = 150, cy = 150, R = 96;
    const vals = Engine.TAGS.map((tg) => (tags[tg] ? tags[tg].wrong : 0));
    const max = Math.max(3, ...vals);
    const pt = (i, r) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const rings = [0.33, 0.66, 1].map((f) => {
      const pts = Array.from({ length: n }, (_, i) => pt(i, R * f).map((x) => x.toFixed(1)).join(',')).join(' ');
      return `<polygon points="${pts}" class="ring${f === 1 ? ' outer' : ''}"/>`;
    }).join('');
    const spokes = Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(i, R);
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="spoke"/>`;
    }).join('');
    const shape = Array.from({ length: n }, (_, i) => pt(i, R * (0.12 + 0.88 * (vals[i] / max))).map((x) => x.toFixed(1)).join(',')).join(' ');
    const labels = Engine.TAGS.map((tg, i) => {
      const [x, y] = pt(i, R + 20);
      const anchor = Math.abs(x - cx) < 12 ? 'middle' : x > cx ? 'start' : 'end';
      return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}" class="rl">${esc(shortTag(tg))}</text>`;
    }).join('');
    return `<svg viewBox="0 0 300 300" class="radar" role="img" aria-label="${t('progress.radar')}">
      ${rings}${spokes}<polygon points="${shape}" class="shape"/>${labels}</svg>`;
  }

  function shortTag(tag) {
    const names = {
      necessary_sufficient: ['need / suff', '필요·충분'],
      hasty_generalization: ['hasty gen.', '성급한 일반화'],
      affirming_consequent: ['consequent', '후건 긍정'],
      causal_confusion: ['cause', '인과 혼동'],
      scope_shift: ['scope', '범위 이동'],
      false_dilemma: ['dilemma', '거짓 이분법'],
      authority_anecdote: ['authority', '권위·일화'],
      strawman_equivocation: ['claim moved', '논점 변경']
    };
    const pair = names[tag] || [tag, tag];
    return I18n.getLang() === 'ko' ? pair[1] : pair[0];
  }

  function progressView() {
    const s = Engine.summary(state, problems, now());
    const weak = Engine.weakest(s.tags, 2);
    const total = s.answered || 1;
    return `
      ${header()}
      <main class="wrap">
        <section class="hero-block"><h1 class="hero-line">${t('progress.title')}</h1>
          <p class="hero-sub">${t('progress.sub')}</p></section>
        ${s.answered === 0 ? `<section class="block empty"><p>${t('progress.empty')}</p></section>` : ''}
        <div class="tiles four">
          ${statTile(s.answered, t('progress.answered'))}
          ${statTile(Math.round(s.accuracy * 100) + '%', t('progress.accuracy'))}
          ${statTile(s.streak, t('progress.streak'))}
          ${statTile(s.best, t('progress.best'))}
        </div>
        <section class="block radar-block">
          <h2>${t('progress.radar')}</h2>
          <p class="fine">${t('progress.radarHint')}</p>
          ${radarSvg(s.tags)}
        </section>
        <section class="block">
          <h2>${t('progress.weak')}</h2>
          ${weak.length === 0 ? `<p class="fine">${t('progress.weakNone')}</p>` : weak.map((w) => `
            <div class="weak-row">
              <div class="weak-top"><span class="tag">${esc(I18n.tagName(w.tag))}</span>
                <span class="fine">${t('progress.weakLine', { w: w.wrong, e: w.exposure })}</span></div>
              <p class="drill"><span>${t('progress.drill')}</span> ${esc(I18n.tagDrill(w.tag))}</p>
            </div>`).join('')}
        </section>
        <section class="block">
          <h2>${t('progress.tracks')}</h2>
          <div class="bars">
            ${Engine.TRACKS.map((tr) => {
              const v = s.tracks[tr];
              const pct = v.seen ? Math.round((v.correct / v.seen) * 100) : 0;
              return `<div class="bar-row"><span class="bar-k">${esc(I18n.trackName(tr))}</span>
                <span class="bar"><i style="width:${pct}%"></i></span>
                <span class="bar-v">${v.seen ? pct + '%' : '—'}</span></div>`;
            }).join('')}
          </div>
        </section>
        <section class="block"><h2>${t('today.week')}</h2>${weekStrip(7)}</section>
      </main>`;
  }

  /* ---------- about, settings ---------- */

  function aboutView() {
    return `
      ${header()}
      <main class="wrap prose">
        <section class="hero-block"><h1 class="hero-line">${t('about.title')}</h1></section>
        <p>${t('about.p1')}</p>
        <p>${t('about.p2')}</p>
        <p>${t('about.p3')}</p>
        <p>${t('about.p4')}</p>
        <h2>${t('about.limits')}</h2>
        <ul class="bullets"><li>${t('about.limit1')}</li><li>${t('about.limit2')}</li><li>${t('about.limit3')}</li></ul>
        <h2>${t('about.credits')}</h2>
        <ul class="bullets"><li>${t('about.credit1')}</li><li>${t('about.credit2')}</li><li>${t('about.credit3')}</li></ul>
        <p class="fine">github.com/qkrrkdhzdl-arch/nightproof</p>
      </main>`;
  }

  function settingsView() {
    const c = Coach.status;
    return `
      ${header()}
      <main class="wrap prose">
        <section class="hero-block"><h1 class="hero-line">${t('settings.title')}</h1></section>
        <div class="setting"><span>${t('settings.lang')}</span>
          <button class="btn ghost" data-act="lang">${t('common.lang')}</button></div>
        <div class="setting"><label for="bed">${t('settings.bed')}</label>
          <input id="bed" type="time" value="${state.bed}" data-act="bed"></div>
        <div class="setting"><label for="wake">${t('settings.wake')}</label>
          <input id="wake" type="time" value="${state.wake}" data-act="wake"></div>
        <div class="setting"><span>${t('settings.alarm')}</span>
          <label class="switch"><input type="checkbox" data-act="alarm" ${state.alarm.enabled ? 'checked' : ''}><i></i></label></div>
        <p class="fine">${t('settings.alarmHint')}</p>
        <button class="btn ghost" data-act="gate-preview">${t('settings.gatePreview')}</button>
        <div class="setting"><span>${t('settings.coach')}</span>
          <span class="row">
            <span class="${c === 'ready' ? 'ok-pill' : 'fine'}">${c === 'ready' ? t('settings.coachReady') : c === 'checking' ? t('settings.coachChecking') : c === 'unavailable' ? t('settings.coachNone') : t('settings.coachOff')}</span>
            <button class="btn ghost" data-act="coach-check">${t('coach.check')}</button>
          </span>
        </div>
        <p class="fine">${t('settings.coachHint')}</p>
        ${coachUi.err ? `<p class="warn">${esc(coachUi.err)}</p>` : ''}
        ${coachUi.detail ? `<p class="fine mono">${esc(coachUi.detail)}</p>` : ''}
        <div class="setting"><span>${t('settings.data')}</span>
          <span class="row">
            <button class="btn ghost" data-act="export">${t('settings.export')}</button>
            <button class="btn ghost" data-act="import">${t('settings.import')}</button>
          </span>
        </div>
        <div class="setting"><span>${t('settings.reset')}</span>
          <button class="btn danger" data-act="reset">${t('settings.reset')}</button></div>
        <p class="fine">${t('app.name')} · ${t('app.tag')}</p>
      </main>`;
  }

  /* ---------- overlays ---------- */

  function onboarding() {
    return `
      <div class="overlay" id="ob">
        <div class="sheet">
          <div class="brand big"><span class="brand-mark">◐</span> <span class="brand-name">${t('app.name')}</span></div>
          <h2>${t('onboard.title')}</h2>
          <p>${t('onboard.body')}</p>
          <label class="field">${t('onboard.bed')}
            <input type="time" id="ob-bed" value="${state.bed}"></label>
          <label class="field">${t('onboard.wake')}
            <input type="time" id="ob-wake" value="${state.wake}"></label>
          <label class="check"><input type="checkbox" id="ob-alarm" ${state.alarm.enabled ? 'checked' : ''}> ${t('onboard.alarm')}</label>
          <button class="btn primary wide" data-act="ob-start">${t('onboard.start')}</button>
          <p class="fine">${t('onboard.note')}</p>
        </div>
      </div>`;
  }

  function urgeOverlay() {
    return `
      <div class="overlay" id="urge">
        <div class="sheet">
          <h2>${t('urge.title')}</h2>
          <p>${t('urge.body')}</p>
          <label class="field">${t('urge.why')}
            <input type="text" id="urge-note" placeholder="${t('urge.placeholder')}" maxlength="80"></label>
          <button class="btn primary wide" data-act="urge-done">${t('common.answer')}</button>
          <button class="link center" data-act="urge-skip">${t('urge.skip')}</button>
        </div>
      </div>`;
  }

  function gateOverlay() {
    const item = problemFor('morning');
    const trap = gate.choice !== null ? item.traps[gate.choice] : null;
    const right = gate.choice === item.answer;
    return `
      <div class="overlay gate">
        <div class="gate-box">
          <span class="eyebrow">${t('gate.eyebrow')}${gate.preview ? ' · ' + t('gate.previewTag') : ''}</span>
          ${gate.preview ? `<p class="fine">${t('gate.previewBody')}</p>` : ''}
          <h2 class="gate-title">${t('gate.title')}</h2>
          <p class="gate-body">${t('gate.body')}</p>
          <article class="paper gate-paper">
            <p class="passage">${esc(L(item, 'passage'))}</p>
            <p class="prompt">${esc(L(item, 'prompt'))}</p>
            <ol class="options">
              ${item['options_' + I18n.getLang()].map((opt, i) => `<li><button class="opt${gate.reveal && i === item.answer ? ' right' : ''}${gate.choice === i && !right ? ' wrong' : ''}" data-act="gate-pick" data-i="${i}">
                <span class="num">${i + 1}</span><span class="opt-text">${esc(opt)}</span></button></li>`).join('')}
            </ol>
          </article>
          ${trap ? `<div class="trap-card"><div class="trap-top"><span class="tag">${esc(I18n.tagName(trap.tag))}</span><span class="trap-label">${t('solve.trapTitle')}</span></div>
            <ol class="trap-lines">${(trap['lines_' + I18n.getLang()] || trap.lines_en).map((l) => `<li>${esc(l)}</li>`).join('')}</ol></div>` : ''}
          ${right && !gate.reveal ? `<p class="gate-right">✓ ${t('solve.correct')}</p>` : ''}
          ${gate.reveal ? `<p class="gate-body">${esc(L(item, 'solution'))}</p>` : ''}
          <div class="gate-actions">
            ${right ? `<button class="btn primary" data-act="gate-close">${t('common.next')}</button>` : ''}
            <button class="btn ghost" data-act="gate-read">${t('gate.read')}</button>
            ${gate.preview ? `<button class="btn ghost" data-act="gate-close">${t('common.close')}</button>`
              : `<button class="btn ghost" data-act="gate-snooze">${t('gate.snooze')} · ${remainingSnoozes()} ${t('gate.snoozesLeft')}</button>`}
          </div>
        </div>
      </div>`;
  }

  function remainingSnoozes() {
    const s = state.alarm.snoozes || { date: null, n: 0 };
    return s.date === todayKey() ? Math.max(0, 2 - s.n) : 2;
  }

  /* ---------- render ---------- */

  function render() {
    const app = document.getElementById('app');
    let view = '';
    if (route === 'solve') view = solveView();
    else if (route === 'progress') view = progressView();
    else if (route === 'about') view = aboutView();
    else if (route === 'settings') view = settingsView();
    else view = todayView();
    app.innerHTML = view;

    const overlays = document.getElementById('overlays');
    let html = '';
    if (!state.onboarded) html += onboarding();
    if (gate.open && state.onboarded) html += gateOverlay();
    if (document.getElementById('urge')) { /* keep open across renders */ }
    overlays.innerHTML = html;
    if (window.__urgeOpen) overlays.innerHTML += urgeOverlay();
  }

  function rerender() { render(); }

  function toast(msg) {
    const box = document.getElementById('toast');
    box.textContent = msg;
    box.classList.add('on');
    clearTimeout(box._t);
    box._t = setTimeout(() => box.classList.remove('on'), 2200);
  }

  /* ---------- actions ---------- */

  function goHash(r) {
    route = r;
    if (location.hash !== '#' + r) location.hash = r;
    window.scrollTo({ top: 0 });
    render();
  }

  function pick(i) {
    if (record()) return;
    const item = problemFor(puzzle.slot);
    const correct = i === item.answer;
    state.answers.push({ date: todayKey(), slot: puzzle.slot, id: item.id, choice: i, correct, ts: Date.now() });
    save();
    rerender();
  }

  function markRead() {
    if (record()) return;
    const item = problemFor(puzzle.slot);
    state.answers.push({ date: todayKey(), slot: puzzle.slot, id: item.id, choice: null, correct: null, read: true, ts: Date.now() });
    save();
    rerender();
  }

  async function askCoach() {
    const rec = record();
    if (!rec || rec.correct !== false) return;
    const item = problemFor(puzzle.slot);
    const trap = item.traps[rec.choice];
    puzzle.noteBusy = true;
    puzzle.noteErr = null;
    rerender();
    try {
      await Coach.ensure();
      rerender();
      puzzle.note = await Coach.note({
        lines: trap['lines_' + I18n.getLang()] || trap.lines_en,
        trapName: I18n.tagName(trap.tag)
      }, I18n.getLang());
    } catch (err) {
      puzzle.noteErr = t('coach.failed') + ' (' + String((err && err.message) || err).slice(0, 90) + ')';
    }
    puzzle.noteBusy = false;
    rerender();
  }

  async function coachCheck() {
    coachUi.busy = true;
    coachUi.err = null;
    coachUi.detail = null;
    rerender();
    try {
      const st = await Coach.probe();
      state.coach = st === 'ready' || st === 'idle';
      save();
    } catch (e) {
      coachUi.err = t('coach.failed');
      coachUi.detail = String((Coach.error || e || '').slice(0, 140));
    }
    coachUi.busy = false;
    rerender();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nightproof-' + todayKey() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      file.text().then((txt) => {
        try {
          const parsed = JSON.parse(txt);
          if (!Array.isArray(parsed.answers)) throw new Error('shape');
          state = Object.assign(defaults(), parsed, { alarm: Object.assign(defaults().alarm, parsed.alarm || {}) });
          save();
          toast(t('settings.imported', { n: parsed.answers.length }));
          rerender();
        } catch (e) {
          toast(t('settings.importFail'));
        }
      });
    };
    input.click();
  }

  function reset() {
    if (!confirm(t('settings.resetConfirm'))) return;
    state = defaults();
    state.onboarded = true;
    state.lang = I18n.getLang();
    save();
    rerender();
  }

  function checkGate() {
    if (!state || !state.onboarded) return;
    const due = Engine.gateDue(state, now());
    const snoozed = state.alarm.snoozeUntil && Date.now() < Date.parse(state.alarm.snoozeUntil);
    const shouldOpen = due && !snoozed;
    if (shouldOpen !== gate.open) {
      gate.open = shouldOpen;
      gate.preview = false;
      gate.choice = null;
      gate.reveal = false;
      rerender();
    }
  }

  /* ---------- events ---------- */

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'route') { e.preventDefault(); goHash(el.dataset.route); return; }
    if (act === 'lang') {
      const next = I18n.getLang() === 'ko' ? 'en' : 'ko';
      I18n.setLang(next);
      state.lang = next;
      save();
      rerender();
      return;
    }
    if (act === 'open') { puzzle = { slot: el.dataset.slot, note: null, noteBusy: false, noteErr: null }; goHash('solve'); return; }
    if (act === 'pick') { pick(Number(el.dataset.i)); return; }
    if (act === 'coach') { askCoach(); return; }
    if (act === 'ob-start') {
      state.bed = document.getElementById('ob-bed').value || state.bed;
      state.wake = document.getElementById('ob-wake').value || state.wake;
      state.alarm.time = state.wake;
      state.alarm.enabled = document.getElementById('ob-alarm').checked;
      state.onboarded = true;
      state.lang = I18n.getLang();
      save();
      rerender();
      checkGate();
      return;
    }
    if (act === 'urge') { window.__urgeOpen = true; render(); document.getElementById('urge-note')?.focus(); return; }
    if (act === 'urge-done' || act === 'urge-skip') {
      const note = (document.getElementById('urge-note')?.value || '').slice(0, 80);
      state.urges.push({ date: todayKey(), ts: Date.now(), note });
      save();
      window.__urgeOpen = false;
      render();
      toast(t('urge.done'));
      return;
    }
    if (act === 'gate-pick') {
      const i = Number(el.dataset.i);
      const item = problemFor('morning');
      gate.choice = i;
      if (gate.preview) { rerender(); return; }
      if (i === item.answer) {
        if (!Engine.answered(state, todayKey(), 'morning')) {
          state.answers.push({ date: todayKey(), slot: 'morning', id: item.id, choice: i, correct: true, ts: Date.now() });
          state.alarm.dismissed.push(todayKey());
        }
        save();
      }
      rerender();
      return;
    }
    if (act === 'gate-read') {
      if (gate.preview) { gate.reveal = true; rerender(); return; }
      const item = problemFor('morning');
      if (!Engine.answered(state, todayKey(), 'morning')) {
        state.answers.push({ date: todayKey(), slot: 'morning', id: item.id, choice: null, correct: null, read: true, ts: Date.now() });
        state.alarm.dismissed.push(todayKey());
      }
      save();
      gate.open = false;
      gate.reveal = false;
      rerender();
      toast(t('gate.closed'));
      return;
    }
    if (act === 'gate-close') {
      if (gate.preview) { gate = { open: false, preview: false, choice: null, reveal: false }; rerender(); return; }
      if (!state.alarm.dismissed.includes(todayKey())) state.alarm.dismissed.push(todayKey());
      save();
      gate.open = false;
      rerender();
      toast(t('gate.closed'));
      return;
    }
    if (act === 'gate-snooze') {
      const s = state.alarm.snoozes.date === todayKey() ? state.alarm.snoozes : { date: todayKey(), n: 0 };
      if (s.n >= 2) return;
      s.n += 1;
      state.alarm.snoozes = s;
      state.alarm.snoozeUntil = new Date(Date.now() + 5 * 60000).toISOString();
      save();
      gate.open = false;
      rerender();
      return;
    }
    if (act === 'gate-preview') {
      gate = { open: true, preview: true, choice: null, reveal: false };
      rerender();
      return;
    }
    if (act === 'coach-check') { coachCheck(); return; }
    if (act === 'export') { exportJson(); return; }
    if (act === 'import') { importJson(); return; }
    if (act === 'reset') { reset(); return; }
  });

  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.dataset.act === 'bed') {
      if (!el.value) return;
      state.bed = el.value;
      save();
    }
    if (el.dataset.act === 'wake') {
      if (!el.value) return;
      state.wake = el.value;
      state.alarm.time = el.value;
      save();
      toast(t('settings.saved'));
    }
    if (el.dataset.act === 'alarm') {
      state.alarm.enabled = el.checked;
      save();
      toast(t('settings.saved'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.__urgeOpen) { window.__urgeOpen = false; render(); }
    }
    if (/^[1-5]$/.test(e.key)) {
      if (gate.open) {
        const i = Number(e.key) - 1;
        gate.choice = i;
        const item = problemFor('morning');
        if (i === item.answer && !Engine.answered(state, todayKey(), 'morning')) {
          state.answers.push({ date: todayKey(), slot: 'morning', id: item.id, choice: i, correct: true, ts: Date.now() });
          state.alarm.dismissed.push(todayKey());
          save();
        }
        rerender();
      } else if (route === 'solve' && !record()) {
        pick(Number(e.key) - 1);
      }
    }
  });

  window.addEventListener('hashchange', () => {
    const r = location.hash.replace('#', '') || 'today';
    if (r !== route) { route = r; render(); }
  });

  /* ---------- boot ---------- */

  async function boot() {
    state = loadState();
    I18n.setLang(state.lang || detectLang());
    route = (location.hash || '#today').replace('#', '') || 'today';
    try {
      problems = await fetch('data/problems.json', { cache: 'no-cache' }).then((r) => r.json());
    } catch (e) {
      document.getElementById('app').innerHTML = '<main class="wrap"><p class="warn">Could not load the problem bank.</p></main>';
      return;
    }
    render();
    checkGate();
    Coach.probe().then(() => { if (route === 'solve' || route === 'settings') rerender(); });
    setInterval(() => {
      checkGate();
      if (route === 'today' || route === 'solve') {
        // refresh only when the phase changes (day → night, night → morning)
        const tag = Engine.phase(now()) + todayKey();
        if (window.__phase !== tag) { window.__phase = tag; if (!record()) render(); }
      }
    }, 15000);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  window.NPApp = { state: () => state, puzzle: () => puzzle, problems: () => problems };
  boot();
})();
