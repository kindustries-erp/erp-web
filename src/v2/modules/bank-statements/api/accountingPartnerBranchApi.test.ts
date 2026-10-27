import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/v2/shared/api/v2HttpClient", () => ({
  v2HttpClient: { get },
  V2_API_BASE_URL: "http://test",
}));

import { accountingLookupApi } from "./accountingLookupApi";
import { branchOptionsApi } from "./branchOptionsApi";
import { partnerStatsApi } from "./partnerStatsApi";

describe("accountingLookupApi", () => {
  beforeEach(() => get.mockReset());

  it("chuẩn hóa danh sách TK về mảng khi API trả mảng hoặc { items }", async () => {
    get.mockResolvedValueOnce({
      data: [{ id: "a", accountCode: "1111", accountName: "Quỹ" }],
    });
    expect(await accountingLookupApi.listChartOfAccounts()).toHaveLength(1);

    get.mockResolvedValueOnce({
      data: {
        items: [{ id: "b", accountCode: "131", accountName: "Phải thu" }],
      },
    });
    expect((await accountingLookupApi.listChartOfAccounts())[0].id).toBe("b");
  });

  it("đọc bút toán theo id", async () => {
    get.mockResolvedValue({ data: { id: "j1", lines: [] } });
    await accountingLookupApi.getJournalEntry("j1");
    expect(get).toHaveBeenCalledWith(
      "/api/v1/accounting-core/journal-entries/j1",
    );
  });
});

describe("partnerStatsApi", () => {
  beforeEach(() => get.mockReset());

  it("thống kê đối tác bỏ tham số rỗng", async () => {
    get.mockResolvedValue({ data: {} });
    await partnerStatsApi.getDashboardStats({
      correspondentAccount: "",
      correspondentName: "ACME",
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/bank-transactions-core/dashboard-stats",
      {
        params: { correspondentName: "ACME" },
      },
    );
  });

  it("lọc cột gửi đúng tên tham số column_filters", async () => {
    get.mockResolvedValue({
      data: { items: [], total: 0, page: 1, totalPages: 1 },
    });
    await partnerStatsApi.getColumnOptions({
      column: "branch",
      search: "",
      page: 1,
      pageSize: 20,
      columnFilters: '{"x":1}',
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v1/bank-transactions-core/transactions/column-options",
      {
        params: {
          column: "branch",
          page: 1,
          pageSize: 20,
          column_filters: '{"x":1}',
        },
      },
    );
  });
});

describe("branchOptionsApi", () => {
  beforeEach(() => get.mockReset());

  it("đọc chi nhánh từ items hoặc data và ghép nhãn mã — tên", async () => {
    get.mockResolvedValueOnce({
      data: { items: [{ id: "b1", code: "HN", name: "Hà Nội" }] },
    });
    expect(await branchOptionsApi.listBranchOptions()).toEqual([
      { value: "b1", label: "HN — Hà Nội" },
    ]);
    get.mockResolvedValueOnce({
      data: { data: [{ id: "b2", code: "SG", name: "Sài Gòn" }] },
    });
    expect((await branchOptionsApi.listBranchOptions())[0].value).toBe("b2");
  });
});
