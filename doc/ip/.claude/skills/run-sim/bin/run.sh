#!/usr/bin/env bash
# run-sim 실행 스킬 — 시뮬레이션/리그레션을 실행하고 결과를 JSON으로 구조화.
# 기본 mock, USE_LIVE_TOOLS=1에서 실제 시뮬레이터 호출.
# 사용: bash run.sh <tb_dir> <out_json>
set -euo pipefail
TB_DIR="${1:?tb dir required}"
OUT="${2:?out json required}"
mkdir -p "$(dirname "$OUT")"

if [[ "${USE_LIVE_TOOLS:-0}" == "1" ]]; then
  # 실제 연동 지점(도입 시 채움). 예:
  #   xvlog/xelab/xsim (Vivado xsim) 또는 verilator --binary, 서드파티 시뮬레이터.
  echo "[run-sim] LIVE 모드는 시뮬레이터 연동이 필요합니다. 도입 시 구현하세요." >&2
  exit 3
fi

# ---- mock 모드: 툴 없이 골격 산출 ----
tests=$(ls "$TB_DIR"/*.sv "$TB_DIR"/*.py 2>/dev/null | wc -l | tr -d ' ')
cat > "$OUT" <<JSON
{
  "tool": "mock-sim",
  "mode": "mock",
  "tb_dir": "$TB_DIR",
  "tests_found": $tests,
  "results": { "passed": 0, "failed": 0, "skipped": 0 },
  "coverage_pct": null,
  "note": "mock 산출입니다. 실제 결과는 USE_LIVE_TOOLS=1 연동 후 채워집니다."
}
JSON
echo "wrote $OUT (mock, tests_found=$tests)"
