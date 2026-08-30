const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
const W = 13.33, H = 7.5;

// ---- palette ----
const NAVY = "0B2447";      // primary dark
const NAVY2 = "153B66";     // panel navy
const TEAL = "1FB6A6";      // accent
const AMBER = "F2A900";     // secondary accent
const INK = "1B2733";       // body text on light
const MUT = "5B6B7A";       // muted
const LIGHT = "FFFFFF";
const PANEL = "F1F5F9";     // light panel
const ICE = "CFE3F2";

const HF = "Cambria";       // header font
const BF = "Calibri";       // body font

function bg(slide, color) { slide.background = { color }; }

function chip(slide, x, y, txt, opts = {}) {
  const w = opts.w || 0.5;
  slide.addShape(p.ShapeType.ellipse, { x, y, w, h: w, fill: { color: opts.fill || TEAL } });
  slide.addText(txt, { x, y, w, h: w, align: "center", valign: "middle", fontFace: HF,
    bold: true, color: opts.color || LIGHT, fontSize: opts.fs || 16, isTextBox: true, margin: 0 });
}

function title(slide, kicker, ttl, dark = false) {
  const c = dark ? LIGHT : NAVY;
  slide.addText(kicker.toUpperCase(), { x: 0.6, y: 0.42, w: 12, h: 0.3, fontFace: BF, bold: true,
    color: dark ? TEAL : TEAL, fontSize: 12, charSpacing: 2, isTextBox: true, margin: 0 });
  slide.addText(ttl, { x: 0.6, y: 0.72, w: 12.1, h: 0.85, fontFace: HF, bold: true, color: c,
    fontSize: 32, isTextBox: true, margin: 0 });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || PANEL }, line: opts.line ? { color: opts.line, width: 1 } : { type: "none" },
    shadow: { type: "outer", color: "9AA7B4", opacity: 0.35, blur: 6, offset: 2, angle: 90 } });
}

// ============ SLIDE 1 — TITLE ============
let s = p.addSlide(); bg(s, NAVY);
s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: NAVY } });
// motif dots
for (let i = 0; i < 6; i++) s.addShape(p.ShapeType.ellipse, { x: 10.6 + (i%3)*0.7, y: 0.7 + Math.floor(i/3)*0.7, w: 0.28, h: 0.28, fill: { color: i%2? TEAL: AMBER }, });
s.addText("파일럿 제안서", { x: 0.7, y: 2.0, w: 10, h: 0.4, fontFace: BF, bold: true, color: TEAL,
  fontSize: 15, charSpacing: 3, isTextBox: true, margin: 0 });
s.addText("AMD FPGA 대상 RTL 개발\n하네스 구축 제안", { x: 0.65, y: 2.45, w: 11.8, h: 1.9, fontFace: HF,
  bold: true, color: LIGHT, fontSize: 44, lineSpacingMultiple: 1.0, isTextBox: true, margin: 0 });
s.addText("모델이 아니라, 모델을 감싼 하네스가 결과를 결정한다", { x: 0.7, y: 4.5, w: 11.5, h: 0.5,
  fontFace: HF, italic: true, color: ICE, fontSize: 18, isTextBox: true, margin: 0 });
s.addText([
  { text: "에이전트 · 스킬 · 오케스트레이터로 RTL 개발 환경을 표준화", options: { bullet: false } }
], { x: 0.7, y: 5.15, w: 11.5, h: 0.4, fontFace: BF, color: "AEC3D6", fontSize: 14, isTextBox: true, margin: 0 });
s.addText("교육용 예시 · 비용/효과 수치는 조직별 재산정 필요", { x: 0.7, y: 6.7, w: 11.9, h: 0.3,
  fontFace: BF, color: "6E86A0", fontSize: 11, isTextBox: true, margin: 0 });
s.addNotes("제목 슬라이드. 핵심 명제: 모델이 아니라 하네스가 결과를 결정한다. 파일럿: IEEE1500 HBM PMBIST 컨트롤러.");

// ============ SLIDE 2 — 문제 (As-Is) ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "왜 지금 하네스인가", "전문성이 파일로 고정되지 않아 매번 재현되지 않는다");
const problems = [
  ["조사·사양", "데이터시트·UG를 개인이 산발 조사, 근거가 남지 않음", "🔍"],
  ["설계", "마이크로아키텍처 결정의 대안·근거가 문서화되지 않음", "📐"],
  ["구현(RTL)", "코딩·리셋·CDC 규칙이 사람마다 달라 린트 위반 반복", "⚙️"],
  ["검증", "TB·커버리지 작성 병목, 리그레션 실패 분류에 시간 소모", "🧪"],
  ["타이밍/제약", "XDC·타이밍 클로저가 후반부에 몰려 재작업 발생", "⏱️"],
  ["지식 전수", "시니어 의존도가 높고 온보딩이 오래 걸림", "🎓"],
];
let cx = 0.6, cy = 1.85, cw = 3.94, ch = 2.35, gx = 0.28, gy = 0.28;
problems.forEach((it, i) => {
  const x = cx + (i % 3) * (cw + gx), y = cy + Math.floor(i / 3) * (ch + gy);
  card(s, x, y, cw, ch);
  s.addText(it[2], { x: x + 0.22, y: y + 0.22, w: 0.7, h: 0.7, fontSize: 26, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(it[0], { x: x + 0.95, y: y + 0.3, w: cw - 1.1, h: 0.5, fontFace: HF, bold: true, color: NAVY, fontSize: 18, isTextBox: true, margin: 0 });
  s.addText(it[1], { x: x + 0.28, y: y + 1.05, w: cw - 0.55, h: 1.1, fontFace: BF, color: MUT, fontSize: 13.5, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
});
s.addNotes("As-Is 문제: 역량이 아니라 구조가 병목. 전문성이 파일로 고정되지 않음.");

// ============ SLIDE 3 — 제안 개요 (3요소) ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "제안 개요", "작업 환경 자체를 전문 에이전트 팀으로 표준화");
const pillars = [
  ["에이전트", ".claude/agents/", "역할·모델·도구가 고정된 전문 일꾼. 도구 경계로 권한을 물리적으로 제한", TEAL],
  ["스킬", ".claude/skills/", "자연어로 호출되는 재사용 워크플로. 생성-검증·리뷰 절차를 담음", AMBER],
  ["오케스트레이터", "CLAUDE.md", "팀을 만들고 작업을 배치·통합. 규칙과 흐름의 포인터", NAVY2],
];
let px = 0.6, pw = 3.94, pgap = 0.28, py = 2.0, ph = 3.9;
pillars.forEach((it, i) => {
  const x = px + i * (pw + pgap);
  card(s, x, py, pw, ph, { fill: LIGHT, line: "E1E8EF" });
  s.addShape(p.ShapeType.roundRect, { x, y: py, w: pw, h: 0.14, rectRadius: 0.06, fill: { color: it[3] } });
  chip(s, x + 0.35, py + 0.45, String(i + 1), { fill: it[3], w: 0.6, fs: 20 });
  s.addText(it[0], { x: x + 1.1, y: py + 0.5, w: pw - 1.3, h: 0.55, fontFace: HF, bold: true, color: NAVY, fontSize: 21, isTextBox: true, margin: 0 });
  s.addText(it[1], { x: x + 0.35, y: py + 1.35, w: pw - 0.7, h: 0.4, fontFace: "Courier New", color: it[3], fontSize: 13, bold: true, isTextBox: true, margin: 0 });
  s.addText(it[2], { x: x + 0.35, y: py + 1.9, w: pw - 0.7, h: 1.8, fontFace: BF, color: INK, fontSize: 14.5, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
});
s.addText("＋ 도메인 지식은 references/ 로 분기(라우터), 하네스는 EDA 툴을 대체하지 않고 오케스트레이션한다", { x: 0.6, y: 6.15, w: 12.1, h: 0.5, fontFace: BF, italic: true, color: MUT, fontSize: 13, isTextBox: true, margin: 0 });
s.addNotes("3요소: 에이전트/스킬/오케스트레이터 + references. 하네스는 툴 대체가 아니라 오케스트레이션.");

// ============ SLIDE 4 — 예상 하네스 구성 (에이전트 표) ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "예상 하네스 구성", "전문 에이전트 8종 — 도구 경계로 역할을 고정");
const rows = [
  ["spec-researcher", "요구·제약 조사·정제", "opus", "읽기 전용"],
  ["microarch-designer", "CSR·FSM·CDC 설계 + ADR", "opus", "Read/Write"],
  ["rtl-coder", "SystemVerilog 구현", "sonnet", "Write/Edit/Bash"],
  ["testbench-engineer", "TB·커버리지·리그레션", "sonnet", "Write/Edit/Bash"],
  ["lint-checker", "린트·합성성 (무수정)", "sonnet", "Read/Bash"],
  ["cdc-analyst", "aclk↔WRCK CDC (무수정)", "opus", "Read/Bash"],
  ["timing-constraints", "XDC·STA 해석", "opus", "Read/Write/Bash"],
  ["rca-debugger", "실패 근본원인 1차 분류", "opus", "Read/Bash"],
];
const tableData = [[
  { text: "에이전트", options: { bold: true, color: LIGHT, fill: NAVY, fontFace: HF, fontSize: 14, align: "left" } },
  { text: "역할", options: { bold: true, color: LIGHT, fill: NAVY, fontFace: HF, fontSize: 14, align: "left" } },
  { text: "모델", options: { bold: true, color: LIGHT, fill: NAVY, fontFace: HF, fontSize: 14, align: "center" } },
  { text: "도구 경계", options: { bold: true, color: LIGHT, fill: NAVY, fontFace: HF, fontSize: 14, align: "left" } },
]];
rows.forEach((r, i) => {
  const f = i % 2 ? "FFFFFF" : "EEF3F8";
  tableData.push([
    { text: r[0], options: { color: NAVY, fill: f, fontFace: "Courier New", fontSize: 12.5, bold: true, align: "left" } },
    { text: r[1], options: { color: INK, fill: f, fontFace: BF, fontSize: 12.5, align: "left" } },
    { text: r[2], options: { color: r[2] === "opus" ? "8A4B00" : "0A6E64", fill: f, fontFace: BF, fontSize: 12.5, bold: true, align: "center" } },
    { text: r[3], options: { color: MUT, fill: f, fontFace: BF, fontSize: 12, align: "left" } },
  ]);
});
s.addTable(tableData, { x: 0.6, y: 1.95, w: 12.1, colW: [3.1, 4.6, 1.5, 2.9], rowH: 0.5,
  border: { type: "solid", color: "DDE5EC", pt: 1 }, valign: "middle", margin: [3, 6, 3, 6] });
s.addText("검증자(lint·cdc)는 Write 미부여 → 판정만, 수정은 rtl-coder가 반영", { x: 0.6, y: 6.75, w: 12, h: 0.35, fontFace: BF, italic: true, color: MUT, fontSize: 12.5, isTextBox: true, margin: 0 });
s.addNotes("에이전트 8종. 설계·검증 opus, 구현·실행 sonnet 티어링. 검증자 무수정 가드레일.");

// ============ SLIDE 5 — 아키텍처 패턴 매핑 ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "아키텍처 패턴", "6가지 팀 패턴을 RTL 흐름에 매핑");
const pats = [
  ["파이프라인", "사양→설계→RTL→검증→합성 순차"],
  ["팬아웃·팬인", "린트+CDC+타이밍+검증 병렬 → 통합"],
  ["전문가 풀(라우터)", "이슈 유형별 전문 에이전트 분기"],
  ["생성-검증", "RTL 생성 ↔ 시뮬/린트 (재시도 상한)"],
  ["감독자", "리그레션 실패를 런타임 분류·배분"],
  ["계층적 위임", "블록 → 서브모듈 → 리프 위임"],
];
cx = 0.6; cy = 1.9; cw = 3.94; ch = 1.55; gx = 0.28; gy = 0.28;
pats.forEach((it, i) => {
  const x = cx + (i % 3) * (cw + gx), y = cy + Math.floor(i / 3) * (ch + gy);
  card(s, x, y, cw, ch, { fill: PANEL });
  chip(s, x + 0.28, y + 0.28, String(i + 1), { fill: i < 3 ? TEAL : AMBER, w: 0.5, fs: 15 });
  s.addText(it[0], { x: x + 0.9, y: y + 0.26, w: cw - 1.1, h: 0.5, fontFace: HF, bold: true, color: NAVY, fontSize: 16, isTextBox: true, margin: 0 });
  s.addText(it[1], { x: x + 0.3, y: y + 0.82, w: cw - 0.6, h: 0.6, fontFace: BF, color: MUT, fontSize: 13, isTextBox: true, margin: 0 });
});
s.addNotes("6패턴 매핑. ex-11 리뷰팀=팬아웃/팬인, ex-08-15=생성검증, ex-13-01=의존성 배치 등.");

// ============ SLIDE 6 — 8단계 변화 (프로세스) ============
s = p.addSlide(); bg(s, NAVY);
title(s, "구축 후 개발 흐름", "요구 정의 → 모니터링, 재현 가능한 파이프라인", true);
const steps = ["요구 정의", "조사", "설계", "구현", "검증", "리뷰", "배포", "모니터링"];
const subs = ["수용기준·ID", "device-refs", "ADR", "생성-검증", "TB·커버리지", "병렬 4관점", "합성·사인오프", "추세·RCA 환류"];
let sx = 0.55, sy = 2.6, sw = 1.44, sgap = 0.11;
steps.forEach((st, i) => {
  const x = sx + i * (sw + sgap);
  s.addShape(p.ShapeType.roundRect, { x, y: sy, w: sw, h: 1.55, rectRadius: 0.08, fill: { color: i % 2 ? NAVY2 : "1C4E80" } });
  chip(s, x + sw/2 - 0.28, sy + 0.2, String(i + 1), { fill: i < 5 ? TEAL : AMBER, w: 0.56, fs: 17 });
  s.addText(st, { x: x + 0.05, y: sy + 0.82, w: sw - 0.1, h: 0.35, align: "center", fontFace: HF, bold: true, color: LIGHT, fontSize: 13.5, isTextBox: true, margin: 0 });
  s.addText(subs[i], { x: x + 0.05, y: sy + 1.16, w: sw - 0.1, h: 0.32, align: "center", fontFace: BF, color: ICE, fontSize: 10.5, isTextBox: true, margin: 0 });
  if (i < steps.length - 1) s.addText("›", { x: x + sw - 0.02, y: sy + 0.5, w: 0.16, h: 0.5, align: "center", valign: "middle", color: TEAL, fontSize: 20, bold: true, isTextBox: true, margin: 0 });
});
s.addText("불변 원칙: 최종 기능/타이밍 사인오프와 하드웨어 배포 승인은 사람이 담당한다", { x: 0.6, y: 4.7, w: 12.1, h: 0.5, fontFace: HF, italic: true, color: ICE, fontSize: 16, isTextBox: true, margin: 0 });
s.addText("검증자 무수정 · 자동 커밋/릴리스 금지 · 재시도 상한(3) 후 사람 에스컬레이션", { x: 0.6, y: 5.35, w: 12.1, h: 0.4, fontFace: BF, color: "AEC3D6", fontSize: 13, isTextBox: true, margin: 0 });
s.addNotes("8단계 파이프라인. 리뷰·모니터링 신설. 사람 사인오프는 불변.");

// ============ SLIDE 7 — 비용 ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "구축 비용", "추가 비용은 저작(1회성) + 토큰(운영)에 국한");
const costs = [
  ["1회성 · 구축", "파일럿 12주", "시니어 RTL/검증 + AI 하네스 엔지니어 ≈ 1.5 FTE·분기\n에이전트 10 + 스킬 6 + references 초안", TEAL],
  ["운영 · 토큰", "모델 API", "설계·검토 opus / 구현·실행 sonnet\nProgressive Disclosure·mock 우선으로 절감", AMBER],
  ["기존 자산 재활용", "추가비용 최소", "EDA 라이선스·컴퓨팅은 기존 지출\n하네스는 툴을 호출만 함 · 오픈소스 병행", NAVY2],
];
py = 2.0; pw = 3.94; ph = 3.5;
costs.forEach((it, i) => {
  const x = 0.6 + i * (pw + 0.28);
  card(s, x, py, pw, ph, { fill: LIGHT, line: "E1E8EF" });
  s.addText(it[0], { x: x + 0.35, y: py + 0.35, w: pw - 0.7, h: 0.5, fontFace: HF, bold: true, color: NAVY, fontSize: 18, isTextBox: true, margin: 0 });
  s.addText(it[1], { x: x + 0.35, y: py + 0.95, w: pw - 0.7, h: 0.5, fontFace: HF, bold: true, color: it[3], fontSize: 22, isTextBox: true, margin: 0 });
  s.addText(it[2], { x: x + 0.35, y: py + 1.75, w: pw - 0.7, h: 1.6, fontFace: BF, color: INK, fontSize: 13.5, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
});
s.addText("※ 수치는 가정 기반 예시(illustrative) — 인건비 단가·EDA 보유·클라우드 정책에 따라 재산정", { x: 0.6, y: 5.85, w: 12.1, h: 0.4, fontFace: BF, italic: true, color: "9A5B00", fontSize: 12.5, isTextBox: true, margin: 0 });
s.addNotes("비용: 1회성 저작 + 운영 토큰. EDA/컴퓨팅은 기존 자산. 수치는 예시임을 강조.");

// ============ SLIDE 8 — 효과 (KPI) ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "구축 효과", "With/Without A/B로 측정 — 목표치는 파일럿에서 확정");
const kpis = [
  ["리드타임", "▼", "사양→린트 통과 초안까지 시간"],
  ["린트/CDC 위반", "▼", "KLOC당 위반 밀도"],
  ["실패 분류 시간", "▼", "리그레션 실패→원인 후보"],
  ["리뷰 커버리지", "▲", "변경당 점검 관점 수"],
];
let kx = 0.6, kw = 2.95, kgap = 0.2, ky = 1.95, kh = 2.0;
kpis.forEach((it, i) => {
  const x = kx + i * (kw + kgap);
  card(s, x, ky, kw, kh, { fill: PANEL });
  const up = it[1] === "▲";
  s.addText(it[1], { x: x + 0.25, y: ky + 0.35, w: 0.7, h: 0.7, fontFace: BF, bold: true, color: up ? "0A8F55" : "C23A2B", fontSize: 30, isTextBox: true, margin: 0 });
  s.addText(it[0], { x: x + 0.95, y: ky + 0.4, w: kw - 1.1, h: 0.6, fontFace: HF, bold: true, color: NAVY, fontSize: 16, isTextBox: true, margin: 0 });
  s.addText(it[2], { x: x + 0.28, y: ky + 1.25, w: kw - 0.5, h: 0.65, fontFace: BF, color: MUT, fontSize: 12, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
});
// qualitative benefits
const bens = [
  ["재현성", "조사·설계 근거·검증 절차가 파일로 남아 감사·재사용 가능"],
  ["일관성", "코딩·리셋·CDC 규칙을 스킬로 고정 → 반복 위반 감소"],
  ["지식 코드화", "시니어 판단 기준을 실행 가능한 규칙으로 이전 → 온보딩 단축"],
];
let by = 4.35;
bens.forEach((it, i) => {
  const y = by + i * 0.82;
  chip(s, 0.7, y, "✓", { fill: TEAL, w: 0.44, fs: 15 });
  s.addText([{ text: it[0] + "  ", options: { bold: true, color: NAVY } }, { text: it[1], options: { color: INK } }],
    { x: 1.3, y: y - 0.02, w: 11.3, h: 0.55, fontFace: BF, fontSize: 14.5, isTextBox: true, margin: 0, valign: "middle" });
});
s.addNotes("효과: 정량 KPI 방향(측정 프레임, 목표치 파일럿 확정) + 정성 효과 3.");

// ============ SLIDE 9 — 인력·조직 ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "인력·조직 변화", "대체가 아니라 재배치 — 반복은 하네스, 판단은 사람");
// before/after two columns
card(s, 0.6, 2.0, 5.85, 3.9, { fill: PANEL });
s.addText("역할의 이동", { x: 0.9, y: 2.25, w: 5.2, h: 0.5, fontFace: HF, bold: true, color: NAVY, fontSize: 18, isTextBox: true, margin: 0 });
const moves = [
  "RTL 설계자 · 반복 코딩 ↓ → 아키텍처·리뷰·규칙 저작 ↑",
  "검증 엔지니어 · TB 뼈대 ↓ → 전략·커버리지 클로저 ↑",
  "시니어/리드 · 개별 지시 ↓ → 하네스 관리·지식 코드화",
  "주니어 · 하네스 가드레일 안에서 온보딩 가속",
];
moves.forEach((m, i) => s.addText(m, { x: 0.9, y: 2.9 + i * 0.72, w: 5.3, h: 0.65, fontFace: BF, color: INK, fontSize: 13.5, bullet: { code: "2022", indent: 14 }, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 }));

card(s, 6.75, 2.0, 5.95, 3.9, { fill: NAVY, });
s.addText("신설·강화 역할", { x: 7.05, y: 2.25, w: 5.4, h: 0.5, fontFace: HF, bold: true, color: LIGHT, fontSize: 18, isTextBox: true, margin: 0 });
const newroles = [
  ["하네스 스튜어드", "에이전트·스킬·규칙 관리 및 하네스 진화(Phase 0 감사·운영 루프)"],
  ["AI/EDA 통합 담당", "툴 배치·CI 연동·토큰 비용 관리"],
];
newroles.forEach((r, i) => {
  const y = 2.95 + i * 1.15;
  chip(s, 7.05, y, String(i + 1), { fill: TEAL, w: 0.5, fs: 15 });
  s.addText(r[0], { x: 7.7, y: y - 0.02, w: 4.8, h: 0.4, fontFace: HF, bold: true, color: LIGHT, fontSize: 15.5, isTextBox: true, margin: 0 });
  s.addText(r[1], { x: 7.7, y: y + 0.42, w: 4.8, h: 0.7, fontFace: BF, color: ICE, fontSize: 12.5, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
});
s.addText("동시 활성 에이전트 3~5명 권장 · 하네스도 버전관리·리뷰 대상(drift 방지)", { x: 6.9, y: 5.35, w: 5.7, h: 0.5, fontFace: BF, italic: true, color: "AEC3D6", fontSize: 11.5, isTextBox: true, margin: 0 });
s.addNotes("역할 재배치. 스튜어드 신설. 동시 활성 3~5명.");

// ============ SLIDE 10 — 로드맵 ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "도입 로드맵", "저위험 단계적 도입 — 파일럿 약 12주 후 확산");
const road = [
  ["0", "준비", "2주", "EDA 배치·보안 점검, 파일럿 IP 선정"],
  ["1", "하네스 골격", "3주", "메타스킬 초안 → 에이전트·스킬 정제(mock)"],
  ["2", "실행 스킬 연동", "3주", "run-lint/sim/synth live, references 작성"],
  ["3", "파일럿 A/B", "3주", "With/Without 실측, KPI 리포트"],
  ["4", "정착·확산", "1주+", "규칙 확정, 스튜어드 지정, 온보딩"],
];
let ry = 2.0, rh = 0.92, rgap = 0.14;
road.forEach((it, i) => {
  const y = ry + i * (rh + rgap);
  card(s, 0.6, y, 12.1, rh, { fill: i % 2 ? PANEL : "FFFFFF", line: "E6ECF2" });
  chip(s, 0.85, y + rh/2 - 0.3, it[0], { fill: i < 4 ? TEAL : AMBER, w: 0.6, fs: 20 });
  s.addText(it[1], { x: 1.7, y: y + 0.1, w: 3.0, h: rh - 0.2, valign: "middle", fontFace: HF, bold: true, color: NAVY, fontSize: 17, isTextBox: true, margin: 0 });
  s.addText(it[2], { x: 4.7, y: y + 0.1, w: 1.5, h: rh - 0.2, valign: "middle", fontFace: HF, bold: true, color: it[3] === undefined ? TEAL : TEAL, fontSize: 15, isTextBox: true, margin: 0 });
  s.addText(it[3], { x: 6.2, y: y + 0.1, w: 6.3, h: rh - 0.2, valign: "middle", fontFace: BF, color: INK, fontSize: 13.5, isTextBox: true, margin: 0 });
});
s.addNotes("로드맵 5단계. 파일럿 12주 후 KPI 충족 시 확산.");

// ============ SLIDE 10.5 — 버전 관리·CI (Bitbucket DC) ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "버전 관리 · CI", "온프레미스 Bitbucket Data Center — IP는 사내 경계를 벗어나지 않는다");
// left: repo + PR gate
card(s, 0.6, 1.95, 5.9, 4.05, { fill: PANEL });
s.addText("리포지토리 · PR 게이트", { x: 0.9, y: 2.15, w: 5.3, h: 0.45, fontFace: HF, bold: true, color: NAVY, fontSize: 17, isTextBox: true, margin: 0 });
[
  "하네스 정의(.claude/·CLAUDE.md) + 설계 자산(rtl·tb·constraints)을 한 리포에서 코드처럼 관리",
  "기능 브랜치 → PR → 리뷰·승인 → 보호 브랜치 병합",
  "Merge checks: 필수 승인 · 필수 빌드 통과 · 미해결 태스크 0",
  "최종 사인오프 = Bitbucket 필수 승인(사람)",
].forEach((t, i) => s.addText(t, { x: 0.95, y: 2.7 + i * 0.78, w: 5.35, h: 0.72, fontFace: BF, color: INK, fontSize: 13, bullet: { code: "2022", indent: 12 }, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 }));

// right: CI flow (Jenkins/Bamboo) dark card
card(s, 6.75, 1.95, 5.95, 4.05, { fill: NAVY });
s.addText("CI — 사내 Jenkins / Bamboo", { x: 7.05, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, bold: true, color: LIGHT, fontSize: 17, isTextBox: true, margin: 0 });
const ci = [
  ["PR", "run-lint · run-sim (mock) — 공용 에이전트로 빠른 게이트", TEAL],
  ["main", "USE_LIVE_TOOLS=1 (Vivado/시뮬) — EDA 라이선스 보유 사내 에이전트", AMBER],
  ["결과", "Build Status · Code Insights 로 PR에 되돌려 표시", TEAL],
];
ci.forEach((it, i) => {
  const y = 2.72 + i * 0.92;
  s.addShape(p.ShapeType.roundRect, { x: 7.05, y, w: 1.1, h: 0.5, rectRadius: 0.06, fill: { color: it[2] } });
  s.addText(it[0], { x: 7.05, y, w: 1.1, h: 0.5, align: "center", valign: "middle", fontFace: HF, bold: true, color: i===1?NAVY:LIGHT, fontSize: 13, isTextBox: true, margin: 0 });
  s.addText(it[1], { x: 8.3, y: y - 0.02, w: 4.25, h: 0.6, valign: "middle", fontFace: BF, color: "E7F0F8", fontSize: 12, isTextBox: true, margin: 0, lineSpacingMultiple: 1.03 });
});
s.addText("Bitbucket Pipelines(클라우드 전용)는 미사용 · 하네스는 코멘트/리포트까지, 자동 병합·승인 금지", { x: 7.05, y: 5.5, w: 5.5, h: 0.45, fontFace: BF, italic: true, color: "AEC3D6", fontSize: 10.8, isTextBox: true, margin: 0, lineSpacingMultiple: 1.03 });
s.addText("모델 호출도 사내 경계(Bedrock/Vertex over VPC, 또는 사내 게이트웨이) 안에서 수행 → 온프레미스 정책과 일치", { x: 0.6, y: 6.25, w: 12.1, h: 0.45, fontFace: BF, italic: true, color: MUT, fontSize: 12.5, isTextBox: true, margin: 0 });
s.addNotes("버전관리: 온프레미스 Bitbucket Data Center. CI는 사내 Jenkins/Bamboo(웹훅) + Code Insights. Pipelines 클라우드 전용 미사용. 사인오프는 사람.");

// ============ SLIDE 11 — 파일럿 IP ============
s = p.addSlide(); bg(s, LIGHT);
title(s, "파일럿 대상 IP", "AXI4-Lite로 제어되는 IEEE 1500 HBM PMBIST 컨트롤러");
// flow blocks
const blocks = [
  ["호스트", "AXI4-Lite\nCSR 제어", NAVY2],
  ["IEEE 1500\n컨트롤러", "WSC · WSI/WSO\n시퀀스 FSM", TEAL],
  ["HBM PMBIST", "채널별 BIST\n결과 수집", AMBER],
];
let bx = 0.8, bw = 3.4, bgap = 0.9, byy = 2.15, bhh = 1.7;
blocks.forEach((it, i) => {
  const x = bx + i * (bw + bgap);
  s.addShape(p.ShapeType.roundRect, { x, y: byy, w: bw, h: bhh, rectRadius: 0.1, fill: { color: it[2] } });
  s.addText(it[0], { x: x + 0.15, y: byy + 0.28, w: bw - 0.3, h: 0.7, align: "center", fontFace: HF, bold: true, color: LIGHT, fontSize: 18, isTextBox: true, margin: 0 });
  s.addText(it[1], { x: x + 0.15, y: byy + 0.95, w: bw - 0.3, h: 0.65, align: "center", fontFace: BF, color: "EAF3FA", fontSize: 12.5, isTextBox: true, margin: 0 });
  if (i < 2) s.addText("→", { x: x + bw + 0.05, y: byy + 0.5, w: 0.8, h: 0.7, align: "center", valign: "middle", color: MUT, fontSize: 28, bold: true, isTextBox: true, margin: 0 });
});
// key risk + deliverables
card(s, 0.6, 4.25, 5.85, 2.6, { fill: PANEL });
s.addText("핵심 리스크", { x: 0.9, y: 4.45, w: 5.2, h: 0.4, fontFace: HF, bold: true, color: NAVY, fontSize: 16, isTextBox: true, margin: 0 });
["aclk(AXI) ↔ WRCK(테스트) 클록 도메인 크로싱", "리셋 도메인 · 시퀀스 FSM 정합성", "AXI4-Lite 프로토콜 준수 · SLVERR 정책"].forEach((t, i) =>
  s.addText(t, { x: 0.95, y: 4.95 + i * 0.55, w: 5.3, h: 0.5, fontFace: BF, color: INK, fontSize: 13, bullet: { code: "2022", indent: 12 }, isTextBox: true, margin: 0 }));
card(s, 6.75, 4.25, 5.95, 2.6, { fill: PANEL });
s.addText("제공한 하네스 골격 (doc/ip/)", { x: 7.05, y: 4.45, w: 5.4, h: 0.4, fontFace: HF, bold: true, color: NAVY, fontSize: 16, isTextBox: true, margin: 0 });
["에이전트 8종 + 스킬 5종 + device-refs 라우터", "요구정의(REQ-*)·수용기준·체크리스트", "참조 RTL 스텁 + 스모크 TB", "run-lint/sim: mock + Verilator/xsim live 연동"].forEach((t, i) =>
  s.addText(t, { x: 7.1, y: 4.95 + i * 0.46, w: 5.4, h: 0.45, fontFace: BF, color: INK, fontSize: 12.5, bullet: { code: "2022", indent: 12 }, isTextBox: true, margin: 0 }));
s.addNotes("파일럿 IP: IEEE1500 HBM PMBIST + AXI4-Lite. CDC가 핵심 리스크. doc/ip/에 골격 제공.");

// ============ SLIDE 12 — 결론 ============
s = p.addSlide(); bg(s, NAVY);
s.addText("결론", { x: 0.7, y: 1.5, w: 11, h: 0.4, fontFace: BF, bold: true, color: TEAL, fontSize: 14, charSpacing: 3, isTextBox: true, margin: 0 });
s.addText("툴 체인이 스크립트 친화적이고 검증이 반복적인\nRTL은 하네스 효과가 가장 큰 도메인", { x: 0.7, y: 1.95, w: 11.9, h: 1.5, fontFace: HF, bold: true, color: LIGHT, fontSize: 30, lineSpacingMultiple: 1.05, isTextBox: true, margin: 0 });
const concl = [
  "검증된 하네스 패턴(생성-검증·팬아웃/팬인·라우터·메타스킬)을 RTL에 매핑",
  "EDA·컴퓨팅은 기존 자산 재활용 → 추가비용은 저작(1회성)+토큰(운영)",
  "파일럿 A/B로 효과를 정량 검증한 뒤 확산하는 저위험 단계적 도입",
];
concl.forEach((t, i) => {
  const y = 3.85 + i * 0.72;
  chip(s, 0.75, y, "→", { fill: i === 2 ? AMBER : TEAL, w: 0.44, fs: 15 });
  s.addText(t, { x: 1.4, y: y - 0.02, w: 11.2, h: 0.6, fontFace: BF, color: "E7F0F8", fontSize: 15.5, isTextBox: true, margin: 0, valign: "middle" });
});
s.addText("다음 단계 — 파일럿 IP 골격(doc/ip/)으로 12주 파일럿 착수", { x: 0.7, y: 6.35, w: 11.9, h: 0.5, fontFace: HF, italic: true, color: ICE, fontSize: 16, isTextBox: true, margin: 0 });
s.addNotes("결론 + 다음 단계: doc/ip 골격으로 파일럿 착수.");

p.writeFile({ fileName: "/home/user/harness-engineering-with-cc/doc/제안서.pptx" }).then(f => console.log("wrote", f));
