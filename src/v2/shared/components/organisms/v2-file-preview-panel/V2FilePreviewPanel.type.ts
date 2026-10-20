export interface V2FilePreviewFile {
  name: string;
  mimeType?: string;
  /** Địa chỉ để hiển thị (blob URL hoặc đường dẫn đã xác thực). Dùng cho PDF và ảnh */
  url?: string;
  /** Nội dung văn bản (XML, JSON, CSV, TXT). Module tự tải rồi truyền vào */
  text?: string;
}

export type V2FilePreviewKind = "pdf" | "image" | "text" | "unsupported";

export interface V2FilePreviewPanelProps {
  /** `null` là chưa chọn tệp */
  file: V2FilePreviewFile | null;
  loading?: boolean;
  /** Thông báo lỗi tải tệp (đã dịch) */
  error?: string | null;
  /** Có thì hiện nút Tải xuống ở thanh tiêu đề và ở trạng thái không hỗ trợ */
  onDownload?: () => void;
  /** Chiều cao vùng xem; mặc định lấp đầy phần tử cha */
  height?: number | string;
  className?: string;
}
