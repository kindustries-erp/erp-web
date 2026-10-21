import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DrawerDocumentTraceability } from "@/shared/components/StandardFormDrawer";
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
        if (docType === "BANK_TXN" || stageKey === "PAYMENT") {
          onOpenNetOffModal();
        } else if (docType === "PURCHASE_ORDER" || stageKey === "ORDER_STOCK") {
          onOpenPoModal();
        } else if (docType === "SALES_ORDER") {
          onOpenSoModal();
        } else if (docType === "GARAGE_CASE") {
          onOpenGarageCaseModal();
        } else {
          onOpenNetOffModal();
        }
      },
      [onOpenNetOffModal, onOpenPoModal, onOpenSoModal, onOpenGarageCaseModal],
    );

    const handleUnlinkNode = useCallback(
      async (node: { id: string; docType: string }) => {
        try {
          if (!editMode) return;
          const currentChanges = form?.pendingDocumentChanges || [];
          const mapping: Record<string, "BANK" | "PO" | "CASE" | "SO"> = {
            BANK_TXN: "BANK",
            PURCHASE_ORDER: "PO",
            GARAGE_CASE: "CASE",
            SALES_ORDER: "SO",
          };
          const type = mapping[node.docType];
          if (type) {
            fieldSet?.("pendingDocumentChanges", [
              ...currentChanges,
              { type, action: "REMOVE", refId: node.id },
            ]);
          }
        } catch {
          // ignore
        }
      },
      [editMode, form?.pendingDocumentChanges, fieldSet],
    );

    return (
      <DrawerSection
        title={t("drawerSectionLinkedDocs", "Sơ đồ luồng chứng từ liên kết")}
        collapsible
        defaultCollapsed={false}
      >
        <DrawerDocumentTraceability
          rootId={detailInvoice.id}
          rootType="INVOICE"
          fetchGraph={fetchGraph}
          editMode={editMode}
          allowedDocTypes={[
            "BANK_TXN",
            "PURCHASE_ORDER",
            "SALES_ORDER",
            "GARAGE_CASE",
          ]}
          onAddLink={handleAddLink}
          onUnlinkNode={handleUnlinkNode}
        />
      </DrawerSection>
    );
  },
);
