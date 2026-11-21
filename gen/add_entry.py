# -*- coding: utf-8 -*-
"""Add H20 (Build Your First AI App — Nightproof) to the archive."""
import datetime
import json
import shutil

P = '/workspace/work/archive/entries.json'
TS = datetime.datetime.now().strftime('%H%M%S')
shutil.copy(P, f'/workspace/work/archive/entries.bak-byaa-{TS}.json')
data = json.load(open(P, encoding='utf-8'))

entry = {
    "num": "H20",
    "name": "Nightproof (Devpost · Build Your First AI App 2026) — 취침 전·기상 후 리트 추리논증 1문제 + 3줄 함정 진단",
    "round": "🌐 64차 — 글로벌 해커톤 (해커톤 5)",
    "rows": {
        "주최": "Yasir Insights · Devpost (Build Your First AI App 2026) — 만 19세 이상·학생만·기업 참가 제외·전세계(Devpost 표준 제외국만 제외)·참가비 무료·참가자 709명·1인 참가",
        "상금": "현금 상금 없음(1 non-cash prize) — 요건 충족 시 Yasir Insights 디지털 수료 인증서(Certificate of Participation, 최대 1,000명)",
        "마감 · 발표": "마감 2026-11-27 17:00 EST = 2026-11-28 07:00 KST · 심사 2026-11-28~12-06(EST) · 수상자 발표일 별도 공지 없음(심사 종료 2026-12-07 07:00 KST 기준 캘린더 등록)",
        "제출 · 접수": "2026-11-22 06:2x KST Devpost 'Project submitted!' 확인 · 프로젝트 id 1315028 · 4/4 단계 완료 · 마감 전까지 수정 가능",
        "증빙 · 비고": "devpost.com/software/nightproof · 라이브 qkrrkdhzdl-arch.github.io/nightproof · 저장소 github.com/qkrrkdhzdl-arch/nightproof(public, MIT) · 테스트 56/56(라이브 /tests.html · quickjs 동일 56/56) · 데모 영상 youtu.be/9teTXbyuWd8(1:21, 일부 공개, 영어 내레이션) · 갤러리 5장+캡션 · 증빙 browser/devpost-nightproof-submitted-2026-11-22-063105.png · 썸네일은 placeholder(마감 전 교체 권장)"
    },
    "title": "Nightproof — 잠들기 전 한 문제, 깨어난 뒤 한 문제: 피드 대신 리트 추리논증, 틀리면 함정 이름과 3줄 진단 (Build Your First AI App 2026)",
    "core": "가온 님이 준 아이디어를 60문항·양언어·실배포 앱으로 완성해 제출했습니다. ① 하루 두 슬롯(밤 20:00~03:59 / 아침 04:00~11:59)에 날짜 해시로 문제를 배달하고 다시 뽑기 불가 ② 기상 후 90분 동안 앱을 잠그는 아침 게이트(정답 또는 해설 열람으로만 해제, 5분 스누즈 2회, 심사위원용 미리보기 버튼) ③ 오답 선지마다 이름 붙은 8가지 함정(필요·충분 뒤집기, 성급한 일반화, 후건 긍정, 인과 혼동, 범위 이동, 거짓 이분법, 권위·일화, 논점 변경)과 3줄 진단을 문항에 미리 저작(실행 중 생성 없음) ④ 주간 함정 레이더·약점 2개·훈련법·영역별 정답률 ⑤ '지금 피드를 보고 싶다' 충동 서핑 60초 ⑥ 한/영 토글·오프라인 PWA. 문항은 모두의 AI 실험실 gpt-6-astra로 6영역×10문항 생성 후 claude-fable-5-1이 정답 유일성 재검(49문항 배치 검증 + 나머지 11문항 사람 검수, docs/content-audit.md에 한계까지 기재). AI 코치는 가중치를 싣지 않고 브라우저 내장 모델(Chrome Prompt API)이 있을 때만 3줄을 쉬운 말로 바꿔 쓰며, 없으면 그 사실을 화면에 적습니다(0.5B·135M 번들 실험 실패 기록 포함).",
    "files": "저장소 41파일(엔진·i18n·뷰·문항 60·테스트·생성 파이프라인) · 데모 영상 1편 · 갤러리 5장 · 검증 문서 2편(README·docs/content-audit.md)",
    "title_raw": "Build Your First AI App",
    "paras": []
}

data.append(entry)
json.dump(data, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('entries:', len(data), 'last:', data[-1]['num'])
