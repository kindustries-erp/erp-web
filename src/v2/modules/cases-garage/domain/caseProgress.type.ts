import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type { CasesDashboardCaseStatus } from "./casesDashboard.type";

/**
 * Kiểu dữ liệu tiến độ xe, khớp DTO `api/v2/cases-garage` (`case-progress.dto.ts`).
 * `status` là vòng đời vụ việc (cột Kanban); `progressStage` là công đoạn sửa chữa (badge).
 */

export const CASE_PROGRESS_STAGES = [
  "WAITING_PARTS",
  "REPAIRING",
  "PAINTING",
  "QC",
  "READY_FOR_DELIVERY",
] as const;
export type CaseProgressStage = (typeof CASE_PROGRESS_STAGES)[number];

export type CaseProgressStatus = CasesDashboardCaseStatus;

/** Một dòng bảng theo dõi tiến độ (`GET /api/v2/cases-garage/progress`). */
export interface CaseProgressItem {
  id: string;
  caseCode: string;
  licensePlate: string | null;
  vehicleBrandName: string | null;
  vehicleModelName: string | null;
  customerName: string | null;
  /** Tên khách in trên phiếu KGara (có thể khác tên danh mục). */
  voucherCustomerName?: string | null;
  receivedAt: string | null;
  startedAt: string | null;
  workSummary: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  advisorCode: string | null;
  advisorName: string | null;
  progressStage: CaseProgressStage | null;
  progressPercent: number | null;
  expectedCompletionAt: string | null;
  status: CaseProgressStatus;
  statusName: string | null;
  elapsedMinutes: number | null;
  isOverdue: boolean;
  /** Các field đang bị sửa đè ở v2 so với KGara (có `status` khi đã đổi trạng thái ở v2). */
  overriddenFields: string[];
}

export type CaseProgressListResponse = V2PaginatedResponse<CaseProgressItem>;

export interface CaseProgressListParams {
  page?: number;
  /** Tối đa 200 (backend chặn). */
  pageSize?: number;
  /** Mặc định backend là IN_PROGRESS; truyền `ALL` để lấy mọi trạng thái. */
  status?: CaseProgressStatus | "ALL";
  assigneeId?: string;
  stage?: CaseProgressStage;
  overdue?: boolean;
  search?: string;
}

/** Gửi `null` để xóa giá trị; bỏ field thì giữ nguyên. */
export interface UpdateCaseProgressPayload {
  assigneeId?: string | null;
  progressStage?: CaseProgressStage | null;
  progressPercent?: number | null;
  expectedCompletionAt?: string | null;
}

export interface CaseMutationResult {
  message?: string;
}
