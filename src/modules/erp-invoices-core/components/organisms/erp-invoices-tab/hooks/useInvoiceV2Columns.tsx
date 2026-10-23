import { useMemo } from "react";
import type { V2Column } from "@/v2/shared/components";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  buildInvoiceColumns,
  type InvoiceView,
} from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-table/invoiceShape.columns";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

export interface UseInvoiceV2ColumnsProps {
  direction: "IN" | "OUT";
  view?: InvoiceView;
  handleOpenInternal: (inv: any, mode?: "view" | "edit", tab?: string) => void;
  invoices: ErpInvoice[];
}

export function useInvoiceV2Columns({
  direction,
  view = "overview",
  handleOpenInternal,
  invoices,
}: UseInvoiceV2ColumnsProps): V2Column<FakeInvoice>[] {
  return useMemo(() => {
    const onOpen = (id: string) => {
      const inv = invoices.find((item) => item.id === id) || { id };
      handleOpenInternal(inv, "view");
    };

    return buildInvoiceColumns(view, onOpen, direction);
  }, [direction, view, handleOpenInternal, invoices]);
}
