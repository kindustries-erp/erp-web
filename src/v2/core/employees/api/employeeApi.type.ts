import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { EmployeeFormValue, EmployeeRecord } from "../domain/employee";
import type {
  EmployeeBranchOptionDto,
  EmployeeListResultDto,
} from "./dtos/employee.dto";

/** Hợp đồng API của họ employees. Xóa là xóa mềm; liên kết tài khoản nằm ở users-management. */
export interface EmployeeApi {
  list: (query: V2TableQuery) => Promise<EmployeeListResultDto>;
  options: (params: V2FetchOptionsParams) => Promise<V2FetchOptionsResult>;
  get: (id: string) => Promise<EmployeeRecord>;
  /** CCCD đầy đủ (cần quyền cập nhật), dùng khi mở form sửa */
  getNationalId: (id: string) => Promise<string>;
  nextCode: () => Promise<string>;
  create: (form: EmployeeFormValue) => Promise<EmployeeRecord>;
  update: (id: string, form: EmployeeFormValue) => Promise<EmployeeRecord>;
  setStatus: (
    id: string,
    status: "ACTIVE" | "INACTIVE",
  ) => Promise<EmployeeRecord>;
  remove: (id: string) => Promise<EmployeeRecord>;
  listBranches: () => Promise<EmployeeBranchOptionDto[]>;
}
