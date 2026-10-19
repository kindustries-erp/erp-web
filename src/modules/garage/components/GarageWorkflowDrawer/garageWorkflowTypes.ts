/** Chuỗi hiển thị: `key` để dịch qua i18n, `fallback` là tiếng Việt mặc định. */
export interface GarageWorkflowText {
  key: string;
  fallback: string;
}

export type GarageWorkflowCanvasId = "end-user" | "dev";

export type GarageWorkflowNodeKind =
  | "state"
  | "hub-action"
  | "voucher"
  | "report"
  | "module";

export type GarageWorkflowIconName =
  | "wrench"
  | "cpu"
  | "arrowIn"
  | "arrowOut"
  | "scale"
  | "dashboard"
  | "cloud"
  | "refresh"
  | "car"
  | "wallet"
  | "receipt"
  | "chart"
  | "settings";

export type GarageWorkflowTone =
  | "slate"
  | "teal"
  | "gold"
  | "green"
  | "orange"
  | "rose"
  | "violet";

export interface GarageWorkflowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Hàng (end-user) hoặc cột dọc (dev) có tiêu đề. */
export interface GarageWorkflowLane extends GarageWorkflowRect {
  id: string;
  title: GarageWorkflowText;
  tone: GarageWorkflowTone;
  icon?: GarageWorkflowIconName;
}

/** Cột giai đoạn của lưới end-user, vẽ từ đầu đến cuối canvas. */
export interface GarageWorkflowColumn extends GarageWorkflowRect {
  id: string;
  title: GarageWorkflowText;
  /** "read": cột của lớp chỉ đọc, ẩn mặc định và hiện cùng nút bật luồng đọc. */
  layer?: "main" | "read";
}

export interface GarageWorkflowNode {
  id: string;
  kind: GarageWorkflowNodeKind;
  title: GarageWorkflowText;
  badges?: GarageWorkflowText[];
  x: number;
  y: number;
  /** Chỉ gắn cho mã đã xác minh trong code: 3 (Kết thúc), 9 (Hủy). */
  statusCode?: number;
  /** Số thứ tự thao tác (chỉ canvas end-user): vẽ thành vòng số trên thẻ. */
  step?: number;
  /** Màu nhóm module (vạch trái thẻ), dùng cho canvas dev dạng cây. */
  tone?: GarageWorkflowTone;
  /** Chữ nhóm nhỏ phía trên tên thẻ (ví dụ SYNC, THU CHI). */
  group?: GarageWorkflowText;
  /** "read": thẻ của lớp chỉ đọc, ẩn mặc định và hiện cùng nút bật luồng đọc. */
  layer?: "main" | "read";
}

export interface GarageWorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: GarageWorkflowText;
  /** Số thứ tự gọi (chỉ canvas dev): hiển thị trước nhãn mũi tên. */
  step?: number;
  /** "read": luồng chỉ đọc dữ liệu, ẩn mặc định và hiện bằng nút bật trên thanh công cụ. */
  kind?: "main" | "read";
  /** Cơ chế gọi, ví dụ DI, cron, HTTP, ghi DB (chỉ canvas dev dùng). */
  mechanism?: string;
  dashed?: boolean;
}

export interface GarageWorkflowCanvasDefinition {
  id: GarageWorkflowCanvasId;
  title: GarageWorkflowText;
  /** Mô tả ngắn, hiện dưới tiêu đề khi xuất PNG/PDF. */
  description: GarageWorkflowText;
  /** Ô góc phía trên bên trái của lưới (chỉ canvas end-user). */
  corner?: GarageWorkflowRect & { title: GarageWorkflowText };
  lanes: GarageWorkflowLane[];
  columns: GarageWorkflowColumn[];
  nodes: GarageWorkflowNode[];
  edges: GarageWorkflowEdge[];
}

/** Kích thước node cố định của thẻ sơ đồ. */
export const WORKFLOW_NODE_WIDTH = 220;
/** Chiều cao tối thiểu chung của thẻ: các thẻ cùng hàng cao bằng nhau nên tâm cạnh thẳng hàng, mũi tên nối thẳng. */
export const WORKFLOW_CARD_MIN_HEIGHT = 112;
