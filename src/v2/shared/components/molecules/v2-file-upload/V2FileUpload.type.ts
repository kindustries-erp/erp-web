export type V2FileRejectReason = "type" | "size" | "count";

export interface V2RejectedFile {
  file: File;
  reason: V2FileRejectReason;
}

export interface V2FileValidationOptions {
  /** Đuôi tệp (`.xml`) hoặc mime (`application/pdf`, `image/*`). Bỏ trống là nhận mọi loại */
  accept?: string[];
  maxSizeBytes?: number;
  maxFiles?: number;
}

export interface V2FileUploadProps extends V2FileValidationOptions {
  /** Gọi mỗi lần người dùng chọn hoặc thả tệp, kèm danh sách tệp bị từ chối và lý do */
  onFilesSelected: (accepted: File[], rejected: V2RejectedFile[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  /** Mặc định là "Kéo thả tệp vào đây hoặc bấm để chọn" */
  title?: string;
  /** Dòng gợi ý định dạng, ví dụ "XML, ZIP, tối đa 20 MB" */
  hint?: string;
  className?: string;
}
