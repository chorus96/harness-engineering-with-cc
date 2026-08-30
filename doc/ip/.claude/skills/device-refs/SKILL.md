---
name: device-refs
description: "대상 AMD FPGA 제품군별 제약·프리미티브 지식을 조건부로 로드한다(라우터). 요청이 UltraScale+냐 Versal이냐에 따라 references를 분기. 'UltraScale+ 제약', 'Versal', '디바이스 특성', 'HBM 채널' 언급 시 검토."
allowed-tools: Read
---

# device-refs (라우터 — 본문 없음)

도메인 본문 없이 조건부 링크만 둔다(메뉴판 원칙). 필요한 제품군 references만 로드해 컨텍스트를 아낀다.

## 라우팅
- UltraScale+ 관련이면 → `references/ultrascale-plus.md`
- Versal(ACAP) 관련이면 → `references/versal.md`

일반적인 IEEE 1500/AXI4-Lite 규약은 직접 참고하고, 디바이스 고유 특성이 필요할 때만 해당 references를 로드한다.
