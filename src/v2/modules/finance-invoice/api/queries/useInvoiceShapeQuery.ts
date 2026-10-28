import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { V2ModuleListData } from "@/v2/shared/components";
import type {
  FakeInvoice,
  InvoiceDirection,
  TaxTab,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import {
  INVOICE_ROWS,
  queryInvoices,
} from "@/v2/modules/finance-invoice/domain/rules/invoiceShape.logic";
import { v2InvoiceQueryToParams } from "../adapters/invoiceQueryAdapter";
import { financeInvoiceV2Api } from "../financeInvoiceV2Api";
import { isInvoiceSampleMode } from "../sampleMode";
import {
  invoiceTotalsToSummary,
  toInvoiceRow,
} from "../adapters/invoiceRowAdapter";

const useSampleMode = isInvoiceSampleMode;

export function useInvoiceList(
  direction: InvoiceDirection,
  taxTab: TaxTab,
  query: V2TableQuery,
  onError?: (error: unknown) => void,
): V2ModuleListData<FakeInvoice> {
  const sampleMode = useSampleMode();
  const params = React.useMemo(
    () => v2InvoiceQueryToParams(direction, taxTab, query),
    [direction, taxTab, query],
  );

  const result = useQuery({
    queryKey: ["finance-invoices", direction, taxTab, query, sampleMode],
    queryFn: async () => {
      if (sampleMode) {
        return queryInvoices(INVOICE_ROWS[direction], query, taxTab);
      }
      const res = await financeInvoiceV2Api.list(params);
      return {
        items: res.items.map((inv) => toInvoiceRow(inv, direction)),
        total: res.total,
        summaries: res.totals && invoiceTotalsToSummary(res.totals),
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
    summaries: result.data?.summaries,
  };
}
