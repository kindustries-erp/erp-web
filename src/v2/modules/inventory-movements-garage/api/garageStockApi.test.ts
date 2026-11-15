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
});
