import { useState, useEffect, useCallback } from "react";
import { useUIStore } from "@/core/config/uiStore";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { type useErpInvoiceUrlSync } from "@/modules/erp-invoices-core/hooks/useErpInvoiceUrlSync";

export interface UseInvoiceModalsOptions {
  isDrawer: boolean;
  formHook: ReturnType<typeof useErpInvoiceForm>;
  urlSync: ReturnType<typeof useErpInvoiceUrlSync>;
}

export function useInvoiceModals({
  isDrawer,
  formHook,
  urlSync,
}: UseInvoiceModalsOptions) {
  const showToast = useUIStore((s) => s.showToast);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [portalAuthOpen, setPortalAuthOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
    isAttachment?: boolean;
  } | null>(null);
  const [netOffInvoice, setNetOffInvoice] = useState<any | null>(null);

  useEffect(() => {
    const handleOpenDoc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type === "bank_transaction" && detail.id) {
        setDetailTransactionId(detail.id);
      }
    };
    window.addEventListener("open_erp_document", handleOpenDoc);
    return () => window.removeEventListener("open_erp_document", handleOpenDoc);
  }, []);

  const handleOpenInternal = useCallback(
    (
      inv: {
        id: string;
        invoiceNo?: string | null;
        serialNo?: string | null;
      },
      mode: "view" | "edit" = "view",
      initialTab = "invoice_details",
    ) => {
      formHook.openInternal(inv as ErpInvoice, false, initialTab);
      if (mode === "edit") {
        formHook.setEditMode(true);
      }
      if (!isDrawer) {
        const drawerParam =
          inv.serialNo && inv.invoiceNo
            ? `${inv.serialNo}_${inv.invoiceNo}`
            : inv.invoiceNo || inv.id;
        urlSync.openDrawerWithUrl(drawerParam, mode);
      }
    },
    [formHook, isDrawer, urlSync],
  );

  const handleCloseInternal = useCallback(() => {
    formHook.closeDrawer();
    if (!isDrawer) {
      urlSync.closeDrawerWithUrl();
    }
  }, [formHook, isDrawer, urlSync]);

  const handleDownload = useCallback(
    async (id: string, type: "pdf" | "xml") => {
      try {
        showToast({
          title: `Đang tải file ${type.toUpperCase()}...`,
          variant: "default",
        });
        const { url } = await erpInvoicesCoreApi.getDownloadUrl(id, type);
        if (url) {
          const a = document.createElement("a");
          a.href = url;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch {
        showToast({
          title: `Không thể tải ${type.toUpperCase()}`,
          variant: "destructive",
        });
      }
    },
    [showToast],
  );

  const handlePreviewPdf = useCallback(
    async (id: string, key: string, filename: string) => {
      try {
        showToast({ title: "Đang mở PDF...", variant: "default" });
        const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
          id,
          key,
          true,
        );
        setPreviewPdf({
          url,
          filename,
          fileKey: key,
          invoiceId: id,
        });
      } catch {
        showToast({ title: "Không thể mở PDF", variant: "destructive" });
      }
    },
    [showToast],
  );

  const handleExportExcel = useCallback(() => {
    setExportDrawerOpen(true);
  }, []);

  return {
    showToast,
    exportDrawerOpen,
    setExportDrawerOpen,
    portalAuthOpen,
    setPortalAuthOpen,
    importModalOpen,
    setImportModalOpen,
    detailTransactionId,
    setDetailTransactionId,
    openPopoverId,
    setOpenPopoverId,
    previewPdf,
    setPreviewPdf,
    netOffInvoice,
    setNetOffInvoice,
    handleOpenInternal,
    handleCloseInternal,
    handleDownload,
    handlePreviewPdf,
    handleExportExcel,
  };
}
