/* Nightproof — interface strings. English and Korean carry the same keys;
 * tests.html fails if a key exists in one language and not the other. */
(function (global) {
  const NP = global.NP || (global.NP = {});

  const dict = {
    en: {
      'app.name': 'Nightproof',
      'app.tag': 'One proof before sleep. One after you wake.',
      'nav.today': 'Tonight',
      'nav.progress': 'Profile',
      'nav.about': 'Method',
      'nav.settings': 'Settings',

      'common.answer': 'Answer',
      'common.next': 'Continue',
      'common.back': 'Back',
      'common.close': 'Close',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.or': 'or',
      'common.loading': 'Loading…',
      'common.minutes': 'min',
      'common.days': 'days',
      'common.today': 'today',
      'common.yesterday': 'yesterday',
      'common.reveal': 'Show the reasoning',
      'common.lang': '한국어',
      'common.level': 'Level',
      'common.review': 'read again',
      'common.track': 'Track',

      'onboard.title': 'The feed ends here.',
      'onboard.body': 'Nightproof gives you one reasoning problem before bed and one when you wake. Nothing scrolls. When you get it wrong, it names the trap you fell into — in three lines — and keeps that name on your profile.',
      'onboard.bed': 'You go to bed around',
      'onboard.wake': 'You wake around',
      'onboard.alarm': 'Require the morning proof to dismiss the alarm gate',
      'onboard.start': 'Start tonight',
      'onboard.note': 'Everything stays on this device. No account, no tracking.',

      'today.heroMorning': 'Good morning.',
      'today.heroNight': 'The day is closed.',
      'today.heroDay': 'Between the two.',
      'today.subMorning': 'One problem before anything else opens.',
      'today.subNight': 'One problem instead of the last scroll.',
      'today.subDay': 'Tonight’s proof opens at 20:00.',
      'today.morning': 'This morning',
      'today.night': 'Tonight',
      'today.openMorning': 'Open the morning proof',
      'today.openNight': 'Open tonight’s proof',
      'today.doneMorning': 'Morning proof done',
      'today.doneNight': 'Tonight’s proof is done',
      'today.waitNight': 'Tonight’s proof arrives after 20:00.',
      'today.waitMorning': 'The morning proof opens at 04:00.',
      'today.streakLabel': 'nights in a row',
      'today.detoxLabel': 'minutes of feed replaced this week',
      'today.urge': 'I want to scroll',
      'today.urgeHint': 'Press it. You get 60 seconds of something better than the feed.',
      'today.alarmOn': 'Alarm gate on',
      'today.alarmOff': 'Alarm gate off',
      'today.gateWaiting': 'The gate is closed until you answer this morning’s proof.',
      'today.catchUp': 'You missed yesterday. One missed day is forgiven; the strip below shows it.',
      'today.week': 'Last seven days',

      'solve.progress': 'proof',
      'solve.promptDefault': 'Which one of the following is correct?',
      'solve.hint': 'Read once, then choose. There is no timer, and the answer does not move.',
      'solve.correct': 'Correct.',
      'solve.wrong': 'Not this one.',
      'solve.yourPick': 'You chose',
      'solve.trapTitle': 'The trap you walked into',
      'solve.whyTitle': 'Why the key works',
      'solve.avoidedTitle': 'The traps you avoided',
      'solve.avoidedHint': 'You are looking at the four decoys. Each one fails in one named way.',
      'solve.finished': 'That is the ritual for now. See you tonight.',
      'solve.share': 'Copy a note for later',
      'solve.copied': 'Copied.',
      'solve.showTrap': 'What was the trap?',

      'gate.eyebrow': 'Morning gate',
      'gate.title': 'Alarms are for the body. This one waits for the mind.',
      'gate.body': 'Answer this morning’s proof, or read its reasoning, to dismiss the gate.',
      'gate.snooze': 'Snooze 5 minutes',
      'gate.snoozesLeft': 'snoozes left',
      'gate.read': 'Dismiss by reading the reasoning',
      'gate.closed': 'Gate dismissed for today.',
      'gate.previewTag': 'preview',
      'gate.previewBody': 'This is a preview, not your morning. Nothing is recorded; close it and the app is yours again.',
      'settings.gatePreview': 'Preview the morning gate',

      'urge.title': 'Sixty seconds instead of the feed.',
      'urge.body': 'Breathe once for four counts, hold for four, out for six. Then name what you were about to look for — the reason matters less than noticing it.',
      'urge.why': 'What were you reaching for?',
      'urge.placeholder': 'a headline, a fight, a number, a face…',
      'urge.done': 'Done. Eight minutes of feed stayed unopened.',
      'urge.skip': 'Skip the note',

      'progress.title': 'Your logic profile',
      'progress.sub': 'Last seven days on this device.',
      'progress.answered': 'proofs read',
      'progress.accuracy': 'first-try accuracy',
      'progress.streak': 'current streak',
      'progress.best': 'best streak',
      'progress.radar': 'Trap radar',
      'progress.radarHint': 'Each spoke is a named trap. The further out, the more often you fell for it.',
      'progress.weak': 'Where you are leaking points',
      'progress.weakNone': 'No trap has caught you twice yet. Keep the week going.',
      'progress.weakLine': 'wrong {w} of {e} times this trap was on the board',
      'progress.drill': 'Drill',
      'progress.tracks': 'By track',
      'progress.empty': 'Answer a proof and this page starts to draw itself.',
      'progress.noHistory': 'Nothing yet. The first night writes the first row.',

      'about.title': 'What is actually behind this',
      'about.p1': 'Nightproof ships 56 authored items in the shape of Korea’s LEET reasoning section (추리논증), rewritten so that no outside knowledge is needed: conditions, quantity and scope, cause and evidence, samples, assumptions, meaning. Each item has one defensible key and four decoys that each fail in one named way.',
      'about.p2': 'The problem bank was written with GPT-6 Astra on the MoDoo AI Lab relay, then every answer key was re-read by Claude Fable 5.1 as a second, hostile examiner. Anything either model called arguable was rewritten or cut. The audit trail is in the repository: gen/ and docs/content-audit.md.',
      'about.p3': 'The three-line diagnosis you see after a wrong answer is authored per decoy, not generated at the moment you tap: a wrong pick can never be met with a made-up explanation. The weekly profile is arithmetic on your own answers.',
      'about.p4': 'The AI Coach is different. It is optional, it downloads once (about 0.3 GB), and then it runs entirely in this browser on a quantised 0.5B model — no key, no server, no request carrying your answers. It writes a short note connecting the trap you just hit to your own weekly profile. If it never loads, nothing else in the app changes.',
      'about.limits': 'Limits, stated plainly',
      'about.limit1': 'A 0.5B model is a study companion, not an examiner. Treat its note as a prompt to think, not as a verdict.',
      'about.limit2': 'The detox counter is self-report: eight minutes per resisted urge, six per proof. It measures your ritual, not your screen time.',
      'about.limit3': 'A web alarm cannot ring a phone the way a native alarm can. The gate blocks this app and notifies while the tab is open; add Nightproof to your home screen and it behaves like an app.',
      'about.credits': 'Credits',
      'about.credit1': 'Problem bank: authored with GPT-6 Astra, keys checked with Claude Fable 5.1 (MoDoo AI Lab relay).',
      'about.credit2': 'Coach model: Qwen2.5-0.5B-Instruct, run with Transformers.js (Apache-2.0).',
      'about.credit3': 'Built by Park Gaon for Build Your First AI App 2026. MIT licensed.',

      'settings.title': 'Settings',
      'settings.lang': 'Language',
      'settings.times': 'Your ritual',
      'settings.bed': 'Bedtime',
      'settings.wake': 'Wake time',
      'settings.alarm': 'Alarm gate',
      'settings.alarmHint': 'Blocks the app in the first 90 minutes after your wake time until the morning proof is answered or read.',
      'settings.notify': 'Remind me at bedtime',
      'settings.notifyOn': 'Reminders on',
      'settings.notifyDenied': 'The browser did not grant notifications.',
      'settings.coach': 'On-device AI coach',
      'settings.coachReady': 'model ready',
      'settings.coachNone': 'no model in this browser',
      'settings.coachChecking': 'checking…',
      'settings.coachOff': 'off',
      'settings.coachHint': 'Uses the model your browser already ships (Chrome’s built-in Prompt API). When it exists, Nightproof asks it to restate your trap in plainer words. No key, no server, no download from us, and nothing about you leaves the device.',
      'settings.data': 'Your data',
      'settings.export': 'Export as JSON',
      'settings.import': 'Import JSON',
      'settings.reset': 'Erase everything on this device',
      'settings.resetConfirm': 'This erases your streak and profile. It cannot be undone. Continue?',
      'settings.saved': 'Saved.',
      'settings.imported': 'Loaded {n} answers.',
      'settings.importFail': 'That file did not look like a Nightproof export.',

      'coach.title': 'On-device AI coach',
      'coach.loading': 'The browser is preparing its model ({p}%)',
      'coach.ask': 'See it in plainer words',
      'coach.thinking': 'The on-device model is writing…',
      'coach.notLoaded': 'This browser is not running an on-device model.',
      'coach.check': 'Check for an on-device model',
      'coach.unavailable': 'This browser reports no built-in model (Chrome’s Prompt API). Nothing is lost: the three lines above are the whole diagnosis, written for this exact option.',
      'coach.failed': 'The on-device model could not start here.',
      'coach.disclaimer': 'Written by the browser’s own on-device model. A prompt to think, not a verdict.',

      'toast.saved': 'Saved',
      'toast.dismissed': 'Gate dismissed'
    },

    ko: {
      'app.name': 'Nightproof',
      'app.tag': '잠들기 전 한 문제, 깨어난 뒤 한 문제.',
      'nav.today': '오늘 밤',
      'nav.progress': '프로필',
      'nav.about': '방식',
      'nav.settings': '설정',

      'common.answer': '답 고르기',
      'common.next': '계속',
      'common.back': '뒤로',
      'common.close': '닫기',
      'common.cancel': '취소',
      'common.save': '저장',
      'common.or': '또는',
      'common.loading': '불러오는 중…',
      'common.minutes': '분',
      'common.days': '일',
      'common.today': '오늘',
      'common.yesterday': '어제',
      'common.reveal': '해설 보기',
      'common.lang': 'English',
      'common.level': '난이도',
      'common.review': '다시 읽기',
      'common.track': '영역',

      'onboard.title': '피드는 여기서 끊깁니다.',
      'onboard.body': 'Nightproof는 잠들기 전 한 문제, 깨어난 뒤 한 문제를 줍니다. 넘길 화면은 없습니다. 틀리면 어느 논리 함정에 빠졌는지 세 줄로 짚어 주고, 그 이름을 프로필에 남깁니다.',
      'onboard.bed': '잠드는 시각',
      'onboard.wake': '깨어나는 시각',
      'onboard.alarm': '기상 알람 해제에 아침 문제를 요구합니다',
      'onboard.start': '오늘 밤부터 시작',
      'onboard.note': '모든 기록은 이 기기에만 남습니다. 계정도, 추적도 없습니다.',

      'today.heroMorning': '좋은 아침입니다.',
      'today.heroNight': '오늘은 여기까지.',
      'today.heroDay': '두 의식 사이.',
      'today.subMorning': '무엇보다 먼저, 한 문제.',
      'today.subNight': '마지막 스크롤 대신 한 문제.',
      'today.subDay': '오늘 밤 문제는 20시에 열립니다.',
      'today.morning': '오늘 아침',
      'today.night': '오늘 밤',
      'today.openMorning': '아침 문제 열기',
      'today.openNight': '오늘 밤 문제 열기',
      'today.doneMorning': '아침 문제 완료',
      'today.doneNight': '오늘 밤 문제 완료',
      'today.waitNight': '오늘 밤 문제는 20시 이후에 열립니다.',
      'today.waitMorning': '아침 문제는 04시에 열립니다.',
      'today.streakLabel': '일 연속',
      'today.detoxLabel': '이번 주 되찾은 시간(분)',
      'today.urge': '지금 피드를 보고 싶다',
      'today.urgeHint': '눌러 보세요. 피드 대신 60초를 씁니다.',
      'today.alarmOn': '기상 게이트 켜짐',
      'today.alarmOff': '기상 게이트 꺼짐',
      'today.gateWaiting': '오늘 아침 문제를 풀기 전에는 게이트가 닫혀 있습니다.',
      'today.catchUp': '어제를 놓쳤습니다. 하루는 유예되고, 아래 주간 띠에 표시됩니다.',
      'today.week': '최근 7일',

      'solve.progress': '번째 문제',
      'solve.promptDefault': '다음 중 옳은 것은?',
      'solve.hint': '한 번 읽고 고르세요. 시간 제한은 없고, 문제는 바뀌지 않습니다.',
      'solve.correct': '정답입니다.',
      'solve.wrong': '이 선지는 아닙니다.',
      'solve.yourPick': '고른 선지',
      'solve.trapTitle': '빠진 함정',
      'solve.whyTitle': '정답의 근거',
      'solve.avoidedTitle': '피해 간 함정',
      'solve.avoidedHint': '나머지 네 선지입니다. 각각 한 가지 이유로 틀립니다.',
      'solve.finished': '오늘의 의식은 여기까지입니다. 밤에 봅니다.',
      'solve.share': '나중에 볼 메모 복사',
      'solve.copied': '복사했습니다.',
      'solve.showTrap': '함정이 무엇이었나',

      'gate.eyebrow': '아침 게이트',
      'gate.title': '알람은 몸을 깨웁니다. 이 알람은 머리를 기다립니다.',
      'gate.body': '오늘 아침 문제를 풀거나 해설을 읽어야 게이트가 열립니다.',
      'gate.snooze': '5분 미루기',
      'gate.snoozesLeft': '회 남음',
      'gate.read': '해설을 읽고 닫기',
      'gate.closed': '오늘 게이트는 닫혔습니다.',
      'gate.previewTag': '미리보기',
      'gate.previewBody': '지금은 아침이 아닙니다. 여기서 고른 답은 기록되지 않으며, 닫으면 그대로 돌아갑니다.',
      'settings.gatePreview': '아침 게이트 미리보기',

      'urge.title': '피드 대신 60초.',
      'urge.body': '네 박자 들이쉬고, 네 박자 멈추고, 여섯 박자 내쉬세요. 그리고 방금 무엇을 보려 했는지 적어 보세요. 이유보다 알아차림이 먼저입니다.',
      'urge.why': '무엇을 보려 했나요?',
      'urge.placeholder': '제목, 싸움, 숫자, 얼굴…',
      'urge.done': '기록했습니다. 피드 8분을 열지 않았습니다.',
      'urge.skip': '적지 않고 넘어가기',

      'progress.title': '논리 프로필',
      'progress.sub': '이 기기의 최근 7일.',
      'progress.answered': '읽은 문제',
      'progress.accuracy': '첫 시도 정답률',
      'progress.streak': '현재 연속',
      'progress.best': '최장 연속',
      'progress.radar': '함정 레이더',
      'progress.radarHint': '각 축이 하나의 함정입니다. 바깥으로 갈수록 그 함정에 더 자주 빠졌습니다.',
      'progress.weak': '점수가 새는 곳',
      'progress.weakNone': '아직 같은 함정에 두 번 빠지지 않았습니다. 이번 주를 이어 가세요.',
      'progress.weakLine': '이 함정이 나온 {e}번 중 {w}번 틀림',
      'progress.drill': '훈련',
      'progress.tracks': '영역별',
      'progress.empty': '문제를 하나 풀면 이 화면이 그려지기 시작합니다.',
      'progress.noHistory': '아직 기록이 없습니다. 첫 밤이 첫 줄을 씁니다.',

      'about.title': '이 앱의 실제 구성',
      'about.p1': 'Nightproof에는 한국 LEET 추리논증의 형식을 빌린 56문항이 들어 있습니다. 외부 지식 없이 풀리도록 다시 썼고, 조건·양화와 범위·인과와 근거·표본·전제·의미의 여섯 영역을 다룹니다. 각 문항의 정답은 하나이고, 네 개의 오답은 저마다 한 가지 이름 붙은 이유로 틀립니다.',
      'about.p2': '문제 은행은 모두의 AI 실험실 릴레이의 GPT-6 Astra로 작성하고, 정답은 Claude Fable 5.1이 두 번째 심사위원으로 다시 읽었습니다. 어느 모델이든 “논쟁의 여지가 있다”고 한 문항은 고치거나 버렸습니다. 검증 기록은 저장소의 gen/과 docs/content-audit.md에 있습니다.',
      'about.p3': '틀린 뒤 보이는 세 줄 진단은 선지마다 미리 써 둔 것이고, 누르는 순간 생성하지 않습니다. 그 자리에서 지어낸 해설이 나올 수 없다는 뜻입니다. 주간 프로필은 내 답안에 대한 산술입니다.',
      'about.p4': 'AI 코치는 다릅니다. 선택 사항이고, 한 번(약 0.3GB) 내려받은 뒤에는 이 브라우저 안의 0.5B 양자화 모델로만 돌아갑니다. 키도 없고, 서버도 없고, 답안을 실어 보내는 요청도 없습니다. 방금 빠진 함정을 내 주간 기록과 연결해 짧은 메모를 씁니다. 코치가 끝내 뜨지 않아도 앱의 다른 기능은 그대로입니다.',
      'about.limits': '한계는 이렇습니다',
      'about.limit1': '0.5B 모델은 심사위원이 아니라 공부 동료입니다. 코치의 메모는 판정이 아니라 생각할 거리로 보세요.',
      'about.limit2': '디톡스 수치는 자기 보고입니다. 참은 충동 1회에 8분, 문제 1개에 6분. 화면 사용 시간이 아니라 의식을 잽니다.',
      'about.limit3': '웹 알람은 스마트폰 기본 알람처럼 울리지 않습니다. 탭이 열려 있는 동안 앱을 막고 알림을 보내며, 홈 화면에 추가하면 앱처럼 동작합니다.',
      'about.credits': '크레딧',
      'about.credit1': '문제 은행: GPT-6 Astra로 작성, Claude Fable 5.1로 정답 검증(모두의 AI 실험실 릴레이).',
      'about.credit2': '코치 모델: Qwen2.5-0.5B-Instruct, Transformers.js로 구동(Apache-2.0).',
      'about.credit3': '박가온 제작, Build Your First AI App 2026 출품. MIT 라이선스.',

      'settings.title': '설정',
      'settings.lang': '언어',
      'settings.times': '나의 의식',
      'settings.bed': '잠드는 시각',
      'settings.wake': '깨어나는 시각',
      'settings.alarm': '기상 게이트',
      'settings.alarmHint': '깨어난 뒤 90분 안에 앱을 열면, 아침 문제를 풀거나 해설을 읽을 때까지 앱을 막습니다.',
      'settings.notify': '잠들 시간 알림',
      'settings.notifyOn': '알림 켜짐',
      'settings.notifyDenied': '브라우저가 알림을 허용하지 않았습니다.',
      'settings.coach': '이 기기의 AI 코치',
      'settings.coachReady': '모델 준비됨',
      'settings.coachNone': '이 브라우저에 모델 없음',
      'settings.coachChecking': '확인 중…',
      'settings.coachOff': '꺼짐',
      'settings.coachHint': '브라우저가 이미 갖고 있는 모델(크롬 내장 Prompt API)을 씁니다. 모델이 있으면 방금 밟은 함정을 쉬운 말로 바꿔 달라고 요청합니다. 키도, 서버도, 우리 쪽 내려받기도 없고, 기기 밖으로 나가는 정보도 없습니다.',
      'settings.data': '내 기록',
      'settings.export': 'JSON으로 내보내기',
      'settings.import': 'JSON 불러오기',
      'settings.reset': '이 기기의 기록 모두 지우기',
      'settings.resetConfirm': '연속 기록과 프로필이 지워집니다. 되돌릴 수 없습니다. 계속할까요?',
      'settings.saved': '저장했습니다.',
      'settings.imported': '답안 {n}건을 불러왔습니다.',
      'settings.importFail': 'Nightproof 내보내기 파일로 보이지 않습니다.',

      'coach.title': '이 기기의 AI 코치',
      'coach.loading': '브라우저가 모델을 준비하는 중 ({p}%)',
      'coach.ask': '쉬운 말로 다시 보기',
      'coach.thinking': '이 기기의 모델이 쓰는 중…',
      'coach.notLoaded': '이 브라우저는 내장 모델을 쓰지 않는 상태입니다.',
      'coach.check': '이 브라우저에 내장 모델이 있는지 확인',
      'coach.unavailable': '이 브라우저에는 내장 모델(크롬 Prompt API)이 없다고 나옵니다. 잃는 것은 없습니다. 위의 세 줄이 이 선지에 맞춰 쓴 진단 전부입니다.',
      'coach.failed': '이 환경에서는 내장 모델을 시작하지 못했습니다.',
      'coach.disclaimer': '브라우저 자체의 내장 모델이 쓴 글입니다. 판정이 아니라 생각할 거리입니다.',

      'toast.saved': '저장했습니다',
      'toast.dismissed': '게이트를 닫았습니다'
    }
  };

  const TAGS = {
    necessary_sufficient: {
      en: 'Necessary / sufficient swap', ko: '필요·충분 조건 뒤집기',
      drillEn: 'Write the rule one way, then read it backwards. Ask which side is guaranteed and which is only required.',
      drillKo: '규칙을 정방향으로 한 번, 거꾸로 한 번 적어 보세요. 어느 쪽이 보장이고 어느 쪽이 요건인지 구분합니다.'
    },
    hasty_generalization: {
      en: 'Hasty generalisation', ko: '성급한 일반화',
      drillEn: 'Before you accept a general claim, name the sample: who was counted, who was left out, how many.',
      drillKo: '일반 주장을 받아들이기 전에 표본을 확인하세요. 누가 세어졌고, 누가 빠졌고, 몇 명인지.'
    },
    affirming_consequent: {
      en: 'Affirming the consequent', ko: '후건 긍정',
      drillEn: 'A implies B, and B is true — that tells you nothing about A. Only “not B” rules out A.',
      drillKo: 'A이면 B, 그런데 B다 — 이것만으로 A는 아무것도 정해지지 않습니다. B가 아니어야 A가 부정됩니다.'
    },
    causal_confusion: {
      en: 'Cause taken from correlation', ko: '상관에서 인과로',
      drillEn: 'Ask what else changed in the same window, and whether the arrow could run the other way.',
      drillKo: '같은 기간에 무엇이 더 변했는지, 화살표가 반대일 수는 없는지 물으세요.'
    },
    scope_shift: {
      en: 'Scope shift', ko: '양화 범위 이동',
      drillEn: 'Underline every some, all, most, only. “Some” never becomes “all”, and “not all” is not “none”.',
      drillKo: '어떤·모든·대부분·오직을 표시하세요. ‘어떤’은 ‘모든’이 되지 않고, ‘모두는 아니다’는 ‘없다’가 아닙니다.'
    },
    false_dilemma: {
      en: 'False dilemma', ko: '거짓 이분법',
      drillEn: 'Look for a third option, and for a premise doing hidden work behind the two on offer.',
      drillKo: '세 번째 선택지가 있는지, 두 선택지 뒤에서 몰래 일하는 전제가 있는지 보세요.'
    },
    authority_anecdote: {
      en: 'Authority or anecdote', ko: '권위·일화 의존',
      drillEn: 'One expert, one story, one crowd: ask what exactly that is evidence of.',
      drillKo: '전문가 한 명, 사례 하나, 다수 의견 — 그것이 정확히 무엇의 근거인지 물으세요.'
    },
    strawman_equivocation: {
      en: 'Claim moved or word doubled', ko: '논점 바꾸기·동음이의',
      drillEn: 'Restate the claim in your own words before you judge the option against it.',
      drillKo: '선지를 판단하기 전에 주장을 내 말로 다시 적으세요. 단어 하나가 두 뜻으로 쓰이지 않았는지 보세요.'
    }
  };

  const TRACKS = {
    condition: { en: 'Conditions', ko: '조건과 함의' },
    quantity: { en: 'Quantity & scope', ko: '양화와 범위' },
    cause: { en: 'Cause & evidence', ko: '인과와 근거' },
    sample: { en: 'Samples', ko: '표본과 일반화' },
    assumption: { en: 'Assumptions', ko: '전제와 논증' },
    language: { en: 'Meaning', ko: '의미와 정의' }
  };

  let lang = 'en';

  function setLang(next) {
    lang = dict[next] ? next : 'en';
    if (global.document) {
      global.document.documentElement.lang = lang;
      global.document.documentElement.dataset.lang = lang;
    }
  }

  function t(key, vars) {
    const table = dict[lang] || dict.en;
    let s = table[key];
    if (s === undefined) s = dict.en[key];
    if (s === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach((k) => { s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
    }
    return s;
  }

  function tagName(tag) { return (TAGS[tag] || {})[lang] || tag; }
  function tagDrill(tag) { const x = TAGS[tag] || {}; return lang === 'ko' ? x.drillKo : x.drillEn; }
  function trackName(track) { return (TRACKS[track] || {})[lang] || track; }

  NP.I18n = { dict, TAGS, TRACKS, t, setLang, getLang: () => lang, tagName, tagDrill, trackName };
})(typeof window !== 'undefined' ? window : globalThis);
