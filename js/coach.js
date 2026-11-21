/* Nightproof — the optional coach.
 *
 * It uses the on-device model the browser already provides: Chrome's built-in
 * Prompt API (Gemini Nano). There is no key, no server, no upload, and Nightproof
 * ships no weights. When the browser has no such model — which is the common case
 * today — the coach says so in one line and the authored diagnosis carries on.
 *
 * The task given to the model is deliberately small: restate the trap the reader
 * just hit in plainer words, plus one everyday example, using only the authored
 * three lines. It must not reason about the passage on its own. */
(function (global) {
  const NP = global.NP || (global.NP = {});
  let status = 'idle'; // idle | checking | loading | ready | unavailable | error
  let progress = 0;
  let lastError = null;
  let session = null;

  function api() {
    return global.LanguageModel || null;
  }

  function supported() {
    return typeof api() === 'function';
  }

  async function availability() {
    const LM = api();
    if (!LM) return 'unavailable';
    try {
      if (typeof LM.availability === 'function') {
        const a = await LM.availability();
        return a || 'unavailable';
      }
      if (typeof LM.capabilities === 'function') {
        const c = await LM.capabilities();
        return c && c.available === 'readily' ? 'available' : 'unavailable';
      }
    } catch (err) {
      lastError = String(err && err.message ? err.message : err);
    }
    return 'unavailable';
  }

  async function probe() {
    status = 'checking';
    const a = await availability();
    status = a === 'available' ? 'ready' : a === 'downloadable' || a === 'downloading' ? 'idle' : 'unavailable';
    return status;
  }

  async function ensure(onProgress) {
    if (session) return session;
    const LM = api();
    if (!LM) { status = 'unavailable'; throw new Error('no-language-model'); }
    status = 'loading';
    try {
      session = await LM.create({
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            if (e && typeof e.loaded === 'number' && typeof e.total === 'number' && e.total > 0) {
              progress = Math.round((e.loaded / e.total) * 100);
              if (onProgress) onProgress(progress);
            }
          });
        }
      });
      status = 'ready';
      return session;
    } catch (err) {
      status = 'unavailable';
      lastError = String(err && err.message ? err.message : err);
      throw err;
    }
  }

  function buildPrompt(ctx, lang) {
    const lines = (ctx.lines || []).join(' ');
    if (lang === 'ko') {
      return [
        '아래 세 줄은 학습자가 방금 밟은 논리 함정 설명이다. 이 내용만 써서 두 문장을 써라.',
        '1문장: 쉬운 말로 다시 쓴 것(20단어 이내). 2문장: 일상적인 예 하나(20단어 이내).',
        '머리말·목록·마크다운 금지. 세 줄에 없는 논리를 새로 만들지 말 것.',
        '설명: ' + lines
      ].join('\n');
    }
    return [
      'The three lines below explain a logical trap a reader just fell into. Using only this content, write two sentences.',
      'Sentence 1 restates it in plainer words (max 20 words). Sentence 2 gives one everyday example (max 20 words).',
      'No preamble, no list, no markdown. Do not add logic that is not in the three lines.',
      'The three lines: ' + lines
    ].join('\n');
  }

  function tidy(text, lang) {
    let t = String(text || '')
      .replace(/<\|[^>]*\|>/g, ' ')
      .replace(/[*#>`_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const sentences = t.match(/[^.!?。]+[.!?。]?/g) || [t];
    t = sentences.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
    const words = t.split(' ');
    if (words.length > 60) t = words.slice(0, 60).join(' ') + '…';
    return t;
  }

  async function note(ctx, lang) {
    const s = session || (await ensure());
    const out = await s.prompt(buildPrompt(ctx, lang));
    return tidy(out, lang);
  }

  NP.Coach = {
    supported, availability, probe, ensure, note, buildPrompt, tidy,
    get status() { return status; },
    get progress() { return progress; },
    get error() { return lastError; },
    engine: 'prompt-api'
  };
})(typeof window !== 'undefined' ? window : globalThis);
