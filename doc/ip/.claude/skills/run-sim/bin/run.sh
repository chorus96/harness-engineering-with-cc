#!/usr/bin/env bash
# run-sim 실행 스킬 — 시뮬레이션/리그레션을 실행하고 결과를 JSON으로 구조화.
# 기본 mock, USE_LIVE_TOOLS=1에서 실제 시뮬(Verilator --binary 우선, 없으면 Vivado xsim).
# 사용: bash run.sh <tb_dir> <out_json>   (rtl_dir는 RTL_DIR 환경변수, 기본 ../../.. /rtl)
set -euo pipefail
TB_DIR="${1:?tb dir required}"
OUT="${2:?out json required}"
RTL_DIR="${RTL_DIR:-$(cd "$TB_DIR/../rtl" 2>/dev/null && pwd || echo rtl)}"
TOP="${SIM_TOP:-tb_smoke}"
mkdir -p "$(dirname "$OUT")"

mapfile -t SRC < <(find "$RTL_DIR" "$TB_DIR" -name '*.sv' -o -name '*.v' 2>/dev/null | sort)
NTESTS=$(find "$TB_DIR" -name 'tb_*.sv' 2>/dev/null | wc -l | tr -d ' ')

emit_json() { # $1=tool $2=mode $3=pass $4=fail $5=note
  cat > "$OUT" <<JSON
{
  "tool": "$1",
  "mode": "$2",
  "tb_dir": "$TB_DIR",
  "rtl_dir": "$RTL_DIR",
  "top": "$TOP",
  "results": { "passed": $3, "failed": $4 },
  "note": "$5"
}
JSON
  echo "wrote $OUT ($1/$2: passed=$3 failed=$4)"
}

parse_marker() { # $1=logfile → echo "pass fail"
  if grep -q 'TB_RESULT: PASS' "$1"; then echo "1 0";
  elif grep -q 'TB_RESULT: FAIL' "$1"; then echo "0 1";
  else echo "0 1"; fi
}

if [[ "${USE_LIVE_TOOLS:-0}" != "1" ]]; then
  emit_json "mock-sim" "mock" 0 0 "mock 산출. 실제 결과는 USE_LIVE_TOOLS=1 연동 후 채워집니다. tests_found=$NTESTS"
  exit 0
fi

WORK="$(dirname "$OUT")/sim_work"; mkdir -p "$WORK"
LOG="$WORK/sim.log"

if command -v verilator >/dev/null 2>&1; then
  set +e
  verilator --binary --timing -sv -Wno-fatal --top-module "$TOP" \
    -Mdir "$WORK/obj" "${SRC[@]}" >"$LOG" 2>&1
  bc=$?
  if [[ $bc -eq 0 && -x "$WORK/obj/V$TOP" ]]; then
    "$WORK/obj/V$TOP" >>"$LOG" 2>&1
  fi
  set -e
  read -r P F < <(parse_marker "$LOG")
  emit_json "verilator" "live" "$P" "$F" "로그: $LOG"
  exit 0
elif command -v xvlog >/dev/null 2>&1 && command -v xelab >/dev/null 2>&1; then
  set +e
  ( cd "$WORK" && xvlog -sv "${SRC[@]}" && xelab "$TOP" -s "${TOP}_sim" \
      && xsim "${TOP}_sim" -R ) >"$LOG" 2>&1
  set -e
  read -r P F < <(parse_marker "$LOG")
  emit_json "xsim" "live" "$P" "$F" "로그: $LOG"
  exit 0
else
  echo "[run-sim] LIVE 모드: verilator/xsim 를 찾을 수 없습니다. 툴 설치 후 재시도하세요." >&2
  emit_json "none" "live-unavailable" 0 0 "시뮬레이터 미설치"
  exit 3
fi
