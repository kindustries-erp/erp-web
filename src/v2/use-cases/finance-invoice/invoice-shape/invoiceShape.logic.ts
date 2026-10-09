import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { filterClientItems } from "@/v2/shared/components/organisms/v2-standard-table/v2TableFilter";
import { sortClientItems } from "@/v2/shared/components/organisms/v2-standard-table/v2TableClient";
import type { V2ClientFilterColumn } from "@/v2/shared/components/organisms/v2-standard-table/v2TableFilter";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { toV2OffsetPage } from "@/v2/shared/utils/v2TableQueryParams";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import { makeInvoices } from "./invoiceShape.data";
import type {
  FakeInvoice,
  InvoiceDirection,
  TaxTab,
} from "./invoiceShape.data";

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

const ROWS: Record<InvoiceDirection, FakeInvoice[]> = {
  IN: makeInvoices("IN"),
  OUT: makeInvoices("OUT"),
};

export const findInvoice = (id: string): FakeInvoice | undefined =>
  [...ROWS.IN, ...ROWS.OUT].find((row) => row.id === id);

/** Hook giả có độ trễ để thấy trạng thái tải; có `refetch` cho nút Làm mới */
export function useFakeInvoices(
  direction: InvoiceDirection,
  taxTab: TaxTab,
  query: V2TableQuery,
): V2ModuleListData<FakeInvoice> {
  const result = useQuery({
    queryKey: ["invoice-shape", direction, taxTab, query],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return queryInvoices(ROWS[direction], query, taxTab);
    },
    placeholderData: keepPreviousData,
  });
  return {
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
    summaries: result.data?.summaries,
  };
}
