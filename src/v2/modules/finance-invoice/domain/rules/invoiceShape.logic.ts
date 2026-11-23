import {
  filterClientItems,
  sortClientItems,
  type V2ClientFilterColumn,
} from "@/v2/shared/components";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2SummaryMetric, V2TableQuery } from "@/v2/shared/types/v2-table";
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

/** Cột số có thể tổng trong chế độ mẫu; key lạ trả `null` như API thật */
const SAMPLE_SUMMARY_READERS: Record<string, (row: FakeInvoice) => number> = {
  preVat: (row) => row.preVat,
  vat: (row) => row.vat,
  total: (row) => row.total,
  paid: (row) => row.paid,
  remaining: (row) => row.total - row.paid,
};

const sumBy = (
  rows: FakeInvoice[],
  read: (row: FakeInvoice) => number,
): number => rows.reduce((sum, row) => sum + read(row), 0);

/** Đúng hợp đồng `summaries` của API: total, pageSubtotal, cumulative theo từng key */
const toSampleSummaries = (
  filtered: FakeInvoice[],
  pageRows: FakeInvoice[],
  keys: string[],
  cumulativeEnd: number,
): Record<string, V2SummaryMetric | null> =>
  Object.fromEntries(
    keys.map((key) => {
      const read = SAMPLE_SUMMARY_READERS[key];
      if (!read) return [key, null];
      return [
        key,
        {
          total: sumBy(filtered, read),
          pageSubtotal: sumBy(pageRows, read),
          cumulative: sumBy(filtered.slice(0, cumulativeEnd), read),
        },
      ];
    }),
  );

/**
 * Logic nghiệp vụ giả: nhận query của V2 và trả đúng một trang kèm tổng theo `summaryKeys`.
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
  const items = filtered.slice(offset, offset + limit);
  return {
    items,
    total: filtered.length,
    summaries: toSampleSummaries(
      filtered,
      items,
      query.summaryKeys ?? [],
      offset + limit,
    ),
  };
};

export const INVOICE_ROWS: Record<InvoiceDirection, FakeInvoice[]> = {
  IN: makeInvoices("IN"),
  OUT: makeInvoices("OUT"),
};

export const findInvoice = (id: string): FakeInvoice | undefined =>
  [...INVOICE_ROWS.IN, ...INVOICE_ROWS.OUT].find((row) => row.id === id);
