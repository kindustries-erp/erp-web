import { type TFunction } from "i18next";
import { type ErpInvoiceListParams } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { type useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { type useErpInvoiceUrlSync } from "@/modules/erp-invoices-core/hooks/useErpInvoiceUrlSync";

export interface InvoiceDrawersProps {
  direction: "IN" | "OUT";
  isDrawer: boolean;
  t: TFunction<any, any>;
  showToast: (options: any) => void;
  formHook: ReturnType<typeof useErpInvoiceForm>;
  urlSync: ReturnType<typeof useErpInvoiceUrlSync>;
  loadInvoices: () => Promise<any>;
  handleCloseInternal: () => void;
  buildExportBaseQuery: () => Partial<ErpInvoiceListParams>;
  currentFilterSummary?: {
    dateFrom?: string;
    dateTo?: string;
    hasActiveFilters: boolean;
    filterCount: number;
    search?: string;
  };
  // Modals & Drawers
  exportDrawerOpen: boolean;
  setExportDrawerOpen: (open: boolean) => void;
  portalAuthOpen: boolean;
  setPortalAuthOpen: (open: boolean) => void;
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  detailTransactionId: string | null;
  setDetailTransactionId: (id: string | null) => void;
  previewPdf: {
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
    isAttachment?: boolean;
  } | null;
  setPreviewPdf: (pdf: any) => void;
  netOffInvoice: any | null;
  setNetOffInvoice: (inv: any | null) => void;
  activeView?: "header" | "lines" | "dashboard" | "draft";
  partnerViewMode?: "details" | "invoices" | "lines";
  syncAdvancedModalOpen?: boolean;
  setSyncAdvancedModalOpen?: (open: boolean) => void;
}
