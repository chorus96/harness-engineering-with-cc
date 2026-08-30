# 파일럿 진행 체크리스트 — IEEE 1500 HBM PMBIST 컨트롤러

## 하네스 준비
- [ ] `.claude/agents/` 8종 정의 검토(역할·모델·도구 경계)
- [ ] `.claude/skills/` 5종 검토(트리거 description, allowed-tools)
- [ ] `CLAUDE.md` 규칙(Why-First)·안전장치 확인
- [ ] `device-refs/references/*` 를 사내 데이터시트/UG 근거로 채움

## 단계별 (요구 정의→모니터링)
- [ ] 요구 정의: `docs/requirements.md` 의 REQ-* 수용 기준 확정
- [ ] 조사: `spec-researcher` → `run/spec-notes.md`
- [ ] 설계: `microarch-designer` → `run/design/*`(CSR/FSM/CDC/ADR)
- [ ] 구현: `rtl-generate-verify` 루프(린트·시뮬 통과)
- [ ] 검증: `testbench-engineer` TB·리그레션, REQ 매핑
- [ ] 리뷰: `rtl-review-team`(린트/CDC/타이밍/검증) 통합 리포트
- [ ] 배포: `run-synth` 결과 + 사람 사인오프
- [ ] 모니터링: 추세 관측 + `rca-debugger` 환류

## 도구 연동
- [ ] `run-lint`/`run-sim` mock 동작 확인(`bash bin/run.sh ...`)
- [ ] `USE_LIVE_TOOLS=1` EDA 연동 구현(Verilator/Vivado/xsim)
- [ ] 로그 파서(위반/결과) 검증

## 안전·거버넌스
- [ ] 검증자(lint/cdc) 무수정 원칙 준수 확인
- [ ] 재시도 상한 3·에스컬레이션 동작 확인
- [ ] 최종 사인오프·배포 승인은 사람
- [ ] With/Without A/B로 KPI 측정([`제안서.md`](../../제안서.md) 6.2)
