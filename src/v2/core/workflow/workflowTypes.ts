/** Chuỗi hiển thị: `key` để dịch qua i18n, `fallback` là tiếng Việt mặc định. */
export interface WorkflowCanvasText {
  key: string;
  fallback: string;
}

/** Id sơ đồ do host đặt. */
export type WorkflowCanvasId = string;

export type WorkflowCanvasNodeKind =
  | "state"
  | "hub-action"
  | "voucher"
  | "report"
  | "module";

export type WorkflowCanvasIconName =
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

export type WorkflowCanvasTone =
  | "slate"
  | "teal"
  | "gold"
  | "green"
  | "orange"
  | "rose"
  | "violet";

export interface WorkflowCanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Hàng (end-user) hoặc cột dọc (dev) có tiêu đề. */
export interface WorkflowCanvasLane extends WorkflowCanvasRect {
  id: string;
  title: WorkflowCanvasText;
  tone: WorkflowCanvasTone;
  icon?: WorkflowCanvasIconName;
  /** Ghi đè vị trí thanh tiêu đề; mặc định lane rất rộng thì tiêu đề bên trái, còn lại ở trên. */
  headerSide?: "top" | "left";
  /** "read": khung của lớp chỉ đọc, ẩn mặc định và hiện cùng nút bật luồng đọc. */
  layer?: "main" | "read";
}

/** Cột giai đoạn của lưới end-user, vẽ từ đầu đến cuối canvas. */
export interface WorkflowCanvasColumn extends WorkflowCanvasRect {
  id: string;
  title: WorkflowCanvasText;
  /** "read": cột của lớp chỉ đọc, ẩn mặc định và hiện cùng nút bật luồng đọc. */
  layer?: "main" | "read";
}

export interface WorkflowCanvasNode {
  id: string;
  kind: WorkflowCanvasNodeKind;
  title: WorkflowCanvasText;
  badges?: WorkflowCanvasText[];
  x: number;
  y: number;
  /** Chỉ gắn cho mã đã xác minh trong code: 3 (Kết thúc), 9 (Hủy). */
  statusCode?: number;
  /** Số thứ tự thao tác (chỉ canvas end-user): vẽ thành vòng số trên thẻ. */
  step?: number;
  /** Màu nhóm module (vạch trái thẻ), dùng cho canvas dev dạng cây. */
  tone?: WorkflowCanvasTone;
  /** Chữ nhóm nhỏ phía trên tên thẻ (ví dụ SYNC, THU CHI). */
  group?: WorkflowCanvasText;
  /** "read": thẻ của lớp chỉ đọc, ẩn mặc định và hiện cùng nút bật luồng đọc. */
  layer?: "main" | "read";
}

export interface WorkflowCanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: WorkflowCanvasText;
  /** Số thứ tự gọi (chỉ canvas dev): hiển thị trước nhãn mũi tên. */
  step?: number;
  /** "read": luồng chỉ đọc dữ liệu, ẩn mặc định và hiện bằng nút bật trên thanh công cụ. */
  kind?: "main" | "read";
  /** Các luồng tự động mà mũi tên này thuộc về (mũi tên dùng chung thuộc nhiều luồng). */
  flows?: string[];
  /** Số thứ tự của mũi tên trong từng luồng (id luồng → số), dùng khi mũi tên thuộc nhiều luồng. */
  steps?: Record<string, number>;
  /** Cơ chế gọi, ví dụ DI, cron, HTTP, ghi DB (chỉ canvas dev dùng). */
  mechanism?: string;
  dashed?: boolean;
}

/** Một luồng tự động giữa các module: chữ cái, màu và tên hiển thị. */
export interface WorkflowCanvasFlow {
  id: string;
  letter: string;
  /** Màu hex lấy từ bảng chart dashboard. */
  color: string;
  title: WorkflowCanvasText;
  /** Một câu mô tả luồng (kích hoạt → kết quả): tooltip trong dropdown và tài liệu hướng dẫn. */
  description: WorkflowCanvasText;
}

export interface WorkflowCanvasDefinition {
  id: WorkflowCanvasId;
  /** Đối tượng đọc: quyết định cách đặt key tài liệu và mức chi tiết (mặc định end-user). */
  audience?: "end-user" | "dev";
  title: WorkflowCanvasText;
  /** Mô tả ngắn, hiện dưới tiêu đề khi xuất PNG/PDF. */
  description: WorkflowCanvasText;
  /** Ô góc phía trên bên trái của lưới (chỉ canvas end-user). */
  corner?: WorkflowCanvasRect & { title: WorkflowCanvasText };
  /** Các luồng tự động (chỉ canvas dev): dùng cho chip làm nổi luồng và màu mũi tên. */
  flows?: WorkflowCanvasFlow[];
  lanes: WorkflowCanvasLane[];
  columns: WorkflowCanvasColumn[];
  nodes: WorkflowCanvasNode[];
  edges: WorkflowCanvasEdge[];
}

/** Kích thước node cố định của thẻ sơ đồ. */
export const WORKFLOW_NODE_WIDTH = 220;
/** Chiều cao tối thiểu chung của thẻ: các thẻ cùng hàng cao bằng nhau nên tâm cạnh thẳng hàng, mũi tên nối thẳng. */
export const WORKFLOW_CARD_MIN_HEIGHT = 112;
