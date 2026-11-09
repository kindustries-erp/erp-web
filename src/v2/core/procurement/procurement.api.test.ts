import { beforeEach, describe, expect, it, vi } from "vitest";

const { del, get } = vi.hoisted(() => ({ del: vi.fn(), get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { delete: del, get },
  V2_API_BASE_URL: "http://test",
}));

import {
  createProcurementApi,
  toProcurementListParams,
  withProcurementFilter,
} from "./procurement.api";
import { TableSortState, type V2TableQuery } from "@/v2/shared/types/v2-table";

describe("toProcurementListParams", () => {
  it("serialize đúng phân trang và từ khóa tìm kiếm", () => {
    const query: V2TableQuery = {
      page: 2,
      pageSize: 50,
      search: "  phụ tùng  ",
      sorts: [],
      columnFilters: {},
      columnSearch: {},
      columnOperators: {},
      dateRanges: {},
    };

    expect(toProcurementListParams(query)).toEqual({
      page: 2,
      pageSize: 50,
      search: "phụ tùng",
      sort: undefined,
      column_filters: undefined,
      column_search: undefined,
      column_operators: undefined,
      date_ranges: undefined,
      summary_keys: undefined,
    });
  });

  it("gửi summary_keys từ các key cột có tổng", () => {
    const query: V2TableQuery = {
      page: 3,
      pageSize: 20,
      sorts: [],
      columnFilters: {},
      columnSearch: {},
      columnOperators: {},
      dateRanges: {},
      summaryKeys: ["estimatedTotal", "totalAmount"],
    };

    expect(toProcurementListParams(query).summary_keys).toBe(
      "estimatedTotal,totalAmount",
    );
  });

  it("serialize bộ lọc cột, tìm kiếm cột, ngày và sắp xếp sang JSON chuẩn V2", () => {
    const query: V2TableQuery = {
      page: 1,
      pageSize: 20,
      search: "",
      sorts: [
        { columnKey: "createdAt", direction: TableSortState.DESC },
        { columnKey: "requestNo", direction: TableSortState.ASC },
      ],
      columnFilters: { status: ["PENDING_APPROVAL"] },
      columnSearch: { requestNo: "PR-2026" },
      columnOperators: {},
      dateRanges: { requestDate: { from: "2026-11-01", to: "2026-11-05" } },
    };

    const params = toProcurementListParams(query);
    expect(params.search).toBeUndefined();
    expect(params.sort).toBe("-createdAt,requestNo");
    expect(params.column_filters).toBe(
      JSON.stringify({ status: ["PENDING_APPROVAL"] }),
    );
    expect(params.column_search).toBe(JSON.stringify({ requestNo: "PR-2026" }));
    expect(params.date_ranges).toBe(
      JSON.stringify({
        requestDate: { from: "2026-11-01", to: "2026-11-05" },
      }),
    );
  });
});

describe("createProcurementApi: list theo response chuẩn", () => {
  const query: V2TableQuery = {
    page: 2,
    pageSize: 20,
    search: "",
    sorts: [],
    columnFilters: {},
    columnSearch: {},
    columnOperators: {},
    dateRanges: {},
  };

  it("đọc items, pagination.total và summaries từ response", async () => {
    get.mockResolvedValueOnce({
      data: {
        items: [{ id: "p1", requestNo: "DNM-001" }],
        pagination: { page: 2, pageSize: 20, total: 45, totalPages: 3 },
        summaries: {
          estimatedTotal: { total: 7500000, pageSubtotal: 1, cumulative: 2 },
        },
      },
    });
    const api = createProcurementApi("/api/v2/procurement-requests-garage");

    const result = await api.list(query);

    expect(get).toHaveBeenCalledWith("/api/v2/procurement-requests-garage", {
      params: expect.objectContaining({ page: 2, pageSize: 20 }),
    });
    expect(result).toEqual({
      items: [{ id: "p1", requestNo: "DNM-001" }],
      total: 45,
      summaries: {
        estimatedTotal: { total: 7500000, pageSubtotal: 1, cumulative: 2 },
      },
    });
  });
});

describe("createProcurementApi: xóa mềm và xóa cứng", () => {
  beforeEach(() => {
    del.mockReset();
    del.mockResolvedValue({ data: { id: "p1" } });
  });

  it("xóa cứng gọi DELETE {base}/{id}/permanent khi bật supportsPurge", async () => {
    const api = createProcurementApi("/api/v2/procurement-requests-garage", {
      supportsDelete: true,
      supportsPurge: true,
    });

    await api.purge?.("p1");

    expect(del).toHaveBeenCalledWith(
      "/api/v2/procurement-requests-garage/p1/permanent",
    );
  });

  it("không có purge khi không bật supportsPurge, không gọi HTTP", () => {
    const api = createProcurementApi("/api/v2/procurement-orders-garage", {
      supportsDelete: true,
    });

    expect(api.purge).toBeUndefined();
    expect(del).not.toHaveBeenCalled();
  });

  it("xóa mềm vẫn gọi DELETE {base}/{id} khi bật supportsDelete", async () => {
    const api = createProcurementApi("/api/v2/procurement-orders-garage", {
      supportsDelete: true,
    });

    await api.remove?.("o1");

    expect(del).toHaveBeenCalledWith("/api/v2/procurement-orders-garage/o1");
  });

  it("options gọi GET {base}/column-options với tham số cột", async () => {
    get.mockResolvedValueOnce({
      data: { items: [{ label: "HN", value: "b-1" }], total: 1, next: null },
    });
    const api = createProcurementApi("/api/v2/procurement-requests-garage");

    const result = await api.options?.({
      columnKey: "branchName",
      search: "HN",
      pageParam: 1,
      filtersStr: '{"status":["APPROVED"]}',
    });

    expect(get).toHaveBeenCalledWith(
      "/api/v2/procurement-requests-garage/column-options",
      {
        params: {
          column: "branchName",
          search: "HN",
          page: 1,
          pageSize: 20,
          filters: '{"status":["APPROVED"]}',
        },
      },
    );
    expect(result).toEqual({
      items: [{ label: "HN", value: "b-1" }],
      total: 1,
      next: null,
    });
  });
});

describe("bộ lọc procurement trong query API", () => {
  const base: V2TableQuery = {
    page: 1,
    pageSize: 20,
    sorts: [],
    columnFilters: {},
    columnSearch: {},
    columnOperators: {},
    dateRanges: {},
  };

  it("gửi status và deleted=only khi có bộ lọc", () => {
    const params = toProcurementListParams({
      ...base,
      status: "APPROVED",
      deleted: "only",
    });

    expect(params.status).toBe("APPROVED");
    expect(params.deleted).toBe("only");
  });

  it("không gửi status rỗng và bỏ qua deleted khi không lọc", () => {
    const params = toProcurementListParams({ ...base, status: "" });

    expect(params.status).toBeUndefined();
    expect(params.deleted).toBeUndefined();
  });

  it("withProcurementFilter chuyển deleted xuống hàm gợi ý cột", async () => {
    const options = vi
      .fn()
      .mockResolvedValue({ items: [], total: 0, next: null });
    const wrapped = withProcurementFilter(options, { deleted: "only" });

    await wrapped?.({ columnKey: "requestNo", search: "", pageParam: 1 });

    expect(options).toHaveBeenCalledWith(
      expect.objectContaining({ columnKey: "requestNo", deleted: "only" }),
    );
  });

  it("withProcurementFilter trả undefined khi không có hàm options", () => {
    expect(withProcurementFilter(undefined, {})).toBeUndefined();
  });
});
