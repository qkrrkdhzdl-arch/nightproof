/* Nightproof — the optional coach.
 * A quantised 0.5B instruction model that runs in this tab with WebAssembly.
 * Nothing leaves the device: no API key, no server, no request carrying answers.
 * If it does not load, the rest of the app is unaffected. */
(function (global) {
  const NP = global.NP || (global.NP = {});
  const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm';
  const MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct';

  let pipe = null;
  let status = 'idle'; // idle | loading | ready | error
  let progress = 0;
  let lastError = null;

  function supported() {
    return typeof WebAssembly === 'object' && typeof fetch === 'function';
  }

  async function load(onProgress) {
    if (status === 'ready') return pipe;
    if (!supported()) { status = 'error'; lastError = 'no-webassembly'; throw new Error(lastError); }
    status = 'loading';
    try {
      const mod = await import(/* @vite-ignore */ CDN);
      const { pipeline, env } = mod;
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      const progress_callback = (p) => {
        if (p && p.status === 'progress' && typeof p.progress === 'number') {
          progress = Math.round(p.progress);
          if (onProgress) onProgress(progress);
        }
      };
      const options = [{ dtype: 'q4' }, { dtype: 'q4f16' }, {}];
      let last;
      for (const opt of options) {
        try {
          pipe = await pipeline('text-generation', MODEL, Object.assign({ progress_callback }, opt));
          status = 'ready';
          return pipe;
        } catch (err) {
          last = err;
        }
      }
      throw last || new Error('pipeline failed');
    } catch (err) {
      status = 'error';
      lastError = String(err && err.message ? err.message : err);
      throw err;
    }
  }

  /* The note is written from the authored trap the reader just hit. The task is
   * deliberately narrow — restate given lines in plainer words and give one
   * everyday example — because a 0.5B model should not be inventing new logic
   * about the passage. Anything outside those two sentences is cut. */
  function buildPrompt(ctx, lang) {
    const lines = (ctx.lines || []).join(' ');
    if (lang === 'ko') {
      return [
        '아래 세 줄은 방금 학습자가 밟은 논리 함정에 대한 설명이다. 이 내용만 써서 두 문장을 만들어라.',
        '규칙: 1문장은 쉬운 말로 다시 쓴 것(20단어 이내), 2문장은 일상적인 예 하나(20단어 이내).',
        '머리말, 목록, 마크다운 금지. 주어진 세 줄에 없는 논리를 새로 만들지 말 것.',
        '설명: ' + lines,
        '출력:'
      ].join('\n');
    }
    return [
      'The three lines below explain a logical trap a reader just fell into. Using only this content, write two sentences.',
      'Rules: sentence 1 restates it in plainer words (max 20 words). Sentence 2 gives one everyday example (max 20 words).',
      'No preamble, no list, no markdown. Do not add logic that is not in the three lines.',
      'The three lines: ' + lines,
      'Output:'
    ].join('\n');
  }

  async function note(ctx, lang) {
    if (status !== 'ready') throw new Error('not-loaded');
    const prompt = buildPrompt(ctx, lang);
    const out = await pipe([{ role: 'user', content: prompt }], {
      max_new_tokens: 90,
      temperature: 0.35,
      top_p: 0.85,
      do_sample: true,
      repetition_penalty: 1.25
    });
    let text = '';
    const first = Array.isArray(out) ? out[0] : out;
    const g = first && first.generated_text;
    if (typeof g === 'string') text = g;
    else if (Array.isArray(g)) {
      const last = g[g.length - 1];
      text = (last && (last.content || '')) || '';
    } else if (g && typeof g === 'object') {
      text = g.content || '';
    }
    if (!text) {
      lastError = 'empty-generation';
      throw new Error(lastError);
    }
    // some builds return the whole conversation; keep only what follows the marker
    const marker = lang === 'ko' ? '출력:' : 'Output:';
    const at = text.lastIndexOf(marker);
    if (at >= 0) text = text.slice(at + marker.length);
    text = text
      .replace(/<\|[^>]*\|>/g, ' ')
      .replace(/[*#>`_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // keep at most the first two sentences, and at most 60 words
    const sentences = text.match(/[^.!?\u3002]+[.!?\u3002]?/g) || [text];
    text = sentences.slice(0, 2).join(' ').trim();
    const words = text.split(' ');
    if (words.length > 60) text = words.slice(0, 60).join(' ') + '…';
    return text;
  }

  NP.Coach = {
    supported, load, note, buildPrompt,
    get status() { return status; },
    get progress() { return progress; },
    get error() { return lastError; },
    model: MODEL
  };
})(typeof window !== 'undefined' ? window : globalThis);
