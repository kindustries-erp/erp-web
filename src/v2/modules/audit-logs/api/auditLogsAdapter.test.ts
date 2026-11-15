import { describe, expect, it } from "vitest";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { toAuditListQuery } from "./auditLogsAdapter";

const base: V2TableQuery = {
  page: 2,
  pageSize: 50,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

describe("toAuditListQuery", () => {
  it("map phân trang, sort, bộ lọc và khoảng ngày createdAt", () => {
    const q = toAuditListQuery({
      ...base,
      search: " abc ",
      sorts: [{ columnKey: "createdAt", direction: "desc" }] as never,
      columnFilters: { module: ["users"], status: [] },
      dateRanges: { createdAt: { from: "2026-01-01", to: "2026-01-31" } },
    });
    expect(q).toMatchObject({
      page: 2,
      pageSize: 50,
      search: "abc",
      sorts: ["-createdAt"],
      column_filters: '{"module":["users"]}',
      date_from: "2026-01-01",
      date_to: "2026-01-31",
    });
    expect(q.column_search).toBeUndefined();
  });
});
