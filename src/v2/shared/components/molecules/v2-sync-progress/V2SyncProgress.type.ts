export type V2SyncProgressStatus = "idle" | "running" | "done" | "error";

export type V2SyncProgressLevel = "info" | "success" | "error";

export interface V2SyncProgressEntry {
  at: number;
  message: string;
  level?: V2SyncProgressLevel;
}

export interface V2SyncProgressLabels {
  /** Hiện trong console khi chưa có dòng nào (đã dịch) */
  empty: string;
  /** Nhãn trên thanh khi đang chạy (đã dịch) */
  running?: string;
  /** Nhãn trên thanh khi hoàn tất (đã dịch) */
  done?: string;
  /** Nhãn trên thanh khi lỗi (đã dịch) */
  error?: string;
  /** Tiền tố trước hóa đơn đang xử lý (đã dịch), ví dụ "Đang xử lý" */
  currentItem?: string;
}

export interface V2SyncProgressProps {
  status: V2SyncProgressStatus;
  /** 0–100. Bỏ trống nghĩa là chưa biết tiến độ (thanh nhấp nháy) */
  progress?: number;
  /** Hóa đơn đang xử lý, hiện một dòng khi đang chạy */
  currentItem?: string;
  logs: V2SyncProgressEntry[];
  /** Console giãn lấp hết chiều cao của phần tử cha (thay cho chiều cao cố định) */
  fillHeight?: boolean;
  labels: V2SyncProgressLabels;
  className?: string;
}
