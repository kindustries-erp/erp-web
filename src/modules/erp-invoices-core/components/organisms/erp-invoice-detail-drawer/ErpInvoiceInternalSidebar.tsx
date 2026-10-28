import React from "react";
import { useTranslation } from "react-i18next";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/organisms";
import { ErpInvoiceGeneralInfoSection } from "../erp-invoice-general-info";
import { ErpInvoiceDefaultAttributesSection } from "../erp-invoice-default-attributes-section";
import { ProviderLookupInfoCard } from "../../molecules/provider-lookup-info-card";
import { useOriginalPdfLookupInfo } from "../../../hooks/useOriginalPdfLookupInfo";
import { useDownloadOriginalPdf } from "../../../hooks/useDownloadOriginalPdf";
import { useManualUploadPdf } from "../../../hooks/useManualUploadPdf";
import type {
  CreateErpInvoicePayload,
  ErpInvoice,
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
  debtSlot?: React.ReactNode;
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
  debtSlot,
  onRefreshDetail,
}: ErpInvoiceInternalSidebarProps) {
  const { t } = useTranslation("erpInvoices");
  const isPurchase = direction === "IN" && Boolean(detailInvoice);
  const lookup = useOriginalPdfLookupInfo(detailInvoice?.id, {
    enabled: isPurchase,
  });
  const downloadPdf = useDownloadOriginalPdf();
  const uploadPdf = useManualUploadPdf();

  const handleDownloadOriginalPdf = async (invId: string) => {
    await downloadPdf.mutateAsync(invId);
    onRefreshDetail?.();
  };

  const handleUploadPdf = async (invId: string, file: File) => {
    await uploadPdf.mutateAsync({ invoiceId: invId, file });
    onRefreshDetail?.();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 0. THÔNG TIN TRA CỨU & PDF GỐC NHÀ CUNG CẤP (chỉ HĐ mua vào) */}
      {isPurchase && detailInvoice && (
        <ProviderLookupInfoCard
          invoiceId={detailInvoice.id}
          providerCode={lookup.data?.providerCode ?? detailInvoice.providerCode}
          providerName={lookup.data?.providerName}
          lookupCode={lookup.data?.lookupCode ?? detailInvoice.lookupCode}
          lookupUrl={lookup.data?.lookupUrl ?? detailInvoice.lookupUrl}
          hints={lookup.data?.hints ?? []}
          hasXml={lookup.data?.hasXml ?? Boolean(detailInvoice.xmlFileKey)}
          pdfFileKey={detailInvoice.pdfFileKey}
          pdfSource={detailInvoice.pdfSource}
          pdfError={detailInvoice.pdfError}
          onDownloadPdf={handleDownloadOriginalPdf}
          isDownloading={downloadPdf.isPending}
          onUploadPdf={handleUploadPdf}
          isUploading={uploadPdf.isPending}
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

      {/* 1.5. CÔNG NỢ & MỤC TIÊU CẤN TRỪ (Chỉ hiển thị khi có debtSlot - ví dụ: tab Chứng từ & Tài chính) */}
      {debtSlot}

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
