# references — Versal(ACAP) (HBM 관점, 예시 골격)

> 도메인 상세는 필요할 때만 로드된다(Progressive Disclosure). 아래는 **자리표시자 예시**이며, 실제 값·제약은 해당 디바이스 데이터시트/UG로 대체한다.

## HBM/메모리 관점 체크 항목
- Versal HBM 스택 구성과 PMBIST 접근 경로(NoC 경유 여부 포함) 확인.
- NoC(Network on Chip)를 통한 CSR 접근이 있는 경우 AXI4-Lite 경로와의 관계 확인.
- 테스트 인프라(WRCK) 소스·주파수 제약 확인.

## 클록/제약 관점
- `aclk`·`WRCK` 클록 소스, 비동기 그룹 분리.
- NoC/플랫폼 관리(PMC) 상호작용이 있으면 초기화 순서 제약 확인.

## 코딩/합성 관점
- Versal 권장 리셋/합성 가이드(UG 확인).
- 플랫폼 초기화·부트 시퀀스와 PMBIST 개시 시점의 의존성 확인.

> ⚠️ 구체 수치·아키텍처 세부는 단정하지 말 것. 반드시 원문(데이터시트/UG)을 근거로 채운다. UltraScale+와 아키텍처가 다르므로 references를 분리해 둔다.
