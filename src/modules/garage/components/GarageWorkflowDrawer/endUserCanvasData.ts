import type {
  GarageWorkflowCanvasDefinition,
  GarageWorkflowText,
} from "./garageWorkflowTypes";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

const ROW_TOP = 64;
const ROW_GAP = 48;
const ROW_HEIGHT = 170;
const COL_LEFT = 200;
const COL_WIDTH = 340;
/** Thẻ rộng 220 đặt giữa cột rộng 340: (340 - 220) / 2 = 60, khe giữa hai cột thẻ nằm đúng ở biên cột. */
const CELL_PAD_X = 60;
const CELL_PAD_Y = 36;
const CANVAS_HEIGHT = ROW_TOP + (ROW_HEIGHT + ROW_GAP) * 6 - ROW_GAP;

const colX = (index: number) => COL_LEFT + COL_WIDTH * index;
const rowY = (index: number) => ROW_TOP + (ROW_HEIGHT + ROW_GAP) * index;
const cellX = (col: number) => colX(col) + CELL_PAD_X;
const cellY = (row: number) => rowY(row) + CELL_PAD_Y;

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
    "Luồng vận hành từ tiếp nhận xe đến thu chi, công nợ và báo cáo. Số trên thẻ là thứ tự thao tác.",
  ),
  corner: {
    x: 0,
    y: 0,
    width: COL_LEFT,
    height: ROW_TOP,
    title: txt("workflow.endUser.corner", "Bộ phận \\ Giai đoạn"),
  },
  columns: [
    {
      id: "c1",
      title: txt("workflow.endUser.columns.c1", "Tiếp nhận & Báo giá"),
      x: colX(0),
      y: 0,
      width: COL_WIDTH,
      height: CANVAS_HEIGHT,
    },
    {
      id: "c2",
      title: txt("workflow.endUser.columns.c2", "Sửa chữa"),
      x: colX(1),
      y: 0,
      width: COL_WIDTH,
      height: CANVAS_HEIGHT,
    },
    {
      id: "c3",
      title: txt("workflow.endUser.columns.c3", "Kết thúc"),
      x: colX(2),
      y: 0,
      width: COL_WIDTH,
      height: CANVAS_HEIGHT,
    },
    {
      id: "c4",
      title: txt("workflow.endUser.columns.c4", "Thu chi & Công nợ"),
      x: colX(3),
      y: 0,
      width: COL_WIDTH,
      height: CANVAS_HEIGHT,
    },
    {
      id: "c5",
      title: txt("workflow.endUser.columns.c5", "Đối soát & Báo cáo"),
      x: colX(4),
      y: 0,
      width: COL_WIDTH,
      height: CANVAS_HEIGHT,
    },
  ],
  lanes: [
    {
      id: "r1",
      title: txt("workflow.endUser.lanes.r1", "Xưởng & Cố vấn"),
      tone: "slate",
      icon: "wrench",
      x: 0,
      y: rowY(0),
      width: COL_LEFT + COL_WIDTH * 5,
      height: ROW_HEIGHT,
    },
    {
      id: "r2",
      title: txt("workflow.endUser.lanes.r2", "Hệ thống tự động"),
      tone: "teal",
      icon: "cpu",
      x: 0,
      y: rowY(1),
      width: COL_LEFT + COL_WIDTH * 5,
      height: ROW_HEIGHT,
    },
    {
      id: "r3",
      title: txt("workflow.endUser.lanes.r3", "Kế toán: thu tiền"),
      tone: "green",
      icon: "arrowIn",
      x: 0,
      y: rowY(2),
      width: COL_LEFT + COL_WIDTH * 5,
      height: ROW_HEIGHT,
    },
    {
      id: "r4",
      title: txt("workflow.endUser.lanes.r4", "Kế toán: chi tiền"),
      tone: "orange",
      icon: "arrowOut",
      x: 0,
      y: rowY(3),
      width: COL_LEFT + COL_WIDTH * 5,
      height: ROW_HEIGHT,
    },
    {
      id: "r5",
      title: txt("workflow.endUser.lanes.r5", "Công nợ & đối soát"),
      tone: "rose",
      icon: "scale",
      x: 0,
      y: rowY(4),
      width: COL_LEFT + COL_WIDTH * 5,
      height: ROW_HEIGHT,
    },
    {
      id: "r6",
      title: txt("workflow.endUser.lanes.r6", "Quản lý & báo cáo"),
      tone: "violet",
      icon: "dashboard",
      x: 0,
      y: rowY(5),
      width: COL_LEFT + COL_WIDTH * 5,
      height: ROW_HEIGHT,
    },
  ],
  nodes: [
    // Xưởng & Cố vấn (r1)
    {
      id: "e1",
      step: 1,
      kind: "module",
      x: cellX(0),
      y: cellY(0),
      title: txt("workflow.endUser.nodes.e1.title", "Tạo phiếu trên KGara"),
      badges: [
        txt("workflow.endUser.nodes.e1.badge1", "Tiếp nhận xe, lập báo giá"),
      ],
    },
    {
      id: "e2",
      step: 3,
      kind: "state",
      x: cellX(1),
      y: cellY(0),
      title: txt("workflow.endUser.nodes.e2.title", "Đang sửa"),
      badges: [
        txt(
          "workflow.endUser.nodes.e2.badge1",
          "Cập nhật chi phí dòng, ghi chú",
        ),
      ],
    },
    {
      id: "e3",
      step: 4,
      kind: "state",
      x: cellX(2),
      y: cellY(0),
      statusCode: 3,
      title: txt("workflow.endUser.nodes.e3.title", "Kết thúc"),
      badges: [
        txt(
          "workflow.endUser.nodes.e3.badge1",
          "Giao xe, hoàn thành công việc",
        ),
        txt("workflow.endUser.nodes.e3.badge2", "Hủy (9): loại khỏi báo cáo"),
      ],
    },
    // Hệ thống tự động (r2)
    {
      id: "s1",
      step: 2,
      kind: "module",
      x: cellX(0),
      y: cellY(1),
      title: txt("workflow.endUser.nodes.s1.title", "Đồng bộ KGara"),
      badges: [
        txt(
          "workflow.endUser.nodes.s1.badge1",
          "09:15 · 15:15 · 16:15 · 17:15 · 21:15",
        ),
        txt("workflow.endUser.nodes.s1.badge2", "Cũng có nút Đồng bộ tay"),
      ],
    },
    {
      id: "s2",
      kind: "module",
      x: cellX(1),
      y: cellY(1),
      title: txt("workflow.endUser.nodes.s2.title", "Checkpoint xe đang làm"),
      badges: [
        txt("workflow.endUser.nodes.s2.badge1", "Dự thu theo xe đang làm"),
      ],
    },
    {
      id: "s3",
      step: 5,
      kind: "hub-action",
      x: cellX(2),
      y: cellY(1),
      title: txt("workflow.endUser.nodes.s3.title", "Sinh Dự thu (EXPECTED)"),
      badges: [
        txt("workflow.endUser.nodes.s3.badge1", "Hạn = hoàn thành + 7 ngày"),
        txt(
          "workflow.endUser.nodes.s3.badge2",
          "Còn phải thu ≤ 0 → không sinh",
        ),
        txt(
          "workflow.endUser.nodes.s3.badge3",
          "Rời Kết thúc → hủy dự thu auto",
        ),
      ],
    },
    {
      id: "s4",
      step: 8,
      kind: "hub-action",
      x: cellX(3),
      y: cellY(1),
      title: txt("workflow.endUser.nodes.s4.title", "Đặt lại dự thu"),
      badges: [
        txt("workflow.endUser.nodes.s4.badge1", "Sau mỗi lần thu hoặc cấn trừ"),
      ],
    },
    {
      id: "s5",
      step: 11,
      kind: "hub-action",
      x: cellX(4),
      y: cellY(1),
      title: txt("workflow.endUser.nodes.s5.title", "Hoa hồng P&L"),
      badges: [
        txt(
          "workflow.endUser.nodes.s5.badge1",
          "Ngày 10 tháng sau: phiếu PENDING",
        ),
        txt("workflow.endUser.nodes.s5.badge2", "Delta khi P&L tăng sau PAID"),
      ],
    },
    // Kế toán: thu tiền (r3)
    {
      id: "t1",
      step: 6,
      kind: "voucher",
      x: cellX(3),
      y: cellY(2),
      title: txt(
        "workflow.endUser.nodes.t1.title",
        "Thu tiền khách / bảo hiểm",
      ),
      badges: [
        txt(
          "workflow.endUser.nodes.t1.badge1",
          "Phiếu thu gắn với phiếu dịch vụ",
        ),
      ],
    },
    {
      id: "t2",
      step: 7,
      kind: "voucher",
      x: cellX(4),
      y: cellY(2),
      title: txt("workflow.endUser.nodes.t2.title", "Đối soát sao kê"),
      badges: [
        txt("workflow.endUser.nodes.t2.badge1", "Khớp giao dịch ngân hàng"),
        txt("workflow.endUser.nodes.t2.badge2", "Thu ngoài sổ khi cần"),
      ],
    },
    // Kế toán: chi tiền (r4)
    {
      id: "p1",
      step: 9,
      kind: "voucher",
      x: cellX(3),
      y: cellY(3),
      title: txt("workflow.endUser.nodes.p1.title", "Phiếu chi (PAYMENT)"),
      badges: [
        txt("workflow.endUser.nodes.p1.badge1", "PENDING → APPROVED → PAID"),
        txt("workflow.endUser.nodes.p1.badge2", "Phiếu PAID bị khóa"),
      ],
    },
    {
      id: "p2",
      step: 10,
      kind: "voucher",
      x: cellX(4),
      y: cellY(3),
      title: txt("workflow.endUser.nodes.p2.title", "Chi phí vận hành (OPEX)"),
      badges: [
        txt("workflow.endUser.nodes.p2.badge1", "Nhập tay hoặc lặp hàng tháng"),
        txt(
          "workflow.endUser.nodes.p2.badge2",
          "HHBH, vật tư tiêu hao tự vào OPEX",
        ),
      ],
    },
    // Công nợ & đối soát (r5)
    {
      id: "d1",
      step: 12,
      kind: "report",
      x: cellX(3),
      y: cellY(4),
      title: txt("workflow.endUser.nodes.d1.title", "Công nợ phải thu"),
      badges: [
        txt(
          "workflow.endUser.nodes.d1.badge1",
          "Khách hàng và bảo hiểm, theo tuổi nợ",
        ),
      ],
    },
    {
      id: "d2",
      step: 13,
      kind: "report",
      x: cellX(4),
      y: cellY(4),
      title: txt("workflow.endUser.nodes.d2.title", "Hóa đơn VAT"),
      badges: [
        txt("workflow.endUser.nodes.d2.badge1", "Bán ra (OUT), mua vào (IN)"),
        txt("workflow.endUser.nodes.d2.badge2", "Cấn trừ công nợ phải trả NCC"),
      ],
    },
    // Quản lý & báo cáo (r6)
    {
      id: "m1",
      step: 14,
      kind: "report",
      x: cellX(3),
      y: cellY(5),
      title: txt("workflow.endUser.nodes.m1.title", "Dòng tiền ròng"),
      badges: [txt("workflow.endUser.nodes.m1.badge1", "Thực thu − Thực chi")],
    },
    {
      id: "m2",
      step: 15,
      kind: "report",
      x: cellX(4),
      y: cellY(5),
      title: txt("workflow.endUser.nodes.m2.title", "Dashboard & P&L"),
      badges: [
        txt(
          "workflow.endUser.nodes.m2.badge1",
          "Doanh thu, lãi gộp theo ngày hoàn thành",
        ),
        txt(
          "workflow.endUser.nodes.m2.badge2",
          "Bỏ phiếu đã xóa mềm và phiếu hủy",
        ),
      ],
    },
  ],
  edges: [
    {
      id: "ee1",
      source: "e1",
      target: "e2",
      label: txt("workflow.endUser.edges.ee1", "Bắt đầu sửa"),
    },
    {
      id: "ee2",
      source: "e2",
      target: "e3",
      label: txt("workflow.endUser.edges.ee2", "Hoàn tất"),
    },
    {
      id: "ee3",
      source: "e3",
      target: "s3",
      label: txt("workflow.endUser.edges.ee3", "Hệ thống sinh dự thu"),
    },
    {
      id: "ee4",
      source: "s1",
      target: "e1",
      label: txt("workflow.endUser.edges.ee4", "Cập nhật"),
      dashed: true,
    },
    {
      id: "ee5",
      source: "s3",
      target: "t1",
      label: txt("workflow.endUser.edges.ee5", "Chờ thu"),
    },
    {
      id: "ee6",
      source: "t1",
      target: "s4",
      label: txt("workflow.endUser.edges.ee6", "Thu xong"),
    },
    {
      id: "ee7",
      source: "t2",
      target: "s4",
      label: txt("workflow.endUser.edges.ee7", "Cấn trừ"),
    },
    {
      id: "ee8",
      source: "p2",
      target: "m2",
      kind: "read",
      label: txt("workflow.endUser.edges.ee8", "Chi phí"),
    },
    {
      id: "ee9",
      source: "t1",
      target: "m1",
      kind: "read",
      label: txt("workflow.endUser.edges.ee9", "Thực thu"),
    },
    {
      id: "ee10",
      source: "p1",
      target: "m1",
      kind: "read",
      label: txt("workflow.endUser.edges.ee10", "Thực chi"),
    },
    {
      id: "ee11",
      source: "s5",
      target: "p1",
      label: txt("workflow.endUser.edges.ee11", "Hoa hồng"),
      dashed: true,
    },
    {
      id: "ee12",
      source: "d1",
      target: "m2",
      kind: "read",
      label: txt("workflow.endUser.edges.ee12", "Phải thu"),
    },
  ],
};
