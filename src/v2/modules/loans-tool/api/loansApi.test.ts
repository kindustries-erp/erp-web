import { beforeEach, describe, expect, it, vi } from "vitest";
import { TableSortState, type V2TableQuery } from "@/v2/shared/types/v2-table";

const { del, get } = vi.hoisted(() => ({ del: vi.fn(), get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { delete: del, get },
}));

import { loansApi, toLoansListParams } from "./loansApi";

describe("toLoansListParams", () => {
  it("serialize đúng phân trang, tìm kiếm và summary_keys", () => {
    const query: V2TableQuery = {
      page: 2,
      pageSize: 50,
      search: "  VCB  ",
      sorts: [{ columnKey: "principalAmount", direction: TableSortState.DESC }],
      columnFilters: { status: ["ACTIVE"] },
      columnSearch: { title: "Vay" },
      columnOperators: {},
      dateRanges: { startDate: { from: "2026-01-01", to: "2026-12-31" } },
      summaryKeys: ["principalAmount", "remainingPrincipal"],
    };

    expect(toLoansListParams({ ...query, deleted: "only" })).toEqual({
      page: 2,
      pageSize: 50,
      status: undefined,
      lenderName: undefined,
      deleted: "only",
      search: "VCB",
      sort: "-principalAmount",
      column_filters: JSON.stringify({ status: ["ACTIVE"] }),
      column_search: JSON.stringify({ title: "Vay" }),
      column_operators: undefined,
      date_ranges: JSON.stringify({
        startDate: { from: "2026-01-01", to: "2026-12-31" },
      }),
      summary_keys: "principalAmount,remainingPrincipal",
    });
  });
});

describe("loansApi", () => {
  beforeEach(() => {
    get.mockReset();
    del.mockReset();
  });

  it("list trả response chuẩn { items, pagination, summaries }", async () => {
    const payload = {
      items: [{ id: "l1", loanCode: "LOAN-001" }],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      summaries: {
        principalAmount: {
          total: 100000000,
          pageSubtotal: 100000000,
          cumulative: 100000000,
        },
      },
    };
    get.mockResolvedValueOnce({ data: payload });

    const res = await loansApi.list({
      page: 1,
      pageSize: 20,
      summaryKeys: ["principalAmount"],
    });

    expect(get).toHaveBeenCalledWith("/api/v2/loans-tool", {
      params: expect.objectContaining({
        page: 1,
        pageSize: 20,
        summary_keys: "principalAmount",
      }),
    });
    expect(res).toEqual(payload);
  });

  it("options gọi GET /api/v2/loans-tool/column-options kèm deleted", async () => {
    const page = {
      items: [{ label: "VCB", value: "VCB" }],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        next: null,
        previous: null,
      },
    };
    get.mockResolvedValueOnce({ data: page });

    const res = await loansApi.options({
      columnKey: "lenderName",
      search: "VCB",
      pageParam: 1,
      filtersStr: "{}",
      deleted: "only",
    });

    expect(get).toHaveBeenCalledWith("/api/v2/loans-tool/column-options", {
      params: {
        column: "lenderName",
        search: "VCB",
        page: 1,
        pageSize: 20,
        filters: "{}",
        deleted: "only",
      },
    });
    expect(res).toEqual({ items: page.items, total: 1, next: null });
  });

  it("purge gọi DELETE /api/v2/loans-tool/:id/permanent", async () => {
    del.mockResolvedValueOnce({ data: { id: "l1" } });
    const res = await loansApi.purge("l1");
    expect(del).toHaveBeenCalledWith("/api/v2/loans-tool/l1/permanent");
    expect(res).toEqual({ id: "l1" });
  });
});
