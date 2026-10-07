import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/organisms";
import { ErpInvoiceGeneralInfoSection } from "../erp-invoice-general-info";
import { ErpInvoiceDefaultAttributesSection } from "../erp-invoice-default-attributes-section";
import { ProviderLookupInfoCard } from "../../molecules/provider-lookup-info-card";
import {
  erpInvoicesCoreApi,
  type CreateErpInvoicePayload,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceInternalSidebarProps {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  invoiceId?: string | null;
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  pdfSlot?: React.ReactNode;
  onRefreshDetail?: () => void;
  hideAccountingSection?: boolean;
}

export function ErpInvoiceInternalSidebar({
  form,
  editMode,
  fieldSet,
  invoiceId,
  pendingTagIds = [],
  onPendingTagsChange,
  direction,
  detailInvoice,
  onRefreshDetail,
}: ErpInvoiceInternalSidebarProps) {
  const { t } = useTranslation("erpInvoices");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadOriginalPdf = useCallback(
    async (invId: string) => {
      try {
        setIsDownloadingPdf(true);
        await erpInvoicesCoreApi.downloadOriginalPdf(invId);
        toast.success(
          t("downloadPdfSuccess", "Tải PDF gốc nhà cung cấp thành công"),
        );
        onRefreshDetail?.();
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            t("downloadPdfFailed", "Tải PDF gốc nhà cung cấp thất bại"),
        );
      } finally {
        setIsDownloadingPdf(false);
      }
    },
    [onRefreshDetail, t],
  );

  const hasLookupInfo = Boolean(
    detailInvoice &&
    (detailInvoice.providerCode ||
      detailInvoice.lookupCode ||
      detailInvoice.lookupUrl ||
      detailInvoice.pdfSource),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 0. THÔNG TIN TRA CỨU & PDF GỐC NHÀ CUNG CẤP */}
      {hasLookupInfo && detailInvoice && (
        <ProviderLookupInfoCard
          invoiceId={detailInvoice.id}
          invoiceNo={detailInvoice.invoiceNo}
          providerCode={detailInvoice.providerCode}
          lookupCode={detailInvoice.lookupCode}
          lookupUrl={detailInvoice.lookupUrl}
          pdfFileKey={detailInvoice.pdfFileKey}
          pdfSource={detailInvoice.pdfSource}
          pdfError={detailInvoice.pdfError}
          onDownloadPdf={handleDownloadOriginalPdf}
          isDownloading={isDownloadingPdf}
        />
      )}

      {/* 1. THÔNG TIN CHUNG (SHARED COMPONENT) */}
      <ErpInvoiceGeneralInfoSection
        invoice={detailInvoice}
        form={form}
        editMode={editMode}
        fieldSet={fieldSet}
        direction={direction}
        invoiceId={invoiceId}
        pendingTagIds={pendingTagIds}
        onPendingTagsChange={onPendingTagsChange}
      />

      {/* 2. THUỘC TÍNH MẶC ĐỊNH (ATOMIC SUB-COMPONENT) */}
      <ErpInvoiceDefaultAttributesSection
        form={form}
        editMode={editMode}
        fieldSet={fieldSet}
        direction={direction}
        detailInvoice={detailInvoice}
        onRefreshDetail={onRefreshDetail}
      />

      {/* 3. THUỘC TÍNH TÙY CHỈNH (Auto-hidden when empty) */}
      <ModuleEntityCustomFieldsSection
        moduleKey={direction === "OUT" ? "INVOICE_OUT" : "INVOICE_IN"}
        entityId={detailInvoice?.id || invoiceId}
        editMode={editMode}
        globalTitle={t("customAttributes", "THUỘC TÍNH TÙY CHỈNH")}
        includeSystemAttributes={false}
        hideCategorySection={true}
        globalAttributes={(form as any).globalAttributes}
        onGlobalAttributesChange={(gAttrs) =>
          fieldSet("globalAttributes", gAttrs)
        }
      />
    </div>
  );
}
