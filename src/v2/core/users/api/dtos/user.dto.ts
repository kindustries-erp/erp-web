import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type { UserRecord } from "../../domain/user";

/** Hình dạng request/response của `/api/v2/users-management` (khớp backend, không phụ thuộc V1) */
export type UserListResultDto = V2PaginatedResponse<UserRecord> & {
  summaries?: Record<string, V2SummaryMetric | null>;
};

export interface UserEnvelopeDto {
  message: string;
  data: UserRecord;
}

export interface ColumnOptionDto {
  label: string;
  value: string;
}

export type ColumnOptionsResultDto = V2PaginatedResponse<ColumnOptionDto>;

export interface CreateUserPayloadDto {
  email: string;
  password: string;
  employeeId?: string;
}

export interface UpdateUserPayloadDto {
  status: string;
  employeeId: string | null;
}

/** Nhân viên rút gọn dùng cho ô chọn liên kết */
export interface UserEmployeeOptionDto {
  id: string;
  fullName: string;
  employeeCode: string;
}

/** Một dòng nhật ký audit của tài khoản (rút gọn từ `/api/v2/audit-logs/:entityType/:entityId/timeline`) */
export interface UserAuditEntryDto {
  id: string;
  actionType: string;
  actorEmail: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}
