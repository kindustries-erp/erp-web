/**
 * Kiểu dữ liệu UI trang tiến độ xưởng (core không import module). Cấu trúc khớp response
 * `api/v2/cases-garage` để module truyền thẳng dữ liệu API vào component.
 */

/** Status v2 của vụ việc (cột Kanban). */
export type WorkshopCaseStatus =
  | "INTAKE"
  | "QUOTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type WorkshopLogKind = "STAGE" | "NOTE";

/** Thẻ xe trên board xưởng. */
export interface WorkshopCaseView {
  id: string;
  caseCode: string;
  licensePlate: string | null;
  vehicleBrandName: string | null;
  vehicleModelName: string | null;
  customerName: string | null;
  /** Tên khách in trên phiếu KGara (có thể khác tên danh mục). */
  voucherCustomerName?: string | null;
  workSummary: string | null;
  status: WorkshopCaseStatus;
  /** Nguồn vụ việc: xe KGara đổi trạng thái tự do (ghi đè ở ERP), xe ERP theo bảng chuyển. */
  origin: WorkshopCaseOrigin;
  /** Status nhỏ (công đoạn). */
  progressStage: string | null;
  assigneeName: string | null;
  expectedCompletionAt: string | null;
  isOverdue: boolean;
  stageStartedAt: string | null;
  totalElapsedMinutes: number | null;
  stageWorkerName: string | null;
  lastNote: string | null;
}

/** Một dòng nhật ký tiến độ. */
export interface WorkshopLogView {
  id: string;
  kind: WorkshopLogKind;
  caseStatus: string;
  stage: string | null;
  note: string | null;
  workerId: string | null;
  workerName: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
}

/** Nhân viên để chọn người làm. */
export interface WorkshopWorkerOption {
  id: string;
  code: string;
  fullName: string;
  jobTitle: string | null;
}

/** Giá trị form ghi tiến độ (tạo mới hoặc sửa một dòng). Giờ dạng `yyyy-MM-ddTHH:mm` giờ máy. */
export interface WorkshopLogFormValue {
  kind: WorkshopLogKind;
  stage: string;
  note: string;
  workerId: string | null;
  workerName: string;
  startedAt: string;
  endedAt: string;
}

/** Payload gửi lên khi lưu form (module chuyển thành lệnh API tương ứng). */
export interface WorkshopLogSubmit {
  kind: WorkshopLogKind;
  stage?: string;
  note: string | null;
  workerId: string | null;
  workerName: string | null;
  startedAt?: string;
  endedAt?: string;
}

/** Nguồn vụ việc: `KGARA_SYNC` chiếu từ KGara, `NATIVE` nhập ở ERP. */
export type WorkshopCaseOrigin = "NATIVE" | "KGARA_SYNC";

/** Xe ứng viên để đưa vào bảng tiến độ. */
export interface WorkshopCandidateView {
  id: string;
  caseCode: string;
  licensePlate: string | null;
  customerName: string | null;
  /** Tên khách in trên phiếu KGara (có thể khác tên danh mục). */
  voucherCustomerName?: string | null;
  vehicleName: string | null;
  origin: WorkshopCaseOrigin;
  status: WorkshopCaseStatus;
  /** Đã có trên bảng. */
  onBoard: boolean;
}

/** Lệnh đưa xe vào bảng: xe có sẵn (giữ hoặc đổi trạng thái) hoặc xe mới tạo theo biển số. */
export type WorkshopTrackSubmit =
  | { mode: "existing"; caseId: string; status?: WorkshopCaseStatus }
  | {
      mode: "new";
      licensePlate: string;
      customerName?: string;
      status: WorkshopCaseStatus;
    };
