// tb_smoke.sv — 스모크 테스트벤치 (참조 스텁)
// AXI4-Lite로 CSR write/read 몇 건 + IEEE 1500 시퀀스 개시 확인.
// Verilator(--binary --timing) 및 xsim에서 실행 가능한 표준 SV 스타일.
// 자기검증: 실패 시 $error, 종료 시 pass/fail 마커를 출력한다(로그 파서 대상).
`timescale 1ns/1ps
`default_nettype none

module tb_smoke;
  localparam int ADDR_WIDTH = 8;
  localparam int DATA_WIDTH = 32;

  // 클록/리셋
  logic aclk = 0, aresetn = 0;
  logic wrck = 0, wrstn = 0;
  always #5  aclk = ~aclk;   // 100 MHz
  always #7  wrck = ~wrck;   // ~71 MHz (비동기 도메인)

  // AXI4-Lite 신호
  logic [ADDR_WIDTH-1:0]   awaddr;  logic awvalid;  logic awready;
  logic [DATA_WIDTH-1:0]   wdata;   logic [DATA_WIDTH/8-1:0] wstrb; logic wvalid; logic wready;
  logic [1:0]              bresp;   logic bvalid;   logic bready;
  logic [ADDR_WIDTH-1:0]   araddr;  logic arvalid;  logic arready;
  logic [DATA_WIDTH-1:0]   rdata;   logic [1:0] rresp; logic rvalid; logic rready;

  logic select_wir, capture_wr, shift_wr, update_wr, wso;
  logic wsi = 1'b0, wso_in = 1'b0;

  int errors = 0;

  pmbist_ctrl_top #(.ADDR_WIDTH(ADDR_WIDTH), .DATA_WIDTH(DATA_WIDTH)) dut (
    .aclk(aclk), .aresetn(aresetn), .wrck(wrck), .wrstn(wrstn),
    .awaddr(awaddr), .awvalid(awvalid), .awready(awready),
    .wdata(wdata), .wstrb(wstrb), .wvalid(wvalid), .wready(wready),
    .bresp(bresp), .bvalid(bvalid), .bready(bready),
    .araddr(araddr), .arvalid(arvalid), .arready(arready),
    .rdata(rdata), .rresp(rresp), .rvalid(rvalid), .rready(rready),
    .select_wir(select_wir), .capture_wr(capture_wr), .shift_wr(shift_wr),
    .update_wr(update_wr), .wso(wso), .wsi(wsi), .wso_in(wso_in)
  );

  // AXI4-Lite write 태스크
  task automatic axi_write(input [ADDR_WIDTH-1:0] addr, input [DATA_WIDTH-1:0] data);
    begin
      @(posedge aclk);
      awaddr <= addr; awvalid <= 1'b1;
      wdata  <= data; wstrb <= '1; wvalid <= 1'b1;
      bready <= 1'b1;
      // 핸드셰이크 대기
      do @(posedge aclk); while (!(awready && awvalid));
      awvalid <= 1'b0;
      do @(posedge aclk); while (!(wready && wvalid));
      wvalid <= 1'b0;
      do @(posedge aclk); while (!bvalid);
      if (bresp !== 2'b00) begin
        $error("[TB] write resp != OKAY @0x%02h (bresp=%0d)", addr, bresp);
        errors++;
      end
      @(posedge aclk); bready <= 1'b0;
    end
  endtask

  // AXI4-Lite read 태스크
  task automatic axi_read(input [ADDR_WIDTH-1:0] addr, output [DATA_WIDTH-1:0] data);
    begin
      @(posedge aclk);
      araddr <= addr; arvalid <= 1'b1; rready <= 1'b1;
      do @(posedge aclk); while (!(arready && arvalid));
      arvalid <= 1'b0;
      do @(posedge aclk); while (!rvalid);
      data = rdata;
      @(posedge aclk); rready <= 1'b0;
    end
  endtask

  logic [DATA_WIDTH-1:0] rd;

  initial begin
    // 초기화
    awaddr='0; awvalid=0; wdata='0; wstrb='0; wvalid=0; bready=0;
    araddr='0; arvalid=0; rready=0;

    // 리셋 해제
    repeat (4) @(posedge aclk); aresetn <= 1'b1;
    repeat (4) @(posedge wrck); wrstn   <= 1'b1;
    repeat (4) @(posedge aclk);

    // REQ-AXI-001/002: ALGO write/read back
    axi_write(8'h08, 32'hDEAD_BEEF);          // ALGO
    axi_read (8'h08, rd);
    if (rd !== 32'hDEAD_BEEF) begin
      $error("[TB] ALGO readback mismatch: 0x%08h", rd); errors++;
    end

    // REQ-1500-002: W1500_CMD로 시퀀스 개시 → busy/done 관측
    axi_write(8'h14, 32'h0000_0001);          // W1500_CMD[0]=1
    // done이 STATUS[1]로 올라올 때까지 관측(타임아웃 보호)
    begin : wait_done
      int t;
      for (t = 0; t < 2000; t++) begin
        axi_read(8'h04, rd);                  // STATUS
        if (rd[1]) disable wait_done;         // done
      end
      $error("[TB] IEEE1500 done timeout"); errors++;
    end

    // REQ-AXI-003: 미정의 주소 읽기 → SLVERR 기대
    axi_read(8'hF0, rd);
    if (rresp !== 2'b10) begin
      $error("[TB] undefined-addr read expected SLVERR, got %0d", rresp); errors++;
    end

    // 결과 마커(로그 파서 대상)
    if (errors == 0) $display("TB_RESULT: PASS");
    else             $display("TB_RESULT: FAIL errors=%0d", errors);
    $finish;
  end

  // 전역 타임아웃(무한 대기 방지)
  initial begin
    #200000;
    $display("TB_RESULT: FAIL timeout");
    $finish;
  end
endmodule

`default_nettype wire
