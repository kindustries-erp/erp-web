import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { AuditListResult } from "./dtos/audit-log.dto";

/** Hợp đồng API của họ audit: chỉ đọc (danh sách và tùy chọn lọc cột). */
export interface AuditApi {
  list: (query: V2TableQuery) => Promise<AuditListResult>;
  options: (params: V2FetchOptionsParams) => Promise<V2FetchOptionsResult>;
}
