import type { AuditApi } from "@/v2/core/audit";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { auditLogsV2Api, type AuditLogsListQuery } from "./auditLogsV2Api";

const CREATED_AT = "createdAt";

/** Chuyển truy vấn bảng V2 sang query của `/api/v2/audit-logs`. */
export const toAuditListQuery = (query: V2TableQuery): AuditLogsListQuery => {
  const range = query.dateRanges[CREATED_AT];
  const filters = Object.fromEntries(
    Object.entries(query.columnFilters).filter(([, v]) => v.length > 0),
  );
  const search = Object.fromEntries(
    Object.entries(query.columnSearch).filter(([, v]) => v.trim()),
  );
  return {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search?.trim() || undefined,
    sorts: query.sorts.map((s) =>
      s.direction === "desc" ? `-${s.columnKey}` : s.columnKey,
    ),
    column_filters: Object.keys(filters).length
      ? JSON.stringify(filters)
      : undefined,
    column_search: Object.keys(search).length
      ? JSON.stringify(search)
      : undefined,
    date_from: range?.from || undefined,
    date_to: range?.to || undefined,
  };
};

/** Ghép client V2 của module thành `AuditApi` của lõi audit. */
export const auditLogsAdapter: AuditApi = {
  list: async (query) => {
    const res = await auditLogsV2Api.list(toAuditListQuery(query));
    return { items: res.data, total: res.total };
  },
  options: (params) =>
    auditLogsV2Api.columnOptions(
      params.columnKey,
      params.search,
      params.pageParam,
      20,
      params.filtersStr,
    ),
};
