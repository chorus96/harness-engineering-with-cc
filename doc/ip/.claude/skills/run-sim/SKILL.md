---
name: run-sim
description: "테스트벤치 시뮬레이션/리그레션을 실행하고 결과를 구조화한다(JSON). 기본 mock, USE_LIVE_TOOLS=1에서 xsim/Verilator/서드파티 시뮬 실호출. '시뮬레이션', '리그레션 실행', 'TB 돌려줘' 요청 시 사용."
allowed-tools: Read, Bash, Write
---

# run-sim

시뮬레이션 실행 스킬. 테스트 결과(pass/fail·커버리지)를 구조화한다.

## 사용
```
bash bin/run.sh <tb_dir> <out_json>
USE_LIVE_TOOLS=1 bash bin/run.sh tb/ run/sim.json
```

## 규칙 (Why-First)
- 결정론적 실행을 위해 시드를 고정한다 — 재현성이 검증의 전제.
- 실패는 REQ-* 로 매핑해 보고한다 — 추적성.
- 기본 mock, live는 환경변수 뒤 — 비용 통제.
