import { useMemo, useCallback } from "react";
import { type TFunction } from "i18next";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoicesList } from "@/modules/erp-invoices-core/hooks/useErpInvoicesList";
import { useGeneralColumns } from "./columns/generalColumns";
import { useTaxColumns } from "./columns/taxColumns";
import { useAmountColumns } from "./columns/amountColumns";

export interface UseInvoiceColumnsOptions {
  direction: "IN" | "OUT";
  t: TFunction<any, any>;
  branches: Array<{ value: string; label: string }>;
  listHook: ReturnType<typeof useErpInvoicesList>;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  setPreviewPdf: (
    pdf: {
      url: string;
      filename: string;
      fileKey: string;
      invoiceId: string;
      isAttachment?: boolean;
    } | null,
  ) => void;
  setSelectedPartner: (
    partner: { taxCode: string; partnerName: string } | null,
  ) => void;
  setPartnerDrawerOpen: (open: boolean) => void;
  handleOpenInternal: (
    inv: { id: string; invoiceNo?: string | null; serialNo?: string | null },
    mode?: "view" | "edit",
  ) => void;
  handleDownload: (id: string, type: "pdf" | "xml") => Promise<void>;
  handlePreviewPdf: (
    id: string,
    key: string,
    filename: string,
  ) => Promise<void>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  handleSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  handleSearchChange: (key: string, val: string) => void;
  handleFilterChange: (key: string, vals: string[]) => void;
  fetchInvoiceOptions: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{ items: any[]; total: number; next: number | null }>;
}

export function useInvoiceColumns(
  options: UseInvoiceColumnsOptions,
): DataTableColumn<ErpInvoice>[] {
  const { direction, setSelectedPartner, setPartnerDrawerOpen } = options;

  const onSelectPartner = useCallback(
    (partner: { taxCode: string; partnerName: string }) => {
      setSelectedPartner(partner);
      setPartnerDrawerOpen(true);
    },
    [setSelectedPartner, setPartnerDrawerOpen],
  );

  const general = useGeneralColumns({
    ...options,
    onSelectPartner,
  });

  const tax = useTaxColumns(options);
  const amount = useAmountColumns(options);

  return useMemo(() => {
    return [
      general.invoiceDate,
      general.invoiceNo,
      general.partner,
      tax.taxInvoiceType,
      amount.description,
      amount.preVatAmount,
      amount.vatAmount,
      amount.totalAmount,
      amount.discountAmount,
      amount.vatRate,
      tax.taxInvoiceStatus,
      tax.taxProcessStatus,
      ...(direction === "OUT" ? amount.outboundCols : []),
      amount.netOffAmount,
      amount.remainingAmount,
      amount.postingStatus,
      ...(direction === "IN" ? tax.inboundCols : []),
      general.branchId,
      general.invoiceCategory,
      general.attachments,
      general.notes,
    ];
  }, [general, tax, amount, direction]);
}
