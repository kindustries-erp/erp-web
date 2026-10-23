import {
  filterClientItems,
  sortClientItems,
  type V2ClientFilterColumn,
} from "@/v2/shared/components";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { toV2OffsetPage } from "@/v2/shared/utils/v2TableQueryParams";
import { makeInvoices } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import type {
  FakeInvoice,
  InvoiceDirection,
  TaxTab,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

/** Mỗi cột có header filter/sort đều khai báo ở đây, khớp `key` của cột trong `invoiceShape.columns.tsx` */
export const INVOICE_FILTER_COLUMNS: V2ClientFilterColumn<FakeInvoice>[] = [
  {
    key: "invoiceNo",
    valueType: ColumnValueType.TEXT,
    getValue: (r) => r.invoiceNo,
  },
  {
    key: "invoiceDate",
    valueType: ColumnValueType.DATE,
    getValue: (r) => r.invoiceDate,
  },
  {
    key: "partner",
    valueType: ColumnValueType.TEXT,
    getValue: (r) => r.partner,
  },
  {
    key: "branchId",
    valueType: ColumnValueType.SELECT,
    getValue: (r) => r.branchId,
  },
  { key: "total", valueType: ColumnValueType.NUMBER, getValue: (r) => r.total },
  {
    key: "posting",
    valueType: ColumnValueType.SELECT,
    getValue: (r) => r.posting,
  },
  { key: "paid", valueType: ColumnValueType.NUMBER, getValue: (r) => r.paid },
  {
    key: "remaining",
    valueType: ColumnValueType.NUMBER,
    getValue: (r) => r.total - r.paid,
  },
];

/**
 * Logic nghiệp vụ giả: nhận query của V2 và trả đúng một trang kèm tổng toàn bộ.
 * Lọc và sắp xếp theo từng cột dùng cùng helper với chế độ client của V2 table.
 * Hàm thuần nên test được mà không cần React; module thật thay bằng lời gọi API.
 */
export const queryInvoices = (
  rows: FakeInvoice[],
  query: V2TableQuery,
  taxTab: TaxTab,
) => {
  const inTab = rows.filter((row) => taxTab === "all" || row.taxTab === taxTab);
  const filtered = sortClientItems(
    filterClientItems(inTab, INVOICE_FILTER_COLUMNS, query),
    INVOICE_FILTER_COLUMNS,
    query.sorts,
  );

  const { limit, offset } = toV2OffsetPage(query);
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    summaries: { total: filtered.reduce((sum, row) => sum + row.total, 0) },
  };
};

export const INVOICE_ROWS: Record<InvoiceDirection, FakeInvoice[]> = {
  IN: makeInvoices("IN"),
  OUT: makeInvoices("OUT"),
};

export const findInvoice = (id: string): FakeInvoice | undefined =>
  [...INVOICE_ROWS.IN, ...INVOICE_ROWS.OUT].find((row) => row.id === id);
