import {
  WORKFLOW_CARD_MIN_HEIGHT,
  WORKFLOW_NODE_WIDTH,
  type GarageWorkflowCanvasDefinition,
  type GarageWorkflowColumn,
  type GarageWorkflowEdge,
  type GarageWorkflowNode,
  type GarageWorkflowText,
  type GarageWorkflowTone,
} from "./garageWorkflowTypes";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

/** Cột rộng 400, thẻ rộng 220 đặt giữa cột: khe giữa hai cột thẻ là 180px, đủ cho mũi tên và nhãn. */
const COL_WIDTH = 400;
const CARD_PAD_X = (COL_WIDTH - WORKFLOW_NODE_WIDTH) / 2;
const ROW_TOP = 64;
/** Mỗi hàng cao 160, thẻ cao tối thiểu 112, chừa khe 48px giữa hai hàng thẻ. */
const ROW_PITCH = 160;
const ROW_COUNT = 8;
const CANVAS_HEIGHT = ROW_TOP + ROW_PITCH * ROW_COUNT;

const colX = (col: number) => COL_WIDTH * col;
const cardX = (col: number) => colX(col) + CARD_PAD_X;
const cardY = (row: number) =>
  ROW_TOP + (ROW_PITCH - WORKFLOW_CARD_MIN_HEIGHT) / 2 + ROW_PITCH * row;

const COL = { trigger: 0, service: 1, hub: 2, data: 3, read: 4 } as const;

const column = (
  id: string,
  col: number,
  title: GarageWorkflowText,
  layer?: "main" | "read",
): GarageWorkflowColumn => ({
  id,
  title,
  x: colX(col),
  y: 0,
  width: COL_WIDTH,
  height: CANVAS_HEIGHT,
  ...(layer ? { layer } : {}),
});

/** Nhóm module: màu (tone) + chữ nhóm nhỏ trên tên thẻ. */
const GROUP = {
  sync: { tone: "teal", group: txt("workflow.dev.groups.sync", "SYNC") },
  kgara: { tone: "slate", group: txt("workflow.dev.groups.kgara", "KGARA") },
  cases: {
    tone: "gold",
    group: txt("workflow.dev.groups.cases", "PHIẾU DỊCH VỤ"),
  },
  cashflow: {
    tone: "green",
    group: txt("workflow.dev.groups.cashflow", "THU CHI"),
  },
  opex: { tone: "orange", group: txt("workflow.dev.groups.opex", "OPEX") },
  pnl: {
    tone: "violet",
    group: txt("workflow.dev.groups.pnl", "P&L & DASHBOARD"),
  },
  debts: {
    tone: "rose",
    group: txt("workflow.dev.groups.debts", "CÔNG NỢ & ĐỐI SOÁT"),
  },
  hub: { tone: "slate", group: txt("workflow.dev.groups.hub", "GARAGE HUB") },
} as const satisfies Record<
  string,
  { tone: GarageWorkflowTone; group: GarageWorkflowText }
>;

const card = (
  id: string,
  kind: GarageWorkflowNode["kind"],
  col: number,
  row: number,
  group: keyof typeof GROUP,
  title: string,
  badges: string[] = [],
  layer?: "main" | "read",
): GarageWorkflowNode => ({
  id,
  kind,
  x: cardX(col),
  y: cardY(row),
  tone: GROUP[group].tone,
  group: GROUP[group].group,
  title: txt(`workflow.dev.nodes.${id}.title`, title),
  badges: badges.map((badge, index) =>
    txt(`workflow.dev.nodes.${id}.badge${index + 1}`, badge),
  ),
  ...(layer ? { layer } : {}),
});

const edge = (
  id: string,
  source: string,
  target: string,
  label: string,
  mechanism: string,
  options: { step?: number; read?: boolean; dashed?: boolean } = {},
): GarageWorkflowEdge => ({
  id,
  source,
  target,
  label: txt(`workflow.dev.edges.${id}`, label),
  mechanism,
  kind: options.read ? "read" : "main",
  ...(options.step !== undefined ? { step: options.step } : {}),
  ...(options.dashed ? { dashed: true } : {}),
});

/**
 * Canvas Dev: cây phân tầng trái → phải (Nguồn kích hoạt → Service → Garage Hub → Dữ liệu).
 * Cột "Báo cáo & phân tích" là lớp chỉ đọc, ẩn mặc định. Key i18n: workflow.dev.*
 */
export const DEV_CANVAS: GarageWorkflowCanvasDefinition = {
  id: "dev",
  title: txt("workflow.dev.title", "Kiến trúc module garage: ai gọi ai"),
  description: txt(
    "workflow.dev.description",
    "Đọc từ trái sang phải: nguồn kích hoạt, service điều phối, Garage Hub, bảng dữ liệu. Số trên mũi tên là thứ tự gọi.",
  ),
  lanes: [],
  columns: [
    column(
      "trigger",
      COL.trigger,
      txt("workflow.dev.columns.trigger", "Nguồn kích hoạt"),
    ),
    column(
      "service",
      COL.service,
      txt("workflow.dev.columns.service", "Service điều phối"),
    ),
    column("hub", COL.hub, txt("workflow.dev.columns.hub", "Garage Hub")),
    column("data", COL.data, txt("workflow.dev.columns.data", "Dữ liệu")),
    column(
      "read",
      COL.read,
      txt("workflow.dev.columns.read", "Báo cáo & phân tích (đọc)"),
      "read",
    ),
  ],
  nodes: [
    // Nguồn kích hoạt
    card("cron", "module", COL.trigger, 0, "sync", "KgaraSyncScheduler", [
      "Cron 09:15 · 15:15 · 16:15 · 17:15 · 21:15",
      "Heartbeat 30 giây, mỗi slot chạy một lần",
    ]),
    card("kgaraApi", "module", COL.trigger, 1, "kgara", "KGara API", [
      "Phiếu dịch vụ, chi tiết, công nợ",
    ]),
    card(
      "uiVoucher",
      "module",
      COL.trigger,
      3,
      "cashflow",
      "Lưu phiếu thu chi",
      ["Người dùng tạo, sửa, xóa phiếu"],
    ),
    card("uiSettle", "module", COL.trigger, 4, "cases", "Cấn trừ phiếu", [
      "Người dùng chọn sao kê, phiếu quỹ, hóa đơn",
    ]),
    card("uiOpex", "module", COL.trigger, 5, "opex", "Nhập chi phí vận hành", [
      "Người dùng nhập tay hoặc lặp hàng tháng",
    ]),
    card("openPnl", "module", COL.trigger, 6, "pnl", "Mở báo cáo P&L", [
      "Người dùng mở màn hình P&L",
    ]),
    // Service điều phối
    card("sy", "module", COL.service, 0, "sync", "SyncCaseService", [
      "Watermark tăng dần, lùi 10 phút",
      "Xóa mềm sau 2 lần vắng",
    ]),
    card(
      "cfTx",
      "module",
      COL.service,
      3,
      "cashflow",
      "GarageCashflowTransactionService",
      ["Tạo, sửa, xóa phiếu trong transaction"],
    ),
    card(
      "caseFin",
      "module",
      COL.service,
      4,
      "cases",
      "KgaraCaseFinancialController",
      ["Settlements (cấn trừ)", "Linked invoices IN / OUT"],
    ),
    card("opexSvc", "module", COL.service, 5, "opex", "GarageOpexService", [
      "CRUD, lặp hàng tháng",
    ]),
    card("pnlSvc", "module", COL.service, 6, "pnl", "GaragePnlService", [
      "Mở báo cáo P&L thì sync hoa hồng, không có cron",
    ]),
    // Garage Hub
    card("lifecycle", "hub-action", COL.hub, 1, "hub", "CaseLifecycleHandler", [
      "Chuyển sang 3 → sinh Dự thu",
      "Rời 3 → hủy Dự thu auto",
    ]),
    card(
      "forecast",
      "hub-action",
      COL.hub,
      2,
      "hub",
      "GarageCaseForecastService",
      ["Tự sinh, cập nhật, hủy Dự thu"],
    ),
    card("settle", "hub-action", COL.hub, 3, "hub", "CashflowSettleHandler", [
      "Phiếu chi PAID → ghi OPEX",
    ]),
    card(
      "pnlCommission",
      "hub-action",
      COL.hub,
      6,
      "hub",
      "PnlCommissionHandler",
      ["Phiếu hoa hồng PENDING và delta"],
    ),
    card(
      "ledger",
      "hub-action",
      COL.hub,
      7,
      "hub",
      "Ledger handlers",
      ["Sổ quỹ theo kỳ và theo case (đọc)"],
      "read",
    ),
    // Dữ liệu
    card("tCases", "report", COL.data, 0, "cases", "kgara_cases", [
      "Phiếu và dòng chi tiết",
    ]),
    card(
      "tVouchers",
      "report",
      COL.data,
      2,
      "cashflow",
      "kgara_cashflow_vouchers",
      ["RECEIPT / PAYMENT, paymentStatus"],
    ),
    card(
      "tSettlements",
      "report",
      COL.data,
      4,
      "cases",
      "kgara_case_settlements",
      ["Cấn trừ giữa phiếu, sao kê, hóa đơn"],
    ),
    card("tOpex", "report", COL.data, 5, "opex", "kgara_operating_expenses", [
      "Chi phí vận hành, giá vốn, hoa hồng",
    ]),
    // Báo cáo & phân tích (lớp chỉ đọc)
    card(
      "dash",
      "module",
      COL.read,
      0,
      "pnl",
      "GarageDashboardService",
      ["Stats, pnl-trend, customers, opex"],
      "read",
    ),
    card(
      "chk",
      "module",
      COL.read,
      1,
      "pnl",
      "GarageCheckpointService",
      ["KPI theo ngày hoàn thành"],
      "read",
    ),
    card(
      "debts",
      "module",
      COL.read,
      2,
      "debts",
      "GarageDebtsAnalyticsService",
      ["Tuổi nợ, chân trời thời gian"],
      "read",
    ),
    card(
      "smart",
      "module",
      COL.read,
      3,
      "debts",
      "GarageSmartSettlementService",
      ["Gợi ý khớp sao kê và hóa đơn"],
      "read",
    ),
  ],
  edges: [
    // Luồng chính, đánh số theo thứ tự gọi 1..20
    edge("d1", "cron", "sy", "Theo slot", "cron", { step: 1 }),
    edge("d2", "kgaraApi", "sy", "Kéo phiếu", "HTTP", { step: 2 }),
    edge("d3", "sy", "tCases", "Upsert", "ghi DB", { step: 3 }),
    edge("d4", "sy", "lifecycle", "Khi chuyển trạng thái", "DI", { step: 4 }),
    edge("d5", "lifecycle", "forecast", "Sinh dự thu", "DI", { step: 5 }),
    edge("d6", "sy", "forecast", "Sync dự thu", "DI, cần xác minh", {
      step: 6,
      dashed: true,
    }),
    edge("d7", "forecast", "tVouchers", "Phiếu dự thu", "ghi DB", { step: 7 }),
    edge("d8", "uiVoucher", "cfTx", "Lưu phiếu", "HTTP", { step: 8 }),
    edge("d9", "cfTx", "tVouchers", "Ghi phiếu", "transaction", { step: 9 }),
    edge("d10", "cfTx", "settle", "Sau khi lưu", "DI, cùng transaction", {
      step: 10,
    }),
    edge("d11", "settle", "tOpex", "Ghi OPEX", "ghi DB", { step: 11 }),
    edge("d12", "uiSettle", "caseFin", "Cấn trừ", "HTTP", { step: 12 }),
    edge("d13", "caseFin", "tSettlements", "Ghi cấn trừ", "ghi DB", {
      step: 13,
    }),
    edge("d14", "caseFin", "tCases", "Tính lại còn phải thu", "ghi DB", {
      step: 14,
    }),
    edge("d15", "uiOpex", "opexSvc", "Nhập chi phí", "HTTP", { step: 15 }),
    edge("d16", "opexSvc", "tOpex", "CRUD, lặp tháng", "ghi DB", { step: 16 }),
    edge("d17", "openPnl", "pnlSvc", "Mở báo cáo", "HTTP", { step: 17 }),
    edge(
      "d18",
      "pnlSvc",
      "pnlCommission",
      "Sync hoa hồng",
      "DI, fire-and-forget",
      { step: 18, dashed: true },
    ),
    edge("d19", "pnlCommission", "tVouchers", "Phiếu HH", "ghi DB", {
      step: 19,
    }),
    edge("d20", "pnlCommission", "tOpex", "OPEX hoa hồng", "ghi DB", {
      step: 20,
    }),
    // Luồng chỉ đọc dữ liệu: ẩn mặc định, không đánh số
    edge("r1", "dash", "tCases", "Doanh thu, KPI", "đọc DB", { read: true }),
    edge("r2", "dash", "tVouchers", "Thu chi", "đọc DB", { read: true }),
    edge("r3", "dash", "tOpex", "Chi phí", "đọc DB", { read: true }),
    edge("r4", "chk", "tCases", "KPI", "đọc DB", { read: true }),
    edge("r5", "debts", "tCases", "Công nợ", "đọc DB", { read: true }),
    edge("r6", "debts", "tSettlements", "Cấn trừ", "đọc DB", { read: true }),
    edge("r7", "smart", "tVouchers", "Gợi ý khớp", "đọc DB", { read: true }),
    edge("r8", "ledger", "tVouchers", "Sổ quỹ", "đọc DB", { read: true }),
  ],
};
