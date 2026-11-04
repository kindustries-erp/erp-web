import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { PurchaseOrderApi } from "@/v2/core/purchase-orders";
import type {
  GaragePurchaseOrderColumnOptionsDto,
  GaragePurchaseOrderEnvelopeDto,
  GaragePurchaseOrderListResultDto,
  GaragePurchaseOrderNextNoDto,
  GaragePurchaseOrderPayloadDto,
} from "./dtos/garagePurchaseOrder.dto";
import type {
  GaragePurchaseOrder,
  GaragePurchaseOrderFormValue,
} from "../domain/entities/garagePurchaseOrder";

const BASE = "/api/v2/garage-purchase-orders";
const OPTIONS_PAGE_SIZE = 20;

const trimOrNull = (value: string): string | null => value.trim() || null;

/** Chuyển query bảng V2 sang tham số danh sách của API (sort dạng `a,-b`) */
export const toGaragePurchaseOrdersListParams = (query: V2TableQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sort: query.sorts.length
    ? query.sorts
        .map((sort) =>
          sort.direction === "desc" ? `-${sort.columnKey}` : sort.columnKey,
        )
        .join(",")
    : undefined,
  column_filters: Object.keys(query.columnFilters).length
    ? JSON.stringify(query.columnFilters)
    : undefined,
  column_search: Object.keys(query.columnSearch).length
    ? JSON.stringify(query.columnSearch)
    : undefined,
  column_operators: Object.keys(query.columnOperators).length
    ? JSON.stringify(query.columnOperators)
    : undefined,
  date_ranges: Object.keys(query.dateRanges).length
    ? JSON.stringify(query.dateRanges)
    : undefined,
});

/**
 * Chuyển form sang payload API. Chỉ gửi trường API nhận; chuỗi rỗng ở ô tùy chọn
 * thành null để xóa giá trị cũ khi sửa. `poNo` chỉ gửi khi tạo mới.
 */
export const toGaragePurchaseOrderPayload = (
  form: GaragePurchaseOrderFormValue,
  { includePoNo }: { includePoNo: boolean },
): GaragePurchaseOrderPayloadDto => ({
  ...(includePoNo && form.poNo.trim() ? { poNo: form.poNo.trim() } : {}),
  orderDate: form.orderDate.trim(),
  expectedDate: trimOrNull(form.expectedDate),
  remarks: trimOrNull(form.remarks),
  supplierInvoiceNo: trimOrNull(form.supplierInvoiceNo),
  branchName: trimOrNull(form.branchName),
  supplierName: trimOrNull(form.supplierName),
  lines: form.lines.map((line) => ({
    itemCode: line.itemCode.trim() || undefined,
    itemName: line.itemName.trim() || undefined,
    description: line.description.trim() || undefined,
    qtyOrdered: line.qtyOrdered.trim() || "0",
    unitPrice: line.unitPrice.trim() || "0",
  })),
});

export const garagePurchaseOrdersV2Api: PurchaseOrderApi = {
  list: async (query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<GaragePurchaseOrderListResultDto>(
      BASE,
      { params: toGaragePurchaseOrdersListParams(query) },
    );
    return data;
  },
  options: async (params: V2FetchOptionsParams) => {
    const { data } =
      await v2HttpClient.get<GaragePurchaseOrderColumnOptionsDto>(
        `${BASE}/column-options`,
        {
          params: {
            column: params.columnKey,
            option_search: params.search,
            page: params.pageParam,
            pageSize: OPTIONS_PAGE_SIZE,
            column_filters: params.filtersStr,
          },
        },
      );
    return data;
  },
  get: async (id: string): Promise<GaragePurchaseOrder> => {
    const { data } = await v2HttpClient.get<GaragePurchaseOrderEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  nextNo: async () => {
    const { data } = await v2HttpClient.get<GaragePurchaseOrderNextNoDto>(
      `${BASE}/next-no`,
    );
    return data;
  },
  create: async (form: GaragePurchaseOrderFormValue) => {
    const { data } = await v2HttpClient.post<GaragePurchaseOrderEnvelopeDto>(
      BASE,
      toGaragePurchaseOrderPayload(form, { includePoNo: true }),
    );
    return data.data;
  },
  update: async (id: string, form: GaragePurchaseOrderFormValue) => {
    const { data } = await v2HttpClient.patch<GaragePurchaseOrderEnvelopeDto>(
      `${BASE}/${id}`,
      toGaragePurchaseOrderPayload(form, { includePoNo: false }),
    );
    return data.data;
  },
  approve: async (id: string) => {
    const { data } = await v2HttpClient.post<GaragePurchaseOrderEnvelopeDto>(
      `${BASE}/${id}/approve`,
    );
    return data.data;
  },
  confirm: async (id: string) => {
    const { data } = await v2HttpClient.post<GaragePurchaseOrderEnvelopeDto>(
      `${BASE}/${id}/confirm`,
    );
    return data.data;
  },
  cancel: async (id: string) => {
    const { data } = await v2HttpClient.post<GaragePurchaseOrderEnvelopeDto>(
      `${BASE}/${id}/cancel`,
    );
    return data.data;
  },
  remove: async (id: string) => {
    const { data } = await v2HttpClient.delete<GaragePurchaseOrderEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
};
