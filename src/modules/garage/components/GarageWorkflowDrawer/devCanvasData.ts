import {
  WORKFLOW_CARD_MIN_HEIGHT,
  type GarageWorkflowCanvasDefinition,
  type GarageWorkflowEdge,
  type GarageWorkflowIconName,
  type GarageWorkflowLane,
  type GarageWorkflowNode,
  type GarageWorkflowText,
  type GarageWorkflowTone,
} from "./garageWorkflowTypes";
import { FLOW, GARAGE_AUTO_FLOWS } from "./garageAutoFlows";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

/** Khoảng cách giữa hai cột thẻ trong một khung: 380 - 220 = 160px cho mũi tên và nhãn. */
const SUB_COL_PITCH = 380;
const BOX_PAD_X = 30;
const BOX_GAP = 140;
const BOX_BOTTOM_PAD = 24;

/** Toạ độ khung module (x, rộng). Hoạt động có 3 cột con, Hub 1 cột, Thu chi / OPEX có 2 cột con. */
const ACTIVITY = {
  x: 0,
  width: BOX_PAD_X * 2 + 220 + SUB_COL_PITCH * 2,
} as const;
const HUB = {
  x: ACTIVITY.x + ACTIVITY.width + BOX_GAP,
  width: BOX_PAD_X * 2 + 220,
} as const;
const SIDE = {
  x: HUB.x + HUB.width + BOX_GAP,
  width: BOX_PAD_X * 2 + 220 + SUB_COL_PITCH,
} as const;
const TOTAL_WIDTH = SIDE.x + SIDE.width;

/** Hàng thẻ (toạ độ y tuyệt đối), căn thẳng hàng giữa các khung để mũi tên đi thẳng. */
const Y = {
  r0: 64,
  r1: 224,
  r2: 384,
  r3: 544,
} as const;
const CARD_ROW_PITCH = 160;

const SIDE_TOP_BOX_Y = Y.r2 - 64;
const SIDE_TOP_BOX_BOTTOM = Y.r3 + WORKFLOW_CARD_MIN_HEIGHT + BOX_BOTTOM_PAD;
/** Khe dọc giữa khung Thu chi và OPEX: đủ rộng làm kênh cho mũi tên và nhãn. */
const OPEX_BOX_GAP = 120;
const OPEX_BOX_Y = SIDE_TOP_BOX_BOTTOM + OPEX_BOX_GAP;
/** OPEX có hai hàng thẻ: bảng dữ liệu ở hàng 1 (thẳng hàng với hoa hồng), service ở hàng 2. */
const OPEX_ROW_1 = OPEX_BOX_Y + 64;
const OPEX_ROW_2 = OPEX_ROW_1 + CARD_ROW_PITCH;
const OPEX_BOX_BOTTOM = OPEX_ROW_2 + WORKFLOW_CARD_MIN_HEIGHT + BOX_BOTTOM_PAD;
/** Khung Hoạt động và Garage Hub kéo dài tới cùng đáy với OPEX. */
const ACTIVITY_BOTTOM = OPEX_BOX_BOTTOM;
const READ_BAND_Y = ACTIVITY_BOTTOM + 56;
const READ_BAND_HEIGHT = 64 + WORKFLOW_CARD_MIN_HEIGHT + BOX_BOTTOM_PAD;

type ClusterId = "activity" | "hub" | "cashflow" | "opex" | "read";

const CLUSTER_TONE: Record<ClusterId, GarageWorkflowTone> = {
  activity: "teal",
  hub: "slate",
  cashflow: "green",
  opex: "orange",
  read: "violet",
};

const lane = (
  id: ClusterId,
  title: string,
  icon: GarageWorkflowIconName,
  box: { x: number; y: number; width: number; height: number },
  layer?: "main" | "read",
): GarageWorkflowLane => ({
  id,
  title: txt(`workflow.dev.lanes.${id}`, title),
  tone: CLUSTER_TONE[id],
  icon,
  headerSide: "top",
  ...box,
  ...(layer ? { layer } : {}),
});

/** Chữ nhóm nhỏ trên tên thẻ, giúp phân biệt module con trong cùng một khung. */
const GROUP = {
  sync: txt("workflow.dev.groups.sync", "SYNC"),
  kgara: txt("workflow.dev.groups.kgara", "KGARA"),
  cases: txt("workflow.dev.groups.cases", "PHIẾU DỊCH VỤ"),
  pnl: txt("workflow.dev.groups.pnl", "P&L & DASHBOARD"),
  hub: txt("workflow.dev.groups.hub", "GARAGE HUB"),
  cashflow: txt("workflow.dev.groups.cashflow", "THU CHI"),
  opex: txt("workflow.dev.groups.opex", "OPEX"),
  debts: txt("workflow.dev.groups.debts", "CÔNG NỢ & ĐỐI SOÁT"),
} as const;

const card = (
  id: string,
  kind: GarageWorkflowNode["kind"],
  cluster: ClusterId,
  x: number,
  y: number,
  group: keyof typeof GROUP,
  title: string,
  badges: string[] = [],
  layer?: "main" | "read",
): GarageWorkflowNode => ({
  id,
  kind,
  x,
  y,
  tone: CLUSTER_TONE[cluster],
  group: GROUP[group],
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
  options: {
    steps?: Record<string, number>;
    read?: boolean;
    dashed?: boolean;
  } = {},
): GarageWorkflowEdge => ({
  id,
  source,
  target,
  label: txt(`workflow.dev.edges.${id}`, label),
  mechanism,
  kind: options.read ? "read" : "main",
  ...(options.steps
    ? { steps: options.steps, flows: Object.keys(options.steps) }
    : {}),
  ...(options.dashed ? { dashed: true } : {}),
});

const activityX = (sub: number) => ACTIVITY.x + BOX_PAD_X + SUB_COL_PITCH * sub;
const sideX = (sub: number) => SIDE.x + BOX_PAD_X + SUB_COL_PITCH * sub;
const HUB_CARD_X = HUB.x + BOX_PAD_X;
const READ_CARD_Y = READ_BAND_Y + 64;
const readX = (index: number) => BOX_PAD_X + SUB_COL_PITCH * index;

/**
 * Canvas Dev: 4 khung module (Hoạt động garage, Garage Hub, Thu chi, OPEX) và dải lớp chỉ đọc.
 * Mũi tên màu A–D là các luồng tự động qua Garage Hub; M là luồng thủ công.
 * Key i18n: workflow.dev.*
 */
export const DEV_CANVAS: GarageWorkflowCanvasDefinition = {
  id: "dev",
  title: txt("workflow.dev.title", "Kiến trúc module Garage"),
  description: txt(
    "workflow.dev.description",
    "Bốn module Hoạt động garage, Garage Hub, Thu chi và OPEX; mũi tên màu A–D là các luồng tự động đi qua Garage Hub.",
  ),
  flows: GARAGE_AUTO_FLOWS,
  columns: [],
  lanes: [
    lane("activity", "Hoạt động garage", "car", {
      x: ACTIVITY.x,
      y: 0,
      width: ACTIVITY.width,
      height: ACTIVITY_BOTTOM,
    }),
    lane("hub", "Garage Hub", "settings", {
      x: HUB.x,
      y: 0,
      width: HUB.width,
      height: ACTIVITY_BOTTOM,
    }),
    lane("cashflow", "Thu chi", "wallet", {
      x: SIDE.x,
      y: SIDE_TOP_BOX_Y,
      width: SIDE.width,
      height: SIDE_TOP_BOX_BOTTOM - SIDE_TOP_BOX_Y,
    }),
    lane("opex", "OPEX", "receipt", {
      x: SIDE.x,
      y: OPEX_BOX_Y,
      width: SIDE.width,
      height: OPEX_BOX_BOTTOM - OPEX_BOX_Y,
    }),
    lane(
      "read",
      "Báo cáo & phân tích (chỉ đọc)",
      "chart",
      { x: 0, y: READ_BAND_Y, width: TOTAL_WIDTH, height: READ_BAND_HEIGHT },
      "read",
    ),
  ],
  nodes: [
    // Hoạt động garage
    card(
      "cron",
      "module",
      "activity",
      activityX(0),
      Y.r0,
      "sync",
      "KgaraSyncScheduler",
      [
        "Cron 09:15 · 15:15 · 16:15 · 17:15 · 21:15",
        "Heartbeat 30 giây, mỗi slot chạy một lần",
      ],
    ),
    card(
      "kgaraApi",
      "module",
      "activity",
      activityX(0),
      Y.r1,
      "kgara",
      "KGara API",
      ["Phiếu dịch vụ, chi tiết, công nợ"],
    ),
    card(
      "sy",
      "module",
      "activity",
      activityX(1),
      Y.r0,
      "sync",
      "SyncCaseService",
      ["Watermark tăng dần, lùi 10 phút", "Xóa mềm sau 2 lần vắng"],
    ),
    card(
      "caseFin",
      "module",
      "activity",
      activityX(1),
      Y.r2,
      "cases",
      "KgaraCaseFinancialController",
      [
        "Người dùng cấn trừ tay (HTTP)",
        "Settlements, linked invoices IN / OUT",
      ],
    ),
    card(
      "pnlSvc",
      "module",
      "activity",
      activityX(1),
      OPEX_ROW_1,
      "pnl",
      "GaragePnlService",
      ["Người dùng mở báo cáo P&L (HTTP)", "Không có cron"],
    ),
    card(
      "tCases",
      "report",
      "activity",
      activityX(2),
      Y.r0,
      "cases",
      "kgara_cases",
      ["Phiếu và dòng chi tiết"],
    ),
    card(
      "tSettlements",
      "report",
      "activity",
      activityX(2),
      Y.r2,
      "cases",
      "kgara_case_settlements",
      ["Cấn trừ giữa phiếu, sao kê, hóa đơn"],
    ),
    // Garage Hub
    card(
      "lifecycle",
      "hub-action",
      "hub",
      HUB_CARD_X,
      Y.r1,
      "hub",
      "CaseLifecycleHandler",
      [
        "Tự kích hoạt khi phiếu đổi trạng thái hoặc có phiếu thu/chi gắn phiếu",
        "Chuyển sang 3 → sinh Dự thu; rời 3 → hủy Dự thu auto",
      ],
    ),
    card(
      "forecast",
      "hub-action",
      "hub",
      HUB_CARD_X,
      Y.r2,
      "hub",
      "GarageCaseForecastService",
      [
        "Tự sinh, cập nhật, hủy Dự thu",
        "Dự thu = phiếu thu EXPECTED, hạn +7 ngày",
      ],
    ),
    card(
      "settle",
      "hub-action",
      "hub",
      HUB_CARD_X,
      Y.r3,
      "hub",
      "CashflowSettleHandler",
      [
        "Tự kích hoạt khi lưu phiếu chi",
        "HHBH, vật tư tiêu hao APPROVED/PAID → ghi OPEX",
      ],
    ),
    card(
      "pnlCommission",
      "hub-action",
      "hub",
      HUB_CARD_X,
      OPEX_ROW_1,
      "hub",
      "PnlCommissionHandler",
      ["Tự kích hoạt khi mở báo cáo P&L", "Phiếu hoa hồng PENDING và delta"],
    ),
    // Thu chi
    card(
      "tVouchers",
      "report",
      "cashflow",
      sideX(1),
      Y.r2,
      "cashflow",
      "kgara_cashflow_vouchers",
      [
        "RECEIPT / PAYMENT, paymentStatus",
        "Dự thu EXPECTED, dự chi PENDING/APPROVED",
      ],
    ),
    card(
      "cfTx",
      "module",
      "cashflow",
      sideX(0),
      Y.r3,
      "cashflow",
      "GarageCashflowTransactionService",
      [
        "Người dùng lưu phiếu thu chi (HTTP)",
        "Tạo, sửa, xóa phiếu trong transaction",
      ],
    ),
    // OPEX
    card(
      "opexSvc",
      "module",
      "opex",
      sideX(0),
      OPEX_ROW_2,
      "opex",
      "GarageOpexService",
      ["Người dùng nhập tay (HTTP)", "CRUD, lặp hàng tháng"],
    ),
    card(
      "tOpex",
      "report",
      "opex",
      sideX(1),
      OPEX_ROW_1,
      "opex",
      "kgara_operating_expenses",
      [
        "Chi phí vận hành, giá vốn, hoa hồng",
        "HHBH → chi phí bán hàng, vật tư tiêu hao → giá vốn",
      ],
    ),
    // Báo cáo & phân tích (lớp chỉ đọc)
    card(
      "dash",
      "module",
      "read",
      readX(0),
      READ_CARD_Y,
      "pnl",
      "GarageDashboardService",
      ["Stats, pnl-trend, customers, opex"],
      "read",
    ),
    card(
      "chk",
      "module",
      "read",
      readX(1),
      READ_CARD_Y,
      "pnl",
      "GarageCheckpointService",
      ["KPI theo ngày hoàn thành"],
      "read",
    ),
    card(
      "debts",
      "module",
      "read",
      readX(2),
      READ_CARD_Y,
      "debts",
      "GarageDebtsAnalyticsService",
      ["Tuổi nợ, chân trời thời gian"],
      "read",
    ),
    card(
      "smart",
      "module",
      "read",
      readX(3),
      READ_CARD_Y,
      "debts",
      "GarageSmartSettlementService",
      ["Gợi ý khớp sao kê và hóa đơn"],
      "read",
    ),
    card(
      "ledger",
      "hub-action",
      "read",
      readX(4),
      READ_CARD_Y,
      "hub",
      "Ledger handlers",
      ["Sổ quỹ theo kỳ và theo case (đọc)"],
      "read",
    ),
  ],
  edges: [
    // A. Phiếu Kết thúc → tự sinh Dự thu
    edge("d1", "cron", "sy", "Theo slot", "cron", {
      steps: { [FLOW.forecast]: 1 },
    }),
    edge("d2", "kgaraApi", "sy", "Kéo phiếu", "HTTP", {
      steps: { [FLOW.forecast]: 2 },
    }),
    edge("d3", "sy", "tCases", "Upsert", "ghi DB", {
      steps: { [FLOW.forecast]: 3 },
    }),
    edge("d4", "sy", "lifecycle", "Khi đổi trạng thái", "DI", {
      steps: { [FLOW.forecast]: 4 },
    }),
    edge("d5", "lifecycle", "forecast", "Sinh Dự thu", "DI", {
      steps: { [FLOW.forecast]: 5, [FLOW.receipt]: 3 },
    }),
    edge("d6", "sy", "forecast", "Gọi trực tiếp", "DI, cần xác minh", {
      steps: { [FLOW.forecast]: 6 },
      dashed: true,
    }),
    edge("d7", "forecast", "tVouchers", "Phiếu Dự thu", "ghi DB", {
      steps: { [FLOW.forecast]: 7, [FLOW.receipt]: 4 },
    }),
    // B. Lưu phiếu chi HHBH / vật tư → tự ghi OPEX
    edge("d8", "cfTx", "tVouchers", "Lưu phiếu", "transaction", {
      steps: { [FLOW.opex]: 1 },
    }),
    edge("d9", "cfTx", "settle", "Sau khi lưu", "DI, cùng transaction", {
      steps: { [FLOW.opex]: 2 },
    }),
    edge("d10", "settle", "tOpex", "Ghi OPEX", "ghi DB", {
      steps: { [FLOW.opex]: 3 },
    }),
    // C. Mở báo cáo P&L → tự sinh phiếu hoa hồng
    edge(
      "d11",
      "pnlSvc",
      "pnlCommission",
      "Sync hoa hồng",
      "DI, fire-and-forget",
      {
        steps: { [FLOW.commission]: 1 },
        dashed: true,
      },
    ),
    edge("d12", "pnlCommission", "tVouchers", "Phiếu hoa hồng", "ghi DB", {
      steps: { [FLOW.commission]: 2 },
    }),
    edge("d13", "pnlCommission", "tOpex", "OPEX hoa hồng", "ghi DB", {
      steps: { [FLOW.commission]: 3 },
    }),
    // D. Lưu phiếu thu/chi gắn phiếu dịch vụ → tự cấn trừ, đặt lại Dự thu (d5, d7 dùng chung với A)
    edge("d14", "cfTx", "tSettlements", "Tự cấn trừ", "ghi DB", {
      steps: { [FLOW.receipt]: 1 },
    }),
    edge("d15", "cfTx", "lifecycle", "Phiếu gắn phiếu DV", "DI", {
      steps: { [FLOW.receipt]: 2 },
    }),
    // Luồng thủ công của người dùng
    edge("d16", "caseFin", "tSettlements", "Cấn trừ tay", "HTTP", {
      steps: { [FLOW.manual]: 1 },
    }),
    edge("d17", "caseFin", "tCases", "Tính lại phải thu", "ghi DB", {
      steps: { [FLOW.manual]: 2 },
    }),
    edge("d18", "opexSvc", "tOpex", "CRUD, lặp tháng", "ghi DB", {
      steps: { [FLOW.manual]: 3 },
    }),
    // Luồng chỉ đọc dữ liệu: ẩn mặc định, không thuộc luồng nào
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
