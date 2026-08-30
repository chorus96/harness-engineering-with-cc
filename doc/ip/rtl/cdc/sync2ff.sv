// sync2ff.sv — 단일 비트 2-플립플롭 동기화기 (CDC)
// 왜: 비동기 도메인(예: aclk→WRCK) 교차 단일 비트의 메타스테이빌리티 완화.
// 다중 비트 값에는 사용 금지(그레이코드/핸드셰이크/FIFO 사용).
`default_nettype none

module sync2ff #(
  parameter int STAGES = 2
)(
  input  wire dst_clk,
  input  wire dst_rstn,   // active-low
  input  wire async_in,
  output wire sync_out
);
  (* ASYNC_REG = "TRUE" *) reg [STAGES-1:0] sync_q;

  always @(posedge dst_clk) begin
    if (!dst_rstn) sync_q <= '0;
    else           sync_q <= {sync_q[STAGES-2:0], async_in};
  end

  assign sync_out = sync_q[STAGES-1];
endmodule

`default_nettype wire
