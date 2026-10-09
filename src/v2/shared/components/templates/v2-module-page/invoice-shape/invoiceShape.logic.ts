import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  getV2ColumnFilterValues,
  getV2DateRange,
  getV2PrimarySort,
  toV2OffsetPage,
} from "@/v2/shared/utils/v2TableQueryParams";
import { normalizeSearchText } from "@/v2/shared/components/molecules/v2-combobox";
import type { V2ModuleListData } from "../V2ModulePage.type";
import { makeInvoices } from "./invoiceShape.data";
import type {
  FakeInvoice,
  InvoiceDirection,
  TaxTab,
} from "./invoiceShape.data";

const SORTABLE: Record<string, (row: FakeInvoice) => string | number> = {
  invoiceNo: (r) => Number(r.invoiceNo),
  invoiceDate: (r) => r.invoiceDate,
  partner: (r) => r.partner,
  total: (r) => r.total,
};

/**
 * Logic nghiệp vụ giả: nhận query của V2 và trả đúng một trang kèm tổng toàn bộ.
 * Hàm thuần nên test được mà không cần React; module thật thay bằng lời gọi API.
 */
export const queryInvoices = (
  rows: FakeInvoice[],
  query: V2TableQuery,
  taxTab: TaxTab,
) => {
  const needle = normalizeSearchText(query.search ?? "");
  const posting = getV2ColumnFilterValues(query, "posting");
  const branch = getV2ColumnFilterValues(query, "branchId");
  const range = getV2DateRange(query, "invoiceDate");
  const partnerText = normalizeSearchText(query.columnSearch.partner ?? "");

  let filtered = rows.filter(
    (row) =>
      (taxTab === "all" || row.taxTab === taxTab) &&
      (!needle ||
        normalizeSearchText(
          `${row.invoiceNo} ${row.partner} ${row.taxCode}`,
        ).includes(needle)) &&
      (posting.length === 0 || posting.includes(row.posting)) &&
      (branch.length === 0 || branch.includes(row.branchId)) &&
      (!range.from || row.invoiceDate >= range.from) &&
      (!range.to || row.invoiceDate <= range.to) &&
      (!partnerText || normalizeSearchText(row.partner).includes(partnerText)),
  );

  const sort = getV2PrimarySort(query);
  const key = sort ? SORTABLE[sort.field] : undefined;
  if (sort && key) {
    const dir = sort.order === "desc" ? -1 : 1;
    filtered = [...filtered].sort((a, b) =>
      key(a) > key(b) ? dir : key(a) < key(b) ? -dir : 0,
    );
  }

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
