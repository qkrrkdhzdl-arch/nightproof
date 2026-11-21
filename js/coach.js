/* Nightproof — the optional coach.
 * A quantised 0.5B instruction model that runs in this tab with WebAssembly.
 * Nothing leaves the device: no API key, no server, no request carrying answers.
 * If it does not load, the rest of the app is unaffected. */
(function (global) {
  const NP = global.NP || (global.NP = {});
  const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.web.js';
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

  /* The note is written from the item the reader just got wrong plus their own
   * weekly tally. The prompt is deliberately narrow: 3 short sentences, no
   * lecture, no invented facts about the passage. */
  function buildPrompt(ctx, lang) {
    const lines = lang === 'ko'
      ? [
        '너는 논리 학습 코치다. 아래는 학습자가 방금 틀린 추리 문제의 요약과, 학습자의 일주일 함정 기록이다.',
        '규칙: 3문장 이내. 문장마다 25단어 이내. 지문에 없는 사실을 만들지 말 것. 칭찬으로 시작하지 말 것.',
        '마지막 문장은 오늘 바로 해 볼 구체적인 행동 하나.',
        '지문 요지: ' + ctx.passage,
        '질문: ' + ctx.prompt,
        '학습자가 고른 선지: ' + ctx.choice,
        '그 선지의 함정: ' + ctx.trapName,
        '정답 선지: ' + ctx.key,
        '학습자의 최근 7일: 이 함정에 ' + ctx.wrong + '번 빠짐(노출 ' + ctx.exposure + '번). 전체 정답률 ' + ctx.accuracy + '%.',
        '코치의 메모:'
      ]
      : [
        'You are a logic coach. Below is the item a student just missed, and their tally of traps for the week.',
        'Rules: at most 3 sentences. At most 25 words each. Invent nothing that is not in the passage. Do not open with praise.',
        'The last sentence must be one concrete action they can take today.',
        'Passage gist: ' + ctx.passage,
        'Question: ' + ctx.prompt,
        'Option the student chose: ' + ctx.choice,
        'The trap in that option: ' + ctx.trapName,
        'The key: ' + ctx.key,
        'Student’s last 7 days: fell for this trap ' + ctx.wrong + ' times (it was on the board ' + ctx.exposure + ' times). Overall accuracy ' + ctx.accuracy + '%.',
        'Coach note:'
      ];
    return lines.join('\n');
  }

  async function note(ctx, lang) {
    if (status !== 'ready') throw new Error('not-loaded');
    const prompt = buildPrompt(ctx, lang);
    const out = await pipe([{ role: 'user', content: prompt }], {
      max_new_tokens: 140,
      temperature: 0.6,
      top_p: 0.9,
      do_sample: true,
      repetition_penalty: 1.1
    });
    let text = '';
    const first = Array.isArray(out) ? out[0] : out;
    if (first && first.generated_text) text = first.generated_text;
    // some builds return the whole conversation; keep only what follows the marker
    const marker = lang === 'ko' ? '코치의 메모:' : 'Coach note:';
    const at = text.lastIndexOf(marker);
    if (at >= 0) text = text.slice(at + marker.length);
    text = text.replace(/<\|[^>]*\|>/g, '').trim();
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
