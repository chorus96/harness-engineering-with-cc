#!/usr/bin/env bash
# run-lint 실행 스킬 — RTL 린트를 실행하고 결과를 JSON으로 구조화.
# 기본 mock(툴 없이 골격 산출), USE_LIVE_TOOLS=1에서 실제 린트(Verilator 우선, 없으면 Vivado xvlog).
# 사용: bash run.sh <rtl_dir> <out_json>
set -euo pipefail
RTL_DIR="${1:?rtl dir required}"
OUT="${2:?out json required}"
mkdir -p "$(dirname "$OUT")"

# RTL 파일 수집(하위 디렉토리 포함)
mapfile -t SV_FILES < <(find "$RTL_DIR" -name '*.sv' -o -name '*.v' | sort)
NFILES=${#SV_FILES[@]}

emit_json() { # $1=tool $2=mode $3=err $4=warn $5=note
  cat > "$OUT" <<JSON
{
  "tool": "$1",
  "mode": "$2",
  "rtl_dir": "$RTL_DIR",
  "files_scanned": $NFILES,
  "summary": { "errors": $3, "warnings": $4 },
  "note": "$5"
}
JSON
  echo "wrote $OUT ($1/$2: errors=$3 warnings=$4)"
}

if [[ "${USE_LIVE_TOOLS:-0}" != "1" ]]; then
  # ---- mock 모드 ----
  emit_json "mock-lint" "mock" 0 0 "mock 산출. 실제 위반은 USE_LIVE_TOOLS=1 연동 후 채워집니다."
  exit 0
fi

# ---- live 모드 ----
LOG="$(dirname "$OUT")/lint.log"
if command -v verilator >/dev/null 2>&1; then
  # Verilator 린트 전용. --top-module은 top 파일명에 맞춰 조정.
  set +e
  verilator --lint-only -Wall -Wno-DECLFILENAME -sv \
    --top-module pmbist_ctrl_top "${SV_FILES[@]}" >"$LOG" 2>&1
  rc=$?
  set -e
  WARN=$(grep -c -E '%Warning' "$LOG" || true)
  ERR=$(grep -c -E '%Error'   "$LOG" || true)
  emit_json "verilator" "live" "${ERR:-0}" "${WARN:-0}" "로그: $LOG (rc=$rc)"
  exit 0
elif command -v xvlog >/dev/null 2>&1; then
  # Vivado 파서 기반 컴파일 체크(린트 대용).
  set +e
  xvlog -sv "${SV_FILES[@]}" >"$LOG" 2>&1
  rc=$?
  set -e
  ERR=$(grep -c -E 'ERROR'   "$LOG" || true)
  WARN=$(grep -c -E 'WARNING' "$LOG" || true)
  emit_json "xvlog" "live" "${ERR:-0}" "${WARN:-0}" "로그: $LOG (rc=$rc)"
  exit 0
else
  echo "[run-lint] LIVE 모드: verilator/xvlog 를 찾을 수 없습니다. 툴 설치 후 재시도하세요." >&2
  emit_json "none" "live-unavailable" 0 0 "EDA 린트 툴 미설치"
  exit 3
fi
