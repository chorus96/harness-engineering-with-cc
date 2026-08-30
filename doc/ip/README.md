# 파일럿 하네스 예제 — IEEE 1500 HBM PMBIST 컨트롤러 (AXI4-Lite)

> [`doc/제안서.md`](../제안서.md)의 파일럿 대상 IP에 대한 **하네스 골격 예제**입니다.
> 대상 IP: **AXI4-Lite로 제어되는 IEEE 1500 컨트롤러**로, HBM의 **PMBIST(Programmable Memory BIST)** 를 구동·수집한다.
>
> 이 폴더는 실제 RTL을 담지 않은 **하네스 스캐폴드(뼈대)** 입니다. 에이전트·스킬 정의와 실행 스크립트의 mock 골격만 제공하며, 실제 EDA 툴 연동(`USE_LIVE_TOOLS=1`)과 사내 규칙 반영은 도입 시 채웁니다.

## 구성

```
doc/ip/
├── README.md                 ← 이 파일
├── CLAUDE.md                 ← 프로젝트 규칙·오케스트레이션 포인터
├── Jenkinsfile               ← 온프레미스 CI(Bitbucket DC + 사내 Jenkins) 예시
├── docs/
│   └── requirements.md       ← 요구 정의(수용 기준·추적 ID) 예시
├── rtl/                      ← 참조 RTL 스텁(SystemVerilog)
│   ├── axil_csr.sv           ← AXI4-Lite 슬레이브 CSR
│   ├── ieee1500_ctrl.sv      ← IEEE 1500 WSC 생성 FSM
│   ├── pmbist_ctrl_top.sv    ← 상위 결선(+aclk↔wrck CDC)
│   └── cdc/sync2ff.sv        ← 2-FF 동기화기
├── tb/
│   └── tb_smoke.sv           ← 스모크 TB(Verilator/xsim 호환, 자기검증)
├── run/
│   └── checklist.md          ← 파일럿 진행 체크리스트
└── .claude/
    ├── agents/               ← 전문 에이전트 8종
    │   ├── spec-researcher.md
    │   ├── microarch-designer.md
    │   ├── rtl-coder.md
    │   ├── testbench-engineer.md
    │   ├── lint-checker.md
    │   ├── cdc-analyst.md
    │   ├── timing-constraints.md
    │   └── rca-debugger.md
    └── skills/               ← 스킬 5종
        ├── rtl-generate-verify/SKILL.md
        ├── rtl-review-team/SKILL.md
        ├── run-lint/{SKILL.md, bin/run.sh}
        ├── run-sim/{SKILL.md, bin/run.sh}
        └── device-refs/{SKILL.md, references/*}
```

## 도메인 한 눈에

- **AXI4-Lite CSR**: 호스트가 레지스터로 IEEE 1500 시퀀스·PMBIST 알고리즘을 제어(AW/W/B/AR/R 채널).
- **IEEE 1500 컨트롤러**: WSC(`WRCK/WRSTN/SelectWIR/ShiftWR/CaptureWR/UpdateWR`) + `WSI/WSO` 직렬 인터페이스로 래핑된 PMBIST 엔진에 명령·응답을 전달.
- **HBM PMBIST**: 채널/의사채널별 메모리 BIST(March 등 알고리즘)를 순차 구동하고 결과(pass/fail, 실패 주소)를 수집.
- **핵심 리스크**: `aclk`(AXI) ↔ `WRCK`(테스트) **클록 도메인 크로싱**, 리셋 도메인, 시퀀스 FSM 정합성.

## 사용 방법 (개념)

Claude Code를 이 폴더에서 열고(에이전트·스킬 디스커버리 대상은 `.claude/`), 예: "IEEE 1500 컨트롤러 CSR 맵을 설계해줘" → `microarch-designer` 활성. "리뷰 팀 돌려줘" → `rtl-review-team` 스킬 라우팅.

```sh
# mock 실행(툴 없이 산출 확인)
bash .claude/skills/run-lint/bin/run.sh rtl/ run/lint.json
bash .claude/skills/run-sim/bin/run.sh  tb/  run/sim.json

# 실제 EDA 연동(툴 자동 감지: Verilator 우선, 없으면 Vivado xvlog/xsim)
USE_LIVE_TOOLS=1 bash .claude/skills/run-lint/bin/run.sh rtl/ run/lint.json   # verilator --lint-only
USE_LIVE_TOOLS=1 bash .claude/skills/run-sim/bin/run.sh  tb/  run/sim.json    # verilator --binary / xsim
```

> 참조 RTL(`rtl/`)과 TB(`tb/`)는 문법적으로 유효한 SystemVerilog 예시입니다. Verilator(`--binary --timing`)나 Vivado(`xvlog/xelab/xsim`)가 설치된 환경에서 위 live 명령으로 실제 린트·시뮬을 수행합니다. TB는 `TB_RESULT: PASS/FAIL` 마커를 출력해 스크립트가 결과를 파싱합니다.

> 상세 개념은 [`doc/목차.md`](../목차.md), 예제 패턴은 [`doc/예제코드.md`](../예제코드.md), 배경은 [`doc/제안서.md`](../제안서.md) 참고.
> AMD·Xilinx·Vivado, IEEE 1500, AXI는 각 소유자의 상표/표준입니다. 본 예제는 교육용 골격입니다.
