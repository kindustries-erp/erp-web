import type { V2FilePolicy } from "@/v2/shared/files";

/** Dung lượng dạng đọc được, ví dụ `1.5 MB`. 0 hoặc không hợp lệ nghĩa là chưa biết (dữ liệu cũ) nên hiện "—" */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Chuyển policy của server sang tham số `accept` của V2FileUpload */
export function policyToUploadProps(policy: V2FilePolicy | null) {
  if (!policy) return {};
  return {
    accept: policy.allowedExtensions.map((ext) => `.${ext}`),
    maxSizeBytes: policy.maxFileBytes,
    maxFiles: policy.maxFilesPerRequest,
  };
}
