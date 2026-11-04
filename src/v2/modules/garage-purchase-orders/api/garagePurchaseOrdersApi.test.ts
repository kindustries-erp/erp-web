import { afterEach, describe, expect, it, vi } from "vitest";
import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { TableSortState, type V2TableQuery } from "@/v2/shared/types/v2-table";
import type { GaragePurchaseOrderFormValue } from "../domain/entities/garagePurchaseOrder";
import {
  garagePurchaseOrdersV2Api,
  toGaragePurchaseOrderPayload,
  toGaragePurchaseOrdersListParams,
} from "./garagePurchaseOrdersApi";

const baseQuery = (over: Partial<V2TableQuery> = {}): V2TableQuery =>
  ({
    page: 1,
    pageSize: 20,
    search: "",
    sorts: [],
    columnFilters: {},
    columnSearch: {},
    columnOperators: {},
    dateRanges: {},
    ...over,
  }) as V2TableQuery;

const form = (
  over: Partial<GaragePurchaseOrderFormValue> = {},
): GaragePurchaseOrderFormValue =>
  ({
    poNo: " GPO-20261104-001 ",
    orderDate: "2026-11-04",
    expectedDate: "",
    supplierName: " NCC A ",
    branchName: "",
    supplierInvoiceNo: "",
    remarks: "ghi chú",
    status: "DRAFT",
    paymentStatus: "UNPAID",
    totalAmount: "0",
    lines: [
      {
        clientKey: "k1",
        itemCode: " VT-1 ",
        itemName: "Phụ tùng",
        description: "",
        qtyOrdered: "2",
        qtyReceived: "0",
        unitPrice: "100",
        amount: "200",
      },
    ],
    ...over,
  }) as GaragePurchaseOrderFormValue;

describe("toGaragePurchaseOrdersListParams", () => {
  it("ghép sắp xếp nhiều cột: giảm dần có dấu '-'", () => {
    const params = toGaragePurchaseOrdersListParams(
      baseQuery({
        sorts: [
          { columnKey: "orderDate", direction: TableSortState.DESC },
          { columnKey: "poNo", direction: TableSortState.ASC },
        ],
      }),
    );
    expect(params.sort).toBe("-orderDate,poNo");
  });

  it("bỏ trống các tham số không dùng", () => {
    const params = toGaragePurchaseOrdersListParams(baseQuery());
    expect(params.search).toBeUndefined();
    expect(params.sort).toBeUndefined();
    expect(params.column_filters).toBeUndefined();
  });
});

describe("toGaragePurchaseOrderPayload", () => {
  it("không gửi branchId, supplierId, status, amount", () => {
    const payload = toGaragePurchaseOrderPayload(form(), { includePoNo: true });
    const keys = Object.keys(payload);
    for (const banned of [
      "branchId",
      "supplierId",
      "status",
      "amount",
      "createdBy",
    ]) {
      expect(keys).not.toContain(banned);
    }
    expect(payload.lines[0]).not.toHaveProperty("amount");
  });

  it("gửi poNo khi tạo và bỏ poNo khi sửa", () => {
    expect(
      toGaragePurchaseOrderPayload(form(), { includePoNo: true }).poNo,
    ).toBe("GPO-20261104-001");
    expect(
      toGaragePurchaseOrderPayload(form(), { includePoNo: false }),
    ).not.toHaveProperty("poNo");
  });

  it("chuỗi rỗng ở ô tùy chọn thành null, số lượng và đơn giá là chuỗi số", () => {
    const payload = toGaragePurchaseOrderPayload(form(), { includePoNo: true });
    expect(payload.expectedDate).toBeNull();
    expect(payload.branchName).toBeNull();
    expect(payload.supplierName).toBe("NCC A");
    expect(payload.lines[0]).toEqual({
      itemCode: "VT-1",
      itemName: "Phụ tùng",
      description: undefined,
      qtyOrdered: "2",
      unitPrice: "100",
    });
  });
});

describe("garagePurchaseOrdersV2Api", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lấy danh sách từ route v2 của PO garage", async () => {
    const get = vi
      .spyOn(v2HttpClient, "get")
      .mockResolvedValue({ data: { items: [], total: 0 } });
    await garagePurchaseOrdersV2Api.list(baseQuery());
    expect(get).toHaveBeenCalledWith(
      "/api/v2/garage-purchase-orders",
      expect.objectContaining({ params: expect.any(Object) }),
    );
  });

  it("gợi ý giá trị cột dùng option_search và column_filters", async () => {
    const get = vi
      .spyOn(v2HttpClient, "get")
      .mockResolvedValue({ data: { items: [], total: 0, next: null } });
    await garagePurchaseOrdersV2Api.options({
      columnKey: "branchName",
      search: "abc",
      pageParam: 2,
      filtersStr: '{"status":["DRAFT"]}',
    });
    expect(get).toHaveBeenCalledWith(
      "/api/v2/garage-purchase-orders/column-options",
      {
        params: {
          column: "branchName",
          option_search: "abc",
          page: 2,
          pageSize: 20,
          column_filters: '{"status":["DRAFT"]}',
        },
      },
    );
  });

  it("bóc data của bản ghi khi tạo và gọi next-no", async () => {
    const post = vi
      .spyOn(v2HttpClient, "post")
      .mockResolvedValue({ data: { message: "ok", data: { id: "1" } } });
    const created = await garagePurchaseOrdersV2Api.create(form());
    expect(created).toEqual({ id: "1" });
    expect(post).toHaveBeenCalledWith(
      "/api/v2/garage-purchase-orders",
      expect.objectContaining({ poNo: "GPO-20261104-001" }),
    );

    const get = vi
      .spyOn(v2HttpClient, "get")
      .mockResolvedValue({ data: { nextNo: "GPO-20261104-002" } });
    expect(await garagePurchaseOrdersV2Api.nextNo()).toEqual({
      nextNo: "GPO-20261104-002",
    });
    expect(get).toHaveBeenCalledWith("/api/v2/garage-purchase-orders/next-no");
  });

  it("hành động duyệt, xác nhận, hủy gọi đúng endpoint", async () => {
    const post = vi
      .spyOn(v2HttpClient, "post")
      .mockResolvedValue({ data: { data: { id: "9" } } });
    await garagePurchaseOrdersV2Api.approve("9");
    await garagePurchaseOrdersV2Api.confirm("9");
    await garagePurchaseOrdersV2Api.cancel("9");
    expect(post.mock.calls.map((c) => c[0])).toEqual([
      "/api/v2/garage-purchase-orders/9/approve",
      "/api/v2/garage-purchase-orders/9/confirm",
      "/api/v2/garage-purchase-orders/9/cancel",
    ]);
  });
});
