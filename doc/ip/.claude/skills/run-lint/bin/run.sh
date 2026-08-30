#!/usr/bin/env bash
# run-lint 실행 스킬 — RTL 린트를 실행하고 결과를 JSON으로 구조화.
# 기본 mock(툴 없이 골격 산출), USE_LIVE_TOOLS=1에서 실제 린트 호출.
# 사용: bash run.sh <rtl_dir> <out_json>
set -euo pipefail
RTL_DIR="${1:?rtl dir required}"
OUT="${2:?out json required}"
mkdir -p "$(dirname "$OUT")"

if [[ "${USE_LIVE_TOOLS:-0}" == "1" ]]; then
  # 실제 연동 지점(도입 시 채움). 예:
  #   verilator --lint-only -Wall -sv "$RTL_DIR"/*.sv 2> run/verilator.log || true
  #   또는 Vivado: vivado -mode batch -source scripts/lint.tcl
  # 아래는 로그 파서가 채워야 하는 자리표시자.
  echo "[run-lint] LIVE 모드는 EDA 연동이 필요합니다. 도입 시 구현하세요." >&2
  exit 3
fi

# ---- mock 모드: 툴 없이 골격 산출(하네스 흐름 검증용) ----
files=$(ls "$RTL_DIR"/*.sv 2>/dev/null | wc -l | tr -d ' ')
cat > "$OUT" <<JSON
{
  "tool": "mock-lint",
  "mode": "mock",
  "rtl_dir": "$RTL_DIR",
  "files_scanned": $files,
  "violations": [],
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "note": "mock 산출입니다. 실제 위반은 USE_LIVE_TOOLS=1 연동 후 채워집니다."
}
JSON
echo "wrote $OUT (mock, files_scanned=$files)"
