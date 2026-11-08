import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import { GOODS_RECEIPT_DEFAULT_UNIT } from "@/v2/core/goods-receipts";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  GarageGoodsReceipt,
  GarageGoodsReceiptFormValue,
} from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import type {
  GarageGoodsReceiptEnvelopeDto,
  GarageGoodsReceiptListResultDto,
  GarageGoodsReceiptPayloadDto,
  ColumnOptionsResultDto,
  NextCodeDto,
} from "./dtos/garageGoodsReceipt.dto";

const BASE = "/api/v1/garage-goods-receipts";
const OPTIONS_PAGE_SIZE = 20;

export const toGarageGoodsReceiptsListParams = (query: V2TableQuery) => ({
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

export const toGarageGoodsReceiptPayload = (
  form: GarageGoodsReceiptFormValue,
): GarageGoodsReceiptPayloadDto => ({
  receiptNo: form.receiptNo.trim() || undefined,
  receiptDate: form.receiptDate.trim(),
  supplierId: form.supplierId.trim() || undefined,
  supplierName: form.supplierName.trim() || undefined,
  // Chi nhánh tùy chọn: rỗng gửi null để cập nhật xóa được chi nhánh cũ
  branchId: form.branchId.trim() || null,
  branchName: form.branchName.trim() || null,
  totalAmount: form.totalAmount.trim() ? Number(form.totalAmount) : undefined,
  status: form.status,
  paymentStatus: form.paymentStatus,
  remarks: form.remarks.trim() || undefined,
  lines: form.lines.map((l) => ({
    id: l.id,
    itemCode: l.itemCode.trim() || undefined,
    itemName: l.itemName.trim(),
    unit: l.unit.trim() || GOODS_RECEIPT_DEFAULT_UNIT,
    qtyReceived: Number(l.qtyReceived || 0),
    unitCost: Number(l.unitCost || 0),
    amount: Number(l.amount || 0),
    notes: l.notes.trim() || undefined,
  })),
});

export const garageGoodsReceiptsV2Api = {
  list: async (query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<GarageGoodsReceiptListResultDto>(
      BASE,
      {
        params: toGarageGoodsReceiptsListParams(query),
      },
    );
    return data;
  },
  options: async (params: V2FetchOptionsParams) => {
    const { data } = await v2HttpClient.get<ColumnOptionsResultDto>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: OPTIONS_PAGE_SIZE,
          filters: params.filtersStr,
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<GarageGoodsReceipt> => {
    const { data } = await v2HttpClient.get<GarageGoodsReceiptEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data as GarageGoodsReceipt;
  },
  nextCode: async (date?: string) => {
    const { data } = await v2HttpClient.get<NextCodeDto>(`${BASE}/next-code`, {
      params: date ? { date } : undefined,
    });
    return data;
  },
  create: async (form: GarageGoodsReceiptFormValue) => {
    const { data } = await v2HttpClient.post<GarageGoodsReceiptEnvelopeDto>(
      BASE,
      toGarageGoodsReceiptPayload(form),
    );
    return data.data as GarageGoodsReceipt;
  },
  update: async (id: string, form: GarageGoodsReceiptFormValue) => {
    const { data } = await v2HttpClient.patch<GarageGoodsReceiptEnvelopeDto>(
      `${BASE}/${id}`,
      toGarageGoodsReceiptPayload(form),
    );
    return data.data as GarageGoodsReceipt;
  },
  post: async (id: string) => {
    const { data } = await v2HttpClient.post<GarageGoodsReceiptEnvelopeDto>(
      `${BASE}/${id}/post`,
    );
    return data.data as GarageGoodsReceipt;
  },
  cancel: async (id: string) => {
    const { data } = await v2HttpClient.post<GarageGoodsReceiptEnvelopeDto>(
      `${BASE}/${id}/cancel`,
    );
    return data.data as GarageGoodsReceipt;
  },
  remove: async (id: string) => {
    const { data } = await v2HttpClient.delete<GarageGoodsReceiptEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data as GarageGoodsReceipt;
  },
};
