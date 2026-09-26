import React from "react";
import { useTranslation } from "react-i18next";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/ModuleEntityCustomFieldsSection";
import { ErpInvoiceGeneralInfoSection } from "./ErpInvoiceGeneralInfoSection";
import { ErpInvoiceDefaultAttributesSection } from "./ErpInvoiceDefaultAttributesSection";
import type {
  CreateErpInvoicePayload,
  ErpInvoice,
} from "../api/erpInvoicesCoreApi";

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

  return (
    <div className="flex flex-col gap-4">
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
