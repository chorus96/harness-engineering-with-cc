---
name: rtl-generate-verify
description: "RTL 모듈을 생성-검증 루프로 구현한다. rtl-coder가 작성 → run-lint/run-sim으로 검증 → 실패 시 재작성(최대 3회) 후 사람에게 에스컬레이션. 'RTL 구현', '모듈 만들고 검증', '생성 검증' 요청 시 사용."
allowed-tools: Read, Write, Edit, Bash, Agent
---

# rtl-generate-verify

생성-검증 루프 + 재시도 상한. 검증을 우회하지 않는다.

## Workflow
1. Precondition: 대상 모듈과 관련 REQ-* 를 확인한다. 설계 산출물(`run/design/*`)이 없으면 중단하고 `microarch-designer` 를 먼저 요청한다.
2. 생성: `rtl-coder` 에이전트로 모듈을 작성한다.
3. 검증: `run-lint` → `run-sim` 스킬을 실행한다.
4. 분기:
   - 통과 → 완료. 산출·검증 요약을 `run/impl-notes.md` 에 남긴다.
   - 실패 → 실패 로그를 프롬프트에 포함해 `rtl-coder` 재호출.
5. 상한: `MAX_RETRIES=3`. 초과 시 "자동 수정 한계 도달 — 수동 검토 필요" 경고와 함께 마지막 산출·실패 로그를 사람에게 에스컬레이션한다.

## 규칙
- 테스트·린트를 비활성화·우회해 통과시키지 않는다 — 왜냐하면 그린 신호의 신뢰가 하네스의 전제이기 때문.
- 자동 커밋하지 않는다. 최종 반영은 사람 검토 후.
