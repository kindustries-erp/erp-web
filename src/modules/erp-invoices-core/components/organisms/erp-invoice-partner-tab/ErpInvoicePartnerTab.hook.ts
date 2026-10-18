import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { invoiceDebtsApi } from "@/modules/accounting/api/invoiceDebtsApi";
import { DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import type { InvoiceDetailViewMode } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import type { ErpInvoicePartnerTabProps } from "./ErpInvoicePartnerTab.type";
import type { PartnerSubTabMode } from "./ErpInvoicePartnerTabNav";
import { normalizeInvoiceDocuments } from "../invoice-document-workspace/InvoiceDocumentWorkspace.helper";

export function useErpInvoicePartnerTab({
  detailInvoice,
  direction,
  defaultViewMode,
  onViewModeChange,
  form,
}: ErpInvoicePartnerTabProps) {
  const [previewSubInvoice, setPreviewSubInvoice] = useState<ErpInvoice | null>(
    null,
  );

  const isUrlLinesTab = useMemo(() => {
    if (typeof window === "undefined") return false;
    const s = window.location.search;
    return (
      s.includes("tab=in-lines") ||
      s.includes("tab=out-lines") ||
      s.includes("view=lines")
    );
  }, []);

  const [viewMode, setViewMode] = useState<PartnerSubTabMode>(() => {
    if (defaultViewMode) return defaultViewMode;
    return isUrlLinesTab ? "lines" : "details";
  });

  const handleViewModeChange = useCallback(
    (mode: PartnerSubTabMode) => {
      setViewMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const hasPdf = Boolean(
    detailInvoice?.pdfFileKey ||
    (detailInvoice?.pdfFiles && detailInvoice.pdfFiles.length > 0) ||
    (detailInvoice?.attachments &&
      detailInvoice.attachments.some(
        (a: any) =>
          a.attachment?.mimeType === "application/pdf" ||
          a.attachment?.fileName?.toLowerCase().endsWith(".pdf") ||
          a.attachment?.fileKey?.toLowerCase().endsWith(".pdf"),
      )),
  );

  const attachmentCount = useMemo(() => {
    return normalizeInvoiceDocuments(
      detailInvoice,
      form?.pendingAddedAttachments || [],
      form?.pendingDeletedPdfs || [],
    ).length;
  }, [detailInvoice, form?.pendingAddedAttachments, form?.pendingDeletedPdfs]);

  const [detailViewMode, setDetailViewMode] =
    useState<InvoiceDetailViewMode>("template");

  const isDirectionIn = (direction || detailInvoice?.direction) === "IN";
  const partnerName =
    (isDirectionIn
      ? detailInvoice?.sellerName
      : detailInvoice?.buyerName || detailInvoice?.buyerPersonalName
    )?.trim() || "";

  const taxCode =
    (isDirectionIn
      ? detailInvoice?.sellerTaxCode
      : detailInvoice?.buyerTaxCode || detailInvoice?.buyerCccd
    )?.trim() || "";

  const hasPartnerInfo = Boolean(taxCode || partnerName);

  const partnerType: "SUPPLIER" | "CUSTOMER" = isDirectionIn
    ? "SUPPLIER"
    : "CUSTOMER";
  const { data: debtInvoices = [], isLoading: isLoadingDebtInvoices } =
    useQuery({
      queryKey: ["invoice-partner-invoices", partnerType, taxCode, partnerName],
      queryFn: () => {
        if (!hasPartnerInfo) return Promise.resolve([]);
        return invoiceDebtsApi.getPartnerInvoices(taxCode || "KHONG_MST", {
          partner_type: partnerType,
          partner_name: partnerName || undefined,
        });
      },
      enabled: hasPartnerInfo,
      staleTime: DEFAULT_STALE_TIME,
    });

  return {
    viewMode,
    handleViewModeChange,
    detailViewMode,
    setDetailViewMode,
    hasPdf,
    attachmentCount,
    isDirectionIn,
    partnerName,
    taxCode,
    hasPartnerInfo,
    partnerType,
    debtInvoices,
    isLoadingDebtInvoices,
    previewSubInvoice,
    setPreviewSubInvoice,
  };
}
