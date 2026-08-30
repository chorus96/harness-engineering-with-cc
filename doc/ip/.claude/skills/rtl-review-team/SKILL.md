---
name: rtl-review-team
description: "RTL 변경(diff)을 린트·CDC·타이밍·검증 4개 관점으로 병렬 리뷰하고 하나의 리포트로 통합한다. '리뷰', '코드 리뷰', 'PR 리뷰', '리뷰 재실행' 요청 시 사용. 리더는 직접 코드를 고치지 않는다."
allowed-tools: Read, Grep, Bash, Agent, TeamCreate, TaskCreate, SendMessage, TeamDelete
---

# rtl-review-team

4개 관점 팬아웃·팬인 리뷰 오케스트레이터. 리더 무발화 — 워커가 리포트를 생산한다.

## 입력
- 변경 파일 목록 또는 diff, 대상 REQ-*.

## Phase 0. 사전 조건
- 변경 파일이 0개면 중단 사유 보고. 대상 REQ 를 확인한다.

## Phase 1. 팀 생성
- `lint-checker` / `cdc-analyst` / `timing-constraints` / `verification-reviewer(testbench-engineer 겸)` 4인을 스폰한다.

## Phase 2. 작업 배치 (병렬)
1. lint-pass: `lint-checker` → `run/review/lint.md`
2. cdc-pass: `cdc-analyst` → `run/review/cdc.md`
3. timing-pass: `timing-constraints` → `run/review/timing.md`
4. verify-pass: 검증 영향·커버리지 갭 → `run/review/verify.md`

## Phase 3. 동료 메시지 (리더 미경유)
- cdc-analyst 가 구조 결함(REDO)을 판정하면 timing-constraints 에 영향 확인 요청.
- 메시지 형식 고정: `{type, severity, file, line, req, claim, request}`.

## Phase 4. 통합 게이트
- 4 리포트를 읽어 `must-fix`/`should-fix`/`watch` 로 통합 → `run/review/summary.md`.
- CDC/타이밍의 REDO 는 must-fix 로 올린다.

## Phase 5. 종료
- 팀 해체(TeamDelete). `run/review/*` 는 보존한다.
- 수정은 `rtl-coder` 가 반영한다(리뷰어는 수정하지 않음). 최종 승인은 사람.

## 트리거
"리뷰", "리뷰 재실행", "다시 실행" → 동일 diff 재리뷰(이전 결과 덮어쓰기).
