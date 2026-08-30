// pmbist_ctrl_top.sv — 상위 결선 (참조 스텁)
// AXI4-Lite CSR + IEEE 1500 컨트롤러 + aclk↔wrck CDC 동기화.
// PMBIST 엔진(HBM 래퍼)은 외부 코어로 가정하고 인터페이스만 노출.
`default_nettype none

module pmbist_ctrl_top #(
  parameter int ADDR_WIDTH = 8,
  parameter int DATA_WIDTH = 32
)(
  // AXI 도메인
  input  wire                    aclk,
  input  wire                    aresetn,
  // WRCK(테스트) 도메인
  input  wire                    wrck,
  input  wire                    wrstn,

  // AXI4-Lite
  input  wire [ADDR_WIDTH-1:0]   awaddr,
  input  wire                    awvalid,
  output wire                    awready,
  input  wire [DATA_WIDTH-1:0]   wdata,
  input  wire [DATA_WIDTH/8-1:0] wstrb,
  input  wire                    wvalid,
  output wire                    wready,
  output wire [1:0]              bresp,
  output wire                    bvalid,
  input  wire                    bready,
  input  wire [ADDR_WIDTH-1:0]   araddr,
  input  wire                    arvalid,
  output wire                    arready,
  output wire [DATA_WIDTH-1:0]   rdata,
  output wire [1:0]              rresp,
  output wire                    rvalid,
  input  wire                    rready,

  // IEEE 1500 WSC (칩 상 래핑된 PMBIST 코어로)
  output wire                    select_wir,
  output wire                    capture_wr,
  output wire                    shift_wr,
  output wire                    update_wr,
  output wire                    wso,
  input  wire                    wsi,
  input  wire                    wso_in
);
  // CSR 필드
  wire                  start_axi;
  wire                  abort_axi;
  wire [DATA_WIDTH-1:0] algo;
  wire [DATA_WIDTH-1:0] addr_range;
  wire                  w1500_cmd_axi;
  wire                  busy_wrck;
  wire                  done_wrck;

  // 상태를 AXI 도메인으로 동기화(단일 비트)
  wire busy_axi, done_axi;
  sync2ff u_busy_sync (.dst_clk(aclk), .dst_rstn(aresetn), .async_in(busy_wrck), .sync_out(busy_axi));
  sync2ff u_done_sync (.dst_clk(aclk), .dst_rstn(aresetn), .async_in(done_wrck), .sync_out(done_axi));

  // 개시 명령을 WRCK 도메인으로 동기화(단일 비트 레벨; 실제는 핸드셰이크 권장)
  wire start_wrck;
  sync2ff u_start_sync (.dst_clk(wrck), .dst_rstn(wrstn), .async_in(w1500_cmd_axi | start_axi), .sync_out(start_wrck));

  axil_csr #(.ADDR_WIDTH(ADDR_WIDTH), .DATA_WIDTH(DATA_WIDTH)) u_csr (
    .aclk(aclk), .aresetn(aresetn),
    .awaddr(awaddr), .awvalid(awvalid), .awready(awready),
    .wdata(wdata), .wstrb(wstrb), .wvalid(wvalid), .wready(wready),
    .bresp(bresp), .bvalid(bvalid), .bready(bready),
    .araddr(araddr), .arvalid(arvalid), .arready(arready),
    .rdata(rdata), .rresp(rresp), .rvalid(rvalid), .rready(rready),
    .start_o(start_axi), .abort_o(abort_axi),
    .algo_o(algo), .addr_range_o(addr_range), .w1500_cmd_o(w1500_cmd_axi),
    .busy_i(busy_axi), .done_i(done_axi), .fail_i(1'b0), .result_i(32'd0)
  );

  ieee1500_ctrl #(.CHAIN_LEN_WIDTH(8)) u_1500 (
    .wrck(wrck), .wrstn(wrstn),
    .start(start_wrck), .chain_len(8'd8), .wsi(wsi),
    .select_wir(select_wir), .capture_wr(capture_wr), .shift_wr(shift_wr),
    .update_wr(update_wr), .wso(wso), .busy(busy_wrck), .done(done_wrck),
    .wso_in(wso_in)
  );

  // algo/addr_range/abort는 실제 PMBIST 시퀀서에서 사용(스텁에서는 미결선).
  // verilator lint_off UNUSED
  wire _unused = &{1'b0, algo, addr_range, abort_axi};
  // verilator lint_on UNUSED
endmodule

`default_nettype wire
