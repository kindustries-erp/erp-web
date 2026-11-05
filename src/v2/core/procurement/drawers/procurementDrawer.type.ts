import type { ProcurementApi } from "../procurement.types";

/** Props chung của drawer chứng từ procurement. `documentId` null nghĩa là tạo mới. */
export interface ProcurementDrawerProps {
  open: boolean;
  documentId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
  /** Khóa cache của danh sách, để làm mới sau khi lưu */
  queryKey: string;
  api: ProcurementApi<any, any, any, any>;
  /** Tạo PO điền sẵn từ PR này (null/undefined: lập tay) */
  fromRequestId?: string | null;
  /** API đề nghị mua, dùng để đọc PR và bản nháp PO */
  requestApi?: ProcurementApi<any, any, any, any>;
}
