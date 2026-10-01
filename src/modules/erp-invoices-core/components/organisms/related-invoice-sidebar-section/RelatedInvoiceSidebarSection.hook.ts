import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { openGlobalErpDocument } from "@/shared/components/drawer/DrawerDocumentTraceability/constants";
import { useInvoiceAdjustmentReconciliation } from "@/modules/erp-invoices-core/hooks/useInvoiceAdjustmentReconciliation";

export function useRelatedInvoiceSidebarSection({
  invoice,
  direction = "IN",
}: {
  invoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
}) {
  const { t } = useTranslation("erpInvoices");

  const taxStatus = invoice?.taxInvoiceStatus;
  const relatedInvNo = invoice?.relatedInvoiceNo;
  const relatedSerNo = invoice?.relatedSerialNo;

  const isAdjustmentOrReplacement =
    taxStatus === 2 || taxStatus === 3 || Boolean(relatedInvNo);
  const isOriginalAdjustedOrReplaced = taxStatus === 4 || taxStatus === 5;

  const {
    reconciliation,
    isLoading: loadingReconciliation,
    executeNetoff,
    isExecutingNetoff,
  } = useInvoiceAdjustmentReconciliation(invoice?.id, {
    enabled: Boolean(isAdjustmentOrReplacement || isOriginalAdjustedOrReplaced),
  });

  const { data: originalInvoiceRes, isLoading: loadingOriginal } = useQuery({
    queryKey: [
      "erp-invoice-original-by-no",
      relatedInvNo,
      relatedSerNo,
      invoice?.direction || direction,
    ],
    queryFn: async () => {
      if (!relatedInvNo) return null;
      const res = await erpInvoicesCoreApi.list({
        invoice_no: relatedInvNo,
        serial_no: relatedSerNo || undefined,
        direction: invoice?.direction || direction,
        pageSize: 1,
      });
      return res.items?.[0] || null;
    },
    enabled: Boolean(
      isAdjustmentOrReplacement &&
      relatedInvNo &&
      !reconciliation?.relatedInvoices?.[0]?.id,
    ),
    staleTime: 30000,
  });

  const { data: adjustingInvoicesRes, isLoading: loadingAdjusting } = useQuery({
    queryKey: [
      "erp-invoices-adjusting-by-no",
      invoice?.invoiceNo,
      invoice?.serialNo,
      invoice?.direction || direction,
    ],
    queryFn: async () => {
      if (!invoice?.invoiceNo) return [];
      const res = await erpInvoicesCoreApi.list({
        related_invoice_no: invoice.invoiceNo,
        related_serial_no: invoice.serialNo || undefined,
        direction: invoice?.direction || direction,
        pageSize: 10,
      });
      return res.items || [];
    },
    enabled: Boolean(
      isOriginalAdjustedOrReplaced &&
      invoice?.invoiceNo &&
      (!reconciliation?.relatedInvoices ||
        reconciliation.relatedInvoices.length === 0),
    ),
    staleTime: 30000,
  });

  const handleOpenInvoice = (invId?: string, invNo?: string) => {
    if (invId) {
      openGlobalErpDocument("INVOICE", invId);
    } else {
      toast.error(
        t(
          "Không tìm thấy dữ liệu chi tiết của hóa đơn {{no}} trong hệ thống.",
          {
            no: invNo || "",
          },
        ),
      );
    }
  };

  const handleExecuteNetoff = () => {
    if (!invoice?.id) return;
    const originalId =
      reconciliation?.relatedInvoices?.find(
        (r) => r.relationType === "ORIGINAL_OF_THIS",
      )?.id || originalInvoiceRes?.id;

    if (!originalId) {
      toast.error(t("Không tìm thấy HĐ Gốc để thực hiện cấn trừ"));
      return;
    }

    executeNetoff({
      originalInvoiceId: originalId,
      adjustingInvoiceId: invoice.id,
    });
  };

  return {
    t,
    isAdjustmentOrReplacement,
    isOriginalAdjustedOrReplaced,
    originalInvoiceRes,
    loadingOriginal,
    adjustingInvoicesRes,
    loadingAdjusting,
    handleOpenInvoice,
    handleExecuteNetoff,
    reconciliation,
    loadingReconciliation,
    isExecutingNetoff,
    relatedInvNo,
    taxStatus,
  };
}
