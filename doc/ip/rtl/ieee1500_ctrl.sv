// ieee1500_ctrl.sv — IEEE 1500 WSC 생성 FSM (참조 스텁)
// WRCK 도메인에서 SelectWIR/CaptureWR/ShiftWR/UpdateWR 순서로 래퍼 명령을 구동한다.
// 주의: 예시 골격. 실제 체인 길이/명령 인코딩은 사내 사양으로 확정한다.
`default_nettype none

module ieee1500_ctrl #(
  parameter int CHAIN_LEN_WIDTH = 8
)(
  input  wire                        wrck,
  input  wire                        wrstn,       // active-low (WRCK 도메인 동기화 리셋 권장)
  input  wire                        start,       // 시퀀스 개시(WRCK 도메인으로 동기화된 신호)
  input  wire [CHAIN_LEN_WIDTH-1:0]  chain_len,   // 시프트 길이(프로그래머블)
  input  wire                        wsi,         // 직렬 입력 데이터
  // IEEE 1500 WSC 출력
  output reg                         select_wir,
  output reg                         capture_wr,
  output reg                         shift_wr,
  output reg                         update_wr,
  output reg                         wso,         // 직렬 출력(간이 시프트)
  output reg                         busy,
  output reg                         done,
  input  wire                        wso_in       // 래핑된 코어로부터의 WSO 수집
);
  typedef enum logic [2:0] {
    S_IDLE, S_SELECT, S_CAPTURE, S_SHIFT, S_UPDATE, S_DONE
  } state_e;

  state_e state, nstate;
  reg [CHAIN_LEN_WIDTH-1:0] cnt;

  // 상태 등록
  always @(posedge wrck) begin
    if (!wrstn) state <= S_IDLE;
    else        state <= nstate;
  end

  // 다음 상태(표준 순서 준수: SELECT→CAPTURE→SHIFT→UPDATE)
  always @* begin
    nstate = state;
    case (state)
      S_IDLE:    if (start) nstate = S_SELECT;
      S_SELECT:  nstate = S_CAPTURE;
      S_CAPTURE: nstate = S_SHIFT;
      S_SHIFT:   if (cnt == '0) nstate = S_UPDATE;
      S_UPDATE:  nstate = S_DONE;
      S_DONE:    nstate = S_IDLE;
      default:   nstate = S_IDLE;
    endcase
  end

  // 출력 및 카운터
  always @(posedge wrck) begin
    if (!wrstn) begin
      select_wir <= 1'b0;
      capture_wr <= 1'b0;
      shift_wr   <= 1'b0;
      update_wr  <= 1'b0;
      wso        <= 1'b0;
      busy       <= 1'b0;
      done       <= 1'b0;
      cnt        <= '0;
    end else begin
      // 기본값(1-사이클 신호는 매 사이클 클리어)
      capture_wr <= 1'b0;
      update_wr  <= 1'b0;
      done       <= 1'b0;

      case (nstate)
        S_IDLE: begin
          select_wir <= 1'b0;
          shift_wr   <= 1'b0;
          busy       <= 1'b0;
        end
        S_SELECT: begin
          select_wir <= 1'b1;
          busy       <= 1'b1;
          cnt        <= chain_len;
        end
        S_CAPTURE: begin
          capture_wr <= 1'b1;
        end
        S_SHIFT: begin
          shift_wr <= 1'b1;
          wso      <= wso_in ^ wsi; // 간이 시프트(예시). 실제 체인은 코어 래퍼가 담당.
          if (cnt != '0) cnt <= cnt - 1'b1;
        end
        S_UPDATE: begin
          shift_wr  <= 1'b0;
          update_wr <= 1'b1;
        end
        S_DONE: begin
          done <= 1'b1;
          busy <= 1'b0;
        end
        default: ;
      endcase
    end
  end
endmodule

`default_nettype wire
