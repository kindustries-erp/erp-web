import type {
  TraceabilityGraphData,
  TraceabilityNodeType,
} from "../../types/traceability.type";
import type { TraceabilityCanvasActions } from "../../types/traceability.flow.type";

export interface V2DocumentTraceabilityProps extends TraceabilityCanvasActions {
  /** Id chứng từ gốc (hóa đơn, giao dịch ngân hàng...) */
  rootId: string;
  /** Tải đồ thị theo rootId; bỏ qua khi có `graphData` */
  fetchGraph?: (id: string) => Promise<TraceabilityGraphData>;
  /** Đồ thị do cha quản lý (cập nhật lạc quan từ ngoài) */
  graphData?: TraceabilityGraphData | null;
  /** Đang ở chế độ sửa: cho phép ghép nối và gỡ liên kết */
  editMode?: boolean;
  /** Giới hạn loại chứng từ được ghép nối; không truyền thì dùng danh sách mặc định */
  allowedDocTypes?: TraceabilityNodeType[];
  /** Báo số chứng từ liên kết mỗi khi đồ thị đổi (dùng cho badge ở tab cha) */
  onLinkedCountChange?: (count: number) => void;
}
