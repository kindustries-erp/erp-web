import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { InvoiceDebt } from "../../domain/entities/invoiceDebt";
import { invoiceDebtsV2Api } from "../invoiceDebtsApi";
import { invoiceDebtsKeys } from "./invoiceDebtsKeys";

export function useInvoiceDebtsQuery(
  query: V2TableQuery,
  onError?: (error: unknown) => void,
): V2ModuleListData<InvoiceDebt> {
  const result = useQuery({
    queryKey: invoiceDebtsKeys.list(query),
    queryFn: () => invoiceDebtsV2Api.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // Lỗi tải danh sách hiện toast (useQuery v5 không còn onError)
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: (result.data?.items ?? []) as InvoiceDebt[],
    total: result.data?.total ?? 0,
    summaries: result.data?.summaries,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
