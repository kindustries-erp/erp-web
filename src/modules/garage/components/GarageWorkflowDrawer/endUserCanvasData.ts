import { FLOW, GARAGE_AUTO_FLOWS } from "./garageAutoFlows";
import type {
  GarageWorkflowCanvasDefinition,
  GarageWorkflowEdge,
  GarageWorkflowIconName,
  GarageWorkflowLane,
  GarageWorkflowNode,
  GarageWorkflowText,
  GarageWorkflowTone,
} from "./garageWorkflowTypes";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

const ROW_TOP = 64;
const ROW_GAP = 48;
const ROW_HEIGHT = 170;
const ROW_COUNT = 7;
const COL_LEFT = 200;
const COL_WIDTH = 340;
const COL_COUNT = 5;
/** Thẻ rộng 220 đặt giữa cột rộng 340: (340 - 220) / 2 = 60, khe giữa hai cột thẻ nằm đúng ở biên cột. */
const CELL_PAD_X = 60;
const CELL_PAD_Y = 36;
const CANVAS_HEIGHT = ROW_TOP + (ROW_HEIGHT + ROW_GAP) * ROW_COUNT - ROW_GAP;
const LANE_WIDTH = COL_LEFT + COL_WIDTH * COL_COUNT;

const colX = (index: number) => COL_LEFT + COL_WIDTH * index;
const rowY = (index: number) => ROW_TOP + (ROW_HEIGHT + ROW_GAP) * index;
const cellX = (col: number) => colX(col) + CELL_PAD_X;
const cellY = (row: number) => rowY(row) + CELL_PAD_Y;

const column = (id: string, index: number, title: string) => ({
  id,
  title: txt(`workflow.endUser.columns.${id}`, title),
  x: colX(index),
  y: 0,
  width: COL_WIDTH,
  height: CANVAS_HEIGHT,
});

const lane = (
  id: string,
  index: number,
  title: string,
  tone: GarageWorkflowTone,
  icon: GarageWorkflowIconName,
): GarageWorkflowLane => ({
  id,
  title: txt(`workflow.endUser.lanes.${id}`, title),
  tone,
  icon,
  x: 0,
  y: rowY(index),
  width: LANE_WIDTH,
  height: ROW_HEIGHT,
});

/** Thẻ đặt vào ô giao giữa cột `col` và hàng `row` (đếm từ 0). */
const card = (
  id: string,
  kind: GarageWorkflowNode["kind"],
  col: number,
  row: number,
  title: string,
  badges: string[],
  options: { step?: number; statusCode?: number } = {},
): GarageWorkflowNode => ({
  id,
  kind,
  x: cellX(col),
  y: cellY(row),
  title: txt(`workflow.endUser.nodes.${id}.title`, title),
  badges: badges.map((badge, index) =>
    txt(`workflow.endUser.nodes.${id}.badge${index + 1}`, badge),
  ),
  ...options,
});

const edge = (
  id: string,
  source: string,
  target: string,
  label: string,
  options: {
    dashed?: boolean;
    read?: boolean;
    steps?: Record<string, number>;
  } = {},
): GarageWorkflowEdge => ({
  id,
  source,
  target,
  label: txt(`workflow.endUser.edges.${id}`, label),
  ...(options.dashed ? { dashed: true } : {}),
  ...(options.read ? { kind: "read" as const } : {}),
  ...(options.steps
    ? { steps: options.steps, flows: Object.keys(options.steps) }
    : {}),
});

/**
 * Canvas End user: lưới ô cờ ca-rô. Hàng = bộ phận, cột = giai đoạn.
 * Key i18n: workflow.endUser.*
 */
export const END_USER_CANVAS: GarageWorkflowCanvasDefinition = {
  id: "end-user",
  title: txt(
    "workflow.endUser.title",
    "Vận hành garage: xưởng, thu chi, công nợ",
  ),
  description: txt(
    "workflow.endUser.description",
    "Luồng vận hành từ tiếp nhận xe đến thu chi, công nợ và báo cáo. Số trên thẻ là thứ tự thao tác; mũi tên màu A–D là các luồng tự động.",
  ),
  flows: GARAGE_AUTO_FLOWS,
  corner: {
    x: 0,
    y: 0,
    width: COL_LEFT,
    height: ROW_TOP,
    title: txt("workflow.endUser.corner", "Bộ phận \\ Giai đoạn"),
  },
  columns: [
    column("c1", 0, "Tiếp nhận & Báo giá"),
    column("c2", 1, "Sửa chữa"),
    column("c3", 2, "Kết thúc"),
    column("c4", 3, "Thu chi & Công nợ"),
    column("c5", 4, "Đối soát & Báo cáo"),
  ],
  lanes: [
    lane("r1", 0, "Xưởng & Cố vấn", "slate", "wrench"),
    lane("r2", 1, "Hệ thống tự động", "teal", "cpu"),
    lane("r3", 2, "Kế toán: thu tiền", "green", "arrowIn"),
    lane("r4", 3, "Kế toán: chi tiền", "orange", "arrowOut"),
    lane("r5", 4, "Kế toán: chi đặc thù", "orange", "receipt"),
    lane("r6", 5, "Công nợ & đối soát", "rose", "scale"),
    lane("r7", 6, "Quản lý & báo cáo", "violet", "dashboard"),
  ],
  nodes: [
    // Xưởng & Cố vấn
    card(
      "e1",
      "module",
      0,
      0,
      "Tạo phiếu trên KGara",
      ["Tiếp nhận xe, lập báo giá"],
      { step: 1 },
    ),
    card("e2", "state", 1, 0, "Đang sửa", ["Cập nhật chi phí dòng, ghi chú"], {
      step: 3,
    }),
    card(
      "e3",
      "state",
      2,
      0,
      "Kết thúc",
      ["Giao xe, hoàn thành công việc", "Hủy (9): loại khỏi báo cáo"],
      { step: 4, statusCode: 3 },
    ),
    // Hệ thống tự động
    card(
      "s1",
      "module",
      0,
      1,
      "Đồng bộ KGara",
      ["09:15 · 15:15 · 16:15 · 17:15 · 21:15", "Cũng có nút Đồng bộ tay"],
      { step: 2 },
    ),
    card("s2", "module", 1, 1, "Checkpoint xe đang làm", [
      "Dự thu theo xe đang làm",
    ]),
    card(
      "s3",
      "hub-action",
      2,
      1,
      "Hệ thống sinh Dự thu",
      [
        "Phiếu Kết thúc → sinh phiếu thu EXPECTED",
        "Còn phải thu ≤ 0 → không sinh",
      ],
      { step: 5 },
    ),
    card(
      "s4",
      "hub-action",
      3,
      1,
      "Đặt lại Dự thu",
      ["Sau mỗi lần thu hoặc cấn trừ"],
      { step: 9 },
    ),
    card(
      "s5",
      "hub-action",
      4,
      1,
      "Hoa hồng P&L",
      [
        "Mở báo cáo P&L: sinh phiếu chi hoa hồng PENDING",
        "Delta khi P&L tăng sau PAID",
      ],
      { step: 15 },
    ),
    // Kế toán: thu tiền
    card(
      "dt",
      "voucher",
      2,
      2,
      "Dự thu (EXPECTED)",
      [
        "Phiếu thu tự sinh khi phiếu Kết thúc",
        "Hạn = hoàn thành + 7 ngày",
        "Chưa tính vào thực thu",
      ],
      { step: 6 },
    ),
    card(
      "t1",
      "voucher",
      3,
      2,
      "Thu tiền → Thực thu",
      [
        "Phiếu thu gắn phiếu dịch vụ",
        "Thực thu = phiếu thu không còn EXPECTED",
        "Trừ công nợ phải thu",
      ],
      { step: 7 },
    ),
    card(
      "t2",
      "voucher",
      4,
      2,
      "Đối soát sao kê",
      ["Khớp giao dịch ngân hàng", "Thu ngoài sổ khi cần"],
      { step: 8 },
    ),
    // Kế toán: chi tiền
    card(
      "dc",
      "voucher",
      2,
      3,
      "Dự chi (PENDING / APPROVED)",
      ["Phiếu chi chưa chi tiền", "Chưa trừ công nợ phải trả"],
      { step: 10 },
    ),
    card(
      "p1",
      "voucher",
      3,
      3,
      "Thực chi (PAID)",
      ["Trừ công nợ phải trả", "Phiếu PAID bị khóa"],
      { step: 11 },
    ),
    card(
      "p2",
      "voucher",
      4,
      3,
      "Chi phí vận hành (OPEX)",
      ["Nhập tay hoặc lặp hàng tháng", "Nhận khoản HHBH và vật tư tiêu hao"],
      { step: 14 },
    ),
    // Kế toán: chi đặc thù
    card(
      "hh",
      "voucher",
      3,
      4,
      "HHBH (nội dung 4)",
      [
        "Phiếu chi nhóm hoa hồng",
        "Không trừ công nợ",
        "Đã duyệt / đã chi → ghi OPEX",
        "P&L: mục 4.2 Chi phí bán hàng",
      ],
      { step: 12 },
    ),
    card(
      "vt",
      "voucher",
      4,
      4,
      "Vật tư tiêu hao (nội dung 10)",
      [
        "Phiếu chi vật tư xưởng",
        "Không trừ công nợ",
        "Đã duyệt / đã chi → ghi OPEX",
        "P&L: nhóm Giá vốn",
      ],
      { step: 13 },
    ),
    // Công nợ & đối soát
    card(
      "d1",
      "report",
      3,
      5,
      "Công nợ phải thu",
      ["Khách hàng và bảo hiểm, theo tuổi nợ"],
      { step: 16 },
    ),
    card(
      "d2",
      "report",
      4,
      5,
      "Hóa đơn VAT",
      ["Bán ra (OUT), mua vào (IN)", "Cấn trừ công nợ phải trả NCC"],
      { step: 17 },
    ),
    // Quản lý & báo cáo
    card("m1", "report", 3, 6, "Dòng tiền ròng", ["Thực thu − Thực chi"], {
      step: 18,
    }),
    card(
      "m2",
      "report",
      4,
      6,
      "Dashboard & P&L",
      [
        "Doanh thu, lãi gộp theo ngày hoàn thành",
        "Bỏ phiếu đã xóa mềm và phiếu hủy",
      ],
      { step: 19 },
    ),
  ],
  edges: [
    edge("ee1", "e1", "e2", "Bắt đầu sửa", { steps: { [FLOW.manual]: 1 } }),
    edge("ee2", "e2", "e3", "Hoàn tất", { steps: { [FLOW.manual]: 2 } }),
    edge("ee3", "e3", "s3", "Hệ thống sinh dự thu", {
      steps: { [FLOW.forecast]: 2 },
    }),
    edge("ee4", "s1", "e1", "Cập nhật", {
      dashed: true,
      steps: { [FLOW.forecast]: 1 },
    }),
    edge("ee5", "s3", "dt", "Sinh phiếu thu", {
      steps: { [FLOW.forecast]: 3 },
    }),
    edge("ee6", "dt", "t1", "Chờ thu", { steps: { [FLOW.manual]: 3 } }),
    edge("ee7", "t1", "s4", "Thu xong", { steps: { [FLOW.receipt]: 1 } }),
    edge("ee8", "t2", "s4", "Cấn trừ", { steps: { [FLOW.receipt]: 2 } }),
    edge("ee9", "dc", "p1", "Đã chi", { steps: { [FLOW.manual]: 4 } }),
    edge("ee10", "hh", "p2", "Ghi OPEX", { steps: { [FLOW.opex]: 1 } }),
    edge("ee11", "vt", "p2", "Ghi OPEX", { steps: { [FLOW.opex]: 2 } }),
    edge("ee12", "s5", "dc", "Phiếu hoa hồng", {
      dashed: true,
      steps: { [FLOW.commission]: 1 },
    }),
    edge("ee13", "p1", "m1", "Thực chi", { read: true }),
    edge("ee14", "t1", "m1", "Thực thu", { read: true }),
    edge("ee15", "p2", "m2", "Chi phí", { read: true }),
    edge("ee16", "d1", "m2", "Phải thu", { read: true }),
  ],
};
