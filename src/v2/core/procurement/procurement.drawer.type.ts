import type { ProcurementActionKey } from "./procurement.rules";
import type { ApprovalGate } from "./approval/approval.gate";
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
  /** Khóa duyệt của màn: lọc duyệt/từ chối trong drawer theo người được chọn */
  approval?: ApprovalGate;
  /** PO: khóa duyệt tắt thì thay "Gửi duyệt" bằng nút Tạo mới / Cập nhật (lưu + ghi nhận) */
  directConfirm?: boolean;
  /**
   * Chi nhánh tùy chọn (Garage): được để trống, chọn 1 hoặc bỏ trống khi còn nháp,
   * và đặt dưới các trường chính. Mặc định false giữ hành vi luồng thường.
   */
  branchOptional?: boolean;
  /** Mã hàng bắt buộc cho mọi dòng đơn mua (Garage). PR và ERP giữ mã tùy chọn. */
  itemCodeRequired?: boolean;
  /**
   * Bật ô chọn đề nghị mua (chỉ khi tạo mới). Giá trị là mã quyền collection cần có quyền `read`
   * để xem danh sách đề nghị; thiếu thì ô bị ẩn. PR không bắt buộc.
   */
  requestPickerCollection?: string;
}
