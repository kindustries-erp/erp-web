import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
import type { EmployeeRecord } from "../../domain/employee";

/** Hình dạng request/response của `/api/v2/employees` (khớp backend, không phụ thuộc V1) */
export type EmployeeListResultDto = V2PaginatedResponse<EmployeeRecord> & {
  summaries?: Record<string, V2SummaryMetric | null>;
};

export interface EmployeeEnvelopeDto {
  message: string;
  data: EmployeeRecord;
}

export interface EmployeeNationalIdEnvelopeDto {
  message: string;
  data: { nationalId: string | null };
}

export interface EmployeeNextCodeDto {
  nextCode: string;
}

export interface ColumnOptionDto {
  label: string;
  value: string;
}

export type ColumnOptionsResultDto = V2PaginatedResponse<ColumnOptionDto>;

/**
 * Payload tạo/sửa. Khi sửa, trường nullable gửi `null` để xóa giá trị;
 * khi tạo, trường rỗng bị bỏ khỏi payload.
 */
export interface EmployeePayloadDto {
  employeeCode?: string;
  fullName: string;
  status: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  birthDate?: string | null;
  startDate?: string | null;
  leaveDate?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  branchId?: string | null;
  nationalId?: string | null;
}

/** Chi nhánh dùng cho ô chọn (từ `/api/v2/branches`) */
export interface EmployeeBranchOptionDto {
  id: string;
  code: string;
  name: string;
}
