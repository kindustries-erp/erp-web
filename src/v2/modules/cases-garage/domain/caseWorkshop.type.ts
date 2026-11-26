import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type { CaseProgressItem, CaseProgressStatus } from "./caseProgress.type";

/**
 * Kiểu dữ liệu trang tiến độ xưởng, khớp DTO `api/v2/cases-garage` (`case-progress-log.dto.ts`,
 * `case-workshop-workers.service.ts`). Status cha là status v2; `progressStage` là status nhỏ.
 */

export type CaseProgressLogKind = "STAGE" | "NOTE";

/** Thẻ xe trên board xưởng (`GET workshop/board`). */
export interface CaseWorkshopBoardItem extends CaseProgressItem {
  /** Nguồn vụ việc, quyết định trạng thái được đổi (xem `allowedStatuses` của core). */
  origin: CaseOrigin;
  completedAt: string | null;
  /** Lúc xe được đưa vào bảng tiến độ xưởng. */
  workshopTrackedAt: string | null;
  stageStartedAt: string | null;
  stageElapsedMinutes: number | null;
  totalElapsedMinutes: number | null;
  stageWorkerName: string | null;
  lastNote: string | null;
}

export type CaseWorkshopBoardResponse =
  V2PaginatedResponse<CaseWorkshopBoardItem>;

export interface CaseWorkshopBoardParams {
  page?: number;
  /** Tối đa 200 (backend chặn). */
  pageSize?: number;
  search?: string;
  assigneeId?: string;
  /** Xe đã xong/hủy hiện trong số ngày này (1-90, mặc định 7). */
  finishedDays?: number;
  /** Mã phân loại (ví dụ `OJ`); bỏ trống là mọi phân loại. */
  classification?: string;
}

/** Một dòng nhật ký (`GET :id/progress-logs`). */
export interface CaseProgressLogItem {
  id: string;
  caseId: string;
  kind: CaseProgressLogKind;
  caseStatus: string;
  stage: string | null;
  note: string | null;
  workerId: string | null;
  workerName: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseProgressLogPayload {
  kind: CaseProgressLogKind;
  stage?: string;
  note?: string;
  workerId?: string | null;
  workerName?: string | null;
  /** ISO; bỏ trống là hiện tại. */
  startedAt?: string;
}

/** Gửi `null` để xóa giá trị; bỏ field thì giữ nguyên. */
export interface UpdateCaseProgressLogPayload {
  note?: string | null;
  workerId?: string | null;
  workerName?: string | null;
  startedAt?: string;
  endedAt?: string;
}

/** Nhân viên để chọn người làm (`GET workshop/workers`). */
export interface WorkshopWorker {
  id: string;
  code: string;
  fullName: string;
  jobTitle: string | null;
}

/** Nguồn vụ việc: `KGARA_SYNC` chiếu từ KGara (đổi trạng thái là ghi đè ở v2), `NATIVE` nhập ở v2. */
export type CaseOrigin = "NATIVE" | "KGARA_SYNC";

/** Xe ứng viên để đưa vào bảng (`GET workshop/candidates`). */
export interface WorkshopCandidate {
  id: string;
  caseCode: string;
  licensePlate: string | null;
  customerName: string | null;
  /** Tên khách in trên phiếu KGara (có thể khác tên danh mục). */
  voucherCustomerName?: string | null;
  vehicleName: string | null;
  origin: CaseOrigin;
  status: CaseProgressStatus;
  receivedAt: string | null;
  /** Đã có trên bảng tiến độ. */
  onBoard: boolean;
}

/** `POST workshop/track`: `status` khác hiện tại thì đổi (cần thêm quyền `garage:update`). */
export interface TrackWorkshopCasePayload {
  caseId: string;
  status?: CaseProgressStatus;
}

/** `POST workshop/track-new`: xe chưa có, tạo vụ việc (cần `garage:create`). */
export interface TrackNewWorkshopCasePayload {
  licensePlate: string;
  customerName?: string;
  requestDescription?: string;
  status?: CaseProgressStatus;
}

export interface WorkshopTrackResult {
  caseId: string;
  caseCode: string;
  licensePlate: string | null;
  status: CaseProgressStatus;
  workshopTrackedAt: string;
  statusChanged: boolean;
  created: boolean;
}
