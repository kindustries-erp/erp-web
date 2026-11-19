import { beforeEach, describe, expect, it, vi } from "vitest";
import { garageStockApi, toGarageVoucherListParams } from "./garageStockApi";

const get = vi.hoisted(() => vi.fn());
vi.mock("@/v2/shared/api/v2HttpClient", () => ({ v2HttpClient: { get } }));

const query = (over = {}) => ({
  page: 2,
  pageSize: 10,
  sorts: [{ columnKey: "voucherDate", direction: "desc" as const }],
  columnFilters: { status: ["POSTED"] },
  columnSearch: { voucherNo: "x" },
  columnOperators: {},
  dateRanges: { voucherDate: { from: "2026-01-01", to: "2026-01-31" } },
  search: " PN ",
  summaryKeys: ["totalAmount"],
  ...over,
});

describe("garageStockApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("chỉ gửi tham số API hỗ trợ và đổi khoảng ngày", () => {
    const params = toGarageVoucherListParams(query() as never, "ISSUE");
    expect(params).toMatchObject({
      page: 2,
      search: "PN",
      sort: "-voucherDate",
      type: "ISSUE",
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
      column_filters: '{"status":["POSTED"]}',
      summary_keys: "totalAmount",
    });
    expect(params).not.toHaveProperty("column_search");
  });

  it("đọc danh sách và chi tiết theo loại phiếu", async () => {
    get.mockResolvedValueOnce({
      data: { items: [{ id: "1" }], pagination: { total: 1 }, summaries: {} },
    });
    const result = await garageStockApi.listVouchers(query() as never);
    expect(result.total).toBe(1);

    get.mockResolvedValueOnce({ data: { data: { id: "9", lines: [] } } });
    await garageStockApi.getVoucher("ISSUE", "9");
    expect(get).toHaveBeenLastCalledWith(
      "/api/v2/inventory-movements-garage-issues/9",
    );
    await expect(
      garageStockApi.getVoucher("PURCHASE_RECEIPT", "1"),
    ).rejects.toThrow();
  });

  it("gửi column_filters và column_operators khi đọc danh sách tồn kho", async () => {
    get.mockResolvedValueOnce({
      data: {
        items: [{ id: "b1", itemCode: "A" }],
        pagination: { total: 1 },
        summaries: {},
        extraData: { tabCounts: {} },
      },
    });

    const q = query({
      columnFilters: { unit: ["Cái"] },
      columnOperators: { qtyOnHand: { operator: "gt", value: "0" } },
    });
    await garageStockApi.listBalances(q as never, "ALL");

    expect(get).toHaveBeenCalledWith(
      "/api/v2/inventory-movements-garage-ledger/balances",
      expect.objectContaining({
        params: expect.objectContaining({
          column_filters: '{"unit":["Cái"]}',
          column_operators: '{"qtyOnHand":{"operator":"gt","value":"0"}}',
        }),
      }),
    );
  });

  it("gọi balanceOptions lấy gợi ý cột", async () => {
    get.mockResolvedValueOnce({
      data: {
        items: [{ label: "Cái", value: "Cái" }],
        pagination: { total: 1, totalPages: 1 },
      },
    });

    const res = await garageStockApi.balanceOptions!({
      columnKey: "unit",
      search: "C",
      pageParam: 1,
    });

    expect(get).toHaveBeenCalledWith(
      "/api/v2/inventory-movements-garage-ledger/column-options",
      expect.objectContaining({
        params: expect.objectContaining({
          column: "unit",
          search: "C",
          page: 1,
        }),
      }),
    );
    expect(res.items).toEqual([{ label: "Cái", value: "Cái" }]);
  });
});
