export type V2ExportHistoryTone = "ready" | "running" | "failed";

export interface V2ExportHistoryItem {
  id: string;
  fileName: string;
  /** Kỳ hoặc khoảng ngày đã đọc sẵn, ví dụ "01/03/2026 - 31/03/2026" */
  periodLabel: string;
  /** Thời điểm tạo đã format sẵn */
  createdAt: string;
  statusTone: V2ExportHistoryTone;
  /** Nhãn trạng thái đã dịch, ví dụ "Đang tạo 40%" */
  statusLabel: string;
  canDownload: boolean;
}

export interface V2ExportHistoryListProps {
  items: V2ExportHistoryItem[];
  isLoading?: boolean;
  emptyLabel: string;
  downloadLabel: string;
  downloadingLabel: string;
  /** id đang tải, để hiện spinner trên đúng dòng */
  downloadingId?: string | null;
  onDownload: (id: string) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}
