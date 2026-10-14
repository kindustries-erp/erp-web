import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type {
  FakeInvoice,
  InvoiceDirection,
  TaxTab,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import {
  INVOICE_ROWS,
  queryInvoices,
} from "@/v2/modules/finance-invoice/domain/rules/invoiceShape.logic";

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
      return queryInvoices(INVOICE_ROWS[direction], query, taxTab);
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
