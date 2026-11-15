import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { UserFormValue, UserRecord } from "../domain/user";
import type { UserAuditEntryDto, UserListResultDto } from "./dtos/user.dto";

/**
 * Hợp đồng API của họ users. Không có `remove`: tài khoản không xóa, chỉ ngưng hoạt động.
 */
export interface UserApi {
  list: (query: V2TableQuery) => Promise<UserListResultDto>;
  options: (params: V2FetchOptionsParams) => Promise<V2FetchOptionsResult>;
  get: (id: string) => Promise<UserRecord>;
  create: (form: UserFormValue) => Promise<UserRecord>;
  update: (id: string, form: UserFormValue) => Promise<UserRecord>;
  activate: (id: string) => Promise<UserRecord>;
  deactivate: (id: string) => Promise<UserRecord>;
  resetPassword: (id: string, newPassword: string) => Promise<UserRecord>;
  /** Nhật ký audit của một tài khoản (entity `users_management`) */
  timeline: (id: string) => Promise<UserAuditEntryDto[]>;
}
