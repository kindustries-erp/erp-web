import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { openGlobalErpDocument } from "@/shared/components/drawer/DrawerDocumentTraceability/constants";
import { V2DocumentTraceability } from "@/v2/shared/components/organisms/v2-document-traceability";
import type { TraceabilityNode } from "@/v2/shared/components/organisms/v2-document-traceability";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceLinkedDocsSectionProps {
  detailInvoice: ErpInvoice;
  editMode?: boolean;
  form?: any;
  fieldSet?: (key: string, value: unknown) => void;
  fetchGraph: (id: string) => Promise<any>;
  onOpenNetOffModal: () => void;
  onOpenPoModal: () => void;
  onOpenSoModal: () => void;
  onOpenGarageCaseModal: () => void;
}

const ALLOWED_DOC_TYPES = [
  "BANK_TXN",
  "PURCHASE_ORDER",
  "SALES_ORDER",
  "GARAGE_CASE",
] as const;

/**
 * Sơ đồ chứng từ liên kết của hóa đơn, dùng bản V2 (`V2DocumentTraceability`).
 * Mở chứng từ và sửa thu/chi ngoài vẫn đi qua các sự kiện mà shell V1 đang lắng nghe.
 */
export const ErpInvoiceLinkedDocsSection = React.memo(
  function ErpInvoiceLinkedDocsSection({
    detailInvoice,
    editMode,
    form,
    fieldSet,
    fetchGraph,
    onOpenNetOffModal,
    onOpenPoModal,
    onOpenSoModal,
    onOpenGarageCaseModal,
  }: ErpInvoiceLinkedDocsSectionProps) {
    const { t } = useTranslation("erpInvoices");

    const handleAddLink = useCallback(
      (stageKey?: string, docType?: string) => {
        if (docType === "BANK_TXN" || stageKey === "PAYMENT")
          onOpenNetOffModal();
        else if (docType === "PURCHASE_ORDER" || stageKey === "ORDER_STOCK")
          onOpenPoModal();
        else if (docType === "SALES_ORDER") onOpenSoModal();
        else if (docType === "GARAGE_CASE") onOpenGarageCaseModal();
        else onOpenNetOffModal();
      },
      [onOpenNetOffModal, onOpenPoModal, onOpenSoModal, onOpenGarageCaseModal],
    );

    const handleUnlinkNode = useCallback(
      (node: { id: string; docType: string }) => {
        if (!editMode) return;
        const mapping: Record<string, "BANK" | "PO" | "CASE" | "SO"> = {
          BANK_TXN: "BANK",
          PURCHASE_ORDER: "PO",
          GARAGE_CASE: "CASE",
          SALES_ORDER: "SO",
        };
        const type = mapping[node.docType];
        if (!type) return;
        const currentChanges = form?.pendingDocumentChanges || [];
        fieldSet?.("pendingDocumentChanges", [
          ...currentChanges,
          { type, action: "REMOVE", refId: node.id },
        ]);
      },
      [editMode, form?.pendingDocumentChanges, fieldSet],
    );

    const handleOpenDocument = useCallback((node: TraceabilityNode) => {
      openGlobalErpDocument(node.docType, node.id);
    }, []);

    const handleEditManualSettlement = useCallback((node: TraceabilityNode) => {
      window.dispatchEvent(
        new CustomEvent("open_manual_settlement_editor", { detail: { node } }),
      );
    }, []);

    return (
      <DrawerSection
        title={t("drawerSectionLinkedDocs", "Sơ đồ luồng chứng từ liên kết")}
        collapsible
        defaultCollapsed={false}
      >
        <V2DocumentTraceability
          rootId={detailInvoice.id}
          fetchGraph={fetchGraph}
          editMode={Boolean(editMode)}
          allowedDocTypes={[...ALLOWED_DOC_TYPES]}
          onAddLink={handleAddLink}
          onUnlinkNode={handleUnlinkNode}
          onOpenDocument={handleOpenDocument}
          onEditManualSettlement={handleEditManualSettlement}
        />
      </DrawerSection>
    );
  },
);
