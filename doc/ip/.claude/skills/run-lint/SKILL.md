---
name: run-lint
description: "RTL 린트를 실행하고 결과를 구조화한다(JSON). 기본 mock(툴 없이 골격 산출), USE_LIVE_TOOLS=1에서 Verilator/Vivado 린트 실호출. 'RTL 린트', '린트 실행', '합성성 점검' 요청 시 사용."
allowed-tools: Read, Bash, Write
---

# run-lint

RTL 린트 실행 스킬. 실제 툴을 배치 호출하거나(mock/live) 로그를 구조화한다.

## 사용
```
bash bin/run.sh <rtl_dir> <out_json>
# 예) bash bin/run.sh rtl/ run/lint.json
# 실제 툴 연동:
USE_LIVE_TOOLS=1 bash bin/run.sh rtl/ run/lint.json
```

## 규칙 (Why-First)
- 기본은 mock 이다 — 왜냐하면 파일럿 초기엔 툴/라이선스 없이도 하네스 흐름을 검증해야 하기 때문.
- live 모드는 환경변수 뒤에 둔다 — 실제 EDA 호출은 비용/시간이 크므로 명시적으로만 실행.
- 산출은 기계가 읽는 JSON — 후속 에이전트(lint-checker)가 파싱한다.
