import type { ProcurementActionKey } from "./procurement.rules";
import type {
  ProcurementApi,
  ProcurementDocumentRef,
} from "./procurement.types";

/** Props chung của drawer chứng từ procurement. `documentId` null nghĩa là tạo mới. */
export interface ProcurementDrawerProps {
  open: boolean;
  documentId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
  /** Khóa cache của danh sách, để làm mới sau khi lưu */
  queryKey: string;
  api: ProcurementApi<unknown>;
  /** Tạo PO điền sẵn từ PR này (null/undefined: lập tay) */
  fromRequestId?: string | null;
  /** API đề nghị mua, dùng để đọc PR và bản nháp PO */
  requestApi?: ProcurementApi<unknown>;
  /** Thực hiện chuyển trạng thái (duyệt, từ chối, hủy...) từ drawer */
  onTransition?: (
    action: ProcurementActionKey,
    row?: ProcurementDocumentRef,
  ) => void;
  /** Có quyền tạo PO từ PR không */
  canCreateOrder?: boolean;
  /** Điều hướng sang lập PO từ PR */
  onOrderFromRequest?: (row: ProcurementDocumentRef) => void;
  /** Lưu xong: mở lại chứng từ vừa lưu ở chế độ xem. Thiếu thì đóng drawer. */
  onSaved?: (id: string) => void;
  /**
   * Chi nhánh tùy chọn (Garage): được để trống, chọn 1 hoặc bỏ trống khi còn nháp,
   * và đặt dưới các trường chính. Mặc định false giữ hành vi luồng thường.
   */
  branchOptional?: boolean;
}
