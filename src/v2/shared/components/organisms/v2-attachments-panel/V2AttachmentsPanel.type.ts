import type { V2OwnerFilesApi } from "@/v2/shared/files";

export interface V2AttachmentsPanelProps {
  /** Client của owner, tạo bằng `createV2OwnerFilesApi(basePath)` */
  api: V2OwnerFilesApi;
  /** Có quyền tải lên và xóa; false thì chỉ xem và tải */
  canEdit?: boolean;
  /** Danh mục chọn sẵn khi tải lên; mặc định lấy danh mục đầu tiên server trả về */
  defaultCategory?: string;
  className?: string;
}
