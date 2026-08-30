// axil_csr.sv — AXI4-Lite 슬레이브 CSR (참조 스텁, 합성 가능 스타일)
// IEEE 1500 HBM PMBIST 컨트롤러의 제어/상태 레지스터.
// 주의: 예시 골격이며, 실제 주소 맵/필드는 docs/requirements.md 및 사내 사양으로 확정한다.
`default_nettype none

module axil_csr #(
  parameter int ADDR_WIDTH = 8,
  parameter int DATA_WIDTH = 32
)(
  input  wire                    aclk,
  input  wire                    aresetn,   // active-low

  // --- AXI4-Lite write address ---
  input  wire [ADDR_WIDTH-1:0]   awaddr,
  input  wire                    awvalid,
  output wire                    awready,
  // --- write data ---
  input  wire [DATA_WIDTH-1:0]   wdata,
  input  wire [DATA_WIDTH/8-1:0] wstrb,
  input  wire                    wvalid,
  output wire                    wready,
  // --- write response ---
  output reg  [1:0]              bresp,
  output reg                     bvalid,
  input  wire                    bready,
  // --- read address ---
  input  wire [ADDR_WIDTH-1:0]   araddr,
  input  wire                    arvalid,
  output wire                    arready,
  // --- read data ---
  output reg  [DATA_WIDTH-1:0]   rdata,
  output reg  [1:0]              rresp,
  output reg                     rvalid,
  input  wire                    rready,

  // --- CSR fields to core logic ---
  output reg                     start_o,      // CTRL[0]
  output reg                     abort_o,      // CTRL[1]
  output reg  [DATA_WIDTH-1:0]   algo_o,       // ALGO
  output reg  [DATA_WIDTH-1:0]   addr_range_o, // ADDR_RANGE
  output reg                     w1500_cmd_o,  // W1500_CMD[0] pulse
  input  wire                    busy_i,       // STATUS[0]
  input  wire                    done_i,       // STATUS[1]
  input  wire                    fail_i,       // STATUS[2]
  input  wire [DATA_WIDTH-1:0]   result_i      // RESULT
);
  // 레지스터 오프셋(예시)
  localparam logic [ADDR_WIDTH-1:0] ADDR_CTRL       = 8'h00;
  localparam logic [ADDR_WIDTH-1:0] ADDR_STATUS     = 8'h04;
  localparam logic [ADDR_WIDTH-1:0] ADDR_ALGO       = 8'h08;
  localparam logic [ADDR_WIDTH-1:0] ADDR_ADDR_RANGE = 8'h0C;
  localparam logic [ADDR_WIDTH-1:0] ADDR_RESULT     = 8'h10;
  localparam logic [ADDR_WIDTH-1:0] ADDR_W1500_CMD  = 8'h14;

  localparam logic [1:0] RESP_OKAY   = 2'b00;
  localparam logic [1:0] RESP_SLVERR = 2'b10;

  // 단순 핸드셰이크(단일 트랜잭션). 상호운용성 우선의 보수적 구현.
  reg aw_hs, w_hs;
  wire wr_fire = aw_hs && w_hs;

  assign awready = !aw_hs;
  assign wready  = !w_hs;

  // 쓰기 주소 래치
  reg [ADDR_WIDTH-1:0] awaddr_q;
  always @(posedge aclk) begin
    if (!aresetn) begin
      aw_hs    <= 1'b0;
      awaddr_q <= '0;
    end else begin
      if (awvalid && awready) begin
        aw_hs    <= 1'b1;
        awaddr_q <= awaddr;
      end else if (bvalid && bready) begin
        aw_hs <= 1'b0;
      end
    end
  end

  // 쓰기 데이터 래치
  reg [DATA_WIDTH-1:0]   wdata_q;
  reg [DATA_WIDTH/8-1:0] wstrb_q;
  always @(posedge aclk) begin
    if (!aresetn) begin
      w_hs    <= 1'b0;
      wdata_q <= '0;
      wstrb_q <= '0;
    end else begin
      if (wvalid && wready) begin
        w_hs    <= 1'b1;
        wdata_q <= wdata;
        wstrb_q <= wstrb;
      end else if (bvalid && bready) begin
        w_hs <= 1'b0;
      end
    end
  end

  // 바이트 스트로브 적용 헬퍼
  function automatic [DATA_WIDTH-1:0] apply_strb
    (input [DATA_WIDTH-1:0] old_v, input [DATA_WIDTH-1:0] new_v,
     input [DATA_WIDTH/8-1:0] strb);
    integer b;
    begin
      apply_strb = old_v;
      for (b = 0; b < DATA_WIDTH/8; b = b + 1)
        if (strb[b]) apply_strb[b*8 +: 8] = new_v[b*8 +: 8];
    end
  endfunction

  // 쓰기 처리 + 쓰기 응답
  always @(posedge aclk) begin
    if (!aresetn) begin
      start_o      <= 1'b0;
      abort_o      <= 1'b0;
      algo_o       <= '0;
      addr_range_o <= '0;
      w1500_cmd_o  <= 1'b0;
      bvalid       <= 1'b0;
      bresp        <= RESP_OKAY;
    end else begin
      // start/cmd는 1-사이클 펄스
      start_o     <= 1'b0;
      w1500_cmd_o <= 1'b0;

      if (wr_fire && !bvalid) begin
        bvalid <= 1'b1;
        bresp  <= RESP_OKAY;
        case (awaddr_q)
          ADDR_CTRL: begin
            if (wstrb_q[0]) begin
              start_o <= wdata_q[0];
              abort_o <= wdata_q[1];
            end
          end
          ADDR_ALGO:       algo_o       <= apply_strb(algo_o,       wdata_q, wstrb_q);
          ADDR_ADDR_RANGE: addr_range_o <= apply_strb(addr_range_o, wdata_q, wstrb_q);
          ADDR_W1500_CMD:  if (wstrb_q[0]) w1500_cmd_o <= wdata_q[0];
          default:         bresp <= RESP_SLVERR; // 미정의/RO 주소 쓰기
        endcase
      end else if (bvalid && bready) begin
        bvalid <= 1'b0;
      end
    end
  end

  // 읽기 처리
  reg ar_hs;
  assign arready = !ar_hs && !rvalid;
  always @(posedge aclk) begin
    if (!aresetn) begin
      ar_hs  <= 1'b0;
      rvalid <= 1'b0;
      rresp  <= RESP_OKAY;
      rdata  <= '0;
    end else begin
      if (arvalid && arready) begin
        ar_hs  <= 1'b1;
        rvalid <= 1'b1;
        rresp  <= RESP_OKAY;
        case (araddr)
          ADDR_CTRL:       rdata <= {30'd0, abort_o, start_o};
          ADDR_STATUS:     rdata <= {29'd0, fail_i, done_i, busy_i};
          ADDR_ALGO:       rdata <= algo_o;
          ADDR_ADDR_RANGE: rdata <= addr_range_o;
          ADDR_RESULT:     rdata <= result_i;
          default: begin
            rdata <= '0;
            rresp <= RESP_SLVERR; // 미정의 주소 읽기
          end
        endcase
      end else if (rvalid && rready) begin
        rvalid <= 1'b0;
        ar_hs  <= 1'b0;
      end
    end
  end

endmodule

`default_nettype wire
