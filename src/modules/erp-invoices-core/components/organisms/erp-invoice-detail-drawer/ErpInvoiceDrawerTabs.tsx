import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Users, History } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DrawerAuditTimeline } from "@/shared/components/StandardFormDrawer";
import type { DrawerTopTabItem } from "@/shared/components/StandardFormDrawer";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  ErpInvoicePartnerTab,
  ErpInvoicePartnerSection,
  ErpInvoiceLinkedDocsSection,
  type InvoiceDetailSubTabKey,
  type PartnerSubTabMode,
} from "../erp-invoice-partner-tab";
import { buildInvoiceAuditItems } from "./ErpInvoiceDetailDrawer.state";

export interface UseInvoiceDrawerTabsProps {
  customTabs?: DrawerTopTabItem[];
  detailInvoice: ErpInvoice | null;
  children: React.ReactNode;
  direction?: "IN" | "OUT";
  isDirectionIn: boolean;
  editMode: boolean;
  form?: any;
  fieldSet?: (key: string, value: unknown) => void;
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  invoiceDetailSubTab: InvoiceDetailSubTabKey;
  setInvoiceDetailSubTab: (tab: InvoiceDetailSubTabKey) => void;
  partnerDefaultSubTab: PartnerSubTabMode;
  defaultRightPanel?: React.ReactNode;
  settlementRightPanel?: React.ReactNode;
  handleFetchGraph: (id: string) => Promise<any>;
  traceabilityCount?: number | null;
  onOpenNetOffModal: () => void;
  onOpenPoModal: () => void;
  onOpenSoModal: () => void;
  onOpenGarageCaseModal: () => void;
}

export function useInvoiceDrawerTabs(
  props: UseInvoiceDrawerTabsProps,
): DrawerTopTabItem[] | undefined {
  const {
    customTabs,
    detailInvoice,
    children,
    direction,
    isDirectionIn,
    editMode,
    form,
    fieldSet,
    postingState,
    pendingUnpost,
    onUnpost,
    invoiceDetailSubTab,
    setInvoiceDetailSubTab,
    partnerDefaultSubTab,
    defaultRightPanel,
    settlementRightPanel,
    handleFetchGraph,
    traceabilityCount,
    onOpenNetOffModal,
    onOpenPoModal,
    onOpenSoModal,
    onOpenGarageCaseModal,
  } = props;
  const { t } = useTranslation("erpInvoices");

  return useMemo(() => {
    if (customTabs) return customTabs;
    if (!detailInvoice) return undefined;

    const auditItems = buildInvoiceAuditItems(detailInvoice, t);

    // Tính toán chứng từ liên kết: Sổ cái kế toán, PO, SO, Vụ việc Garage, Sao kê ngân hàng
    const hasJournalEntry = Boolean(
      detailInvoice.journalEntryId || detailInvoice.postingStatus === "POSTED",
    );
    const hasPo = Boolean(
      detailInvoice.purchaseOrderId ||
      ((detailInvoice as any).relatedPos?.length || 0) > 0,
    );
    const hasSo = Boolean(
      detailInvoice.salesOrderId ||
      ((detailInvoice as any).relatedSos?.length || 0) > 0,
    );
    const hasCase = Boolean(
      detailInvoice.settlementOrder ||
      ((detailInvoice as any).linkedCases?.length || 0) > 0,
    );
    const netOffCount = detailInvoice.voucherNetOffs?.length || 0;

    const pendingAddCount =
      form?.pendingDocumentChanges?.filter((p: any) => p.action === "ADD")
        ?.length || 0;
    const pendingRemoveCount =
      form?.pendingDocumentChanges?.filter((p: any) => p.action === "REMOVE")
        ?.length || 0;

    const fallbackCount =
      (hasJournalEntry ? 1 : 0) +
      (hasPo ? 1 : 0) +
      (hasSo ? 1 : 0) +
      (hasCase ? 1 : 0) +
      netOffCount;

    const effectiveLinkedCount = Math.max(
      0,
      (traceabilityCount !== null && traceabilityCount !== undefined
        ? traceabilityCount
        : fallbackCount) +
        pendingAddCount -
        pendingRemoveCount,
    );

    return [
      // 1. Tab Chi tiết (gồm 3 sub-tabs: Chi tiết hóa đơn | Hạch toán kế toán | Chứng từ liên kết)
      {
        key: "invoice_details",
        label: t("tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <ErpInvoicePartnerTab
            detailInvoice={detailInvoice}
            direction={direction}
            form={form}
            editMode={editMode}
            fieldSet={fieldSet}
            postingState={postingState}
            pendingUnpost={pendingUnpost}
            onUnpost={onUnpost}
            activeSubTab={invoiceDetailSubTab}
            onSubTabChange={setInvoiceDetailSubTab}
            linkedBadgeCount={effectiveLinkedCount}
            linkedDocsSlot={
              <ErpInvoiceLinkedDocsSection
                detailInvoice={detailInvoice}
                editMode={editMode}
                form={form}
                fieldSet={fieldSet}
                fetchGraph={handleFetchGraph}
                onOpenNetOffModal={onOpenNetOffModal}
                onOpenPoModal={onOpenPoModal}
                onOpenSoModal={onOpenSoModal}
                onOpenGarageCaseModal={onOpenGarageCaseModal}
              />
            }
          >
            <div className="space-y-4">{children}</div>
          </ErpInvoicePartnerTab>
        ),
        rightPanel:
          invoiceDetailSubTab === "linked_docs"
            ? settlementRightPanel
            : defaultRightPanel,
      },

      // 2. Tab Chi tiết theo NCC/KH
      {
        key: "invoice_partner",
        label: isDirectionIn
          ? t("tabSupplierDetails", "Chi tiết theo Nhà cung cấp")
          : t("tabCustomerDetails", "Chi tiết theo Khách hàng"),
        icon: <Users className="w-3.5 h-3.5" />,
        content: (
          <ErpInvoicePartnerSection
            detailInvoice={detailInvoice}
            direction={direction}
            defaultPartnerSubTab={partnerDefaultSubTab}
            form={form}
          />
        ),
        rightPanel: defaultRightPanel,
      },

      // 3. Tab Lịch sử & Kiểm duyệt (Audit Timeline)
      {
        key: "history",
        label: t("tabHistory", "Lịch sử & Kiểm duyệt"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <DrawerSection
            title={t("drawerSectionHistory", "Nhật ký kiểm toán & thao tác")}
            collapsible
            defaultCollapsed={false}
          >
            <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
              <DrawerAuditTimeline
                items={auditItems}
                emptyLabel={t("emptyHistory", "Chưa có ghi nhận lịch sử.")}
              />
            </div>
          </DrawerSection>
        ),
        rightPanel: defaultRightPanel,
      },
    ];
  }, [
    customTabs,
    detailInvoice,
    t,
    children,
    direction,
    isDirectionIn,
    editMode,
    form,
    fieldSet,
    postingState,
    pendingUnpost,
    onUnpost,
    invoiceDetailSubTab,
    setInvoiceDetailSubTab,
    partnerDefaultSubTab,
    defaultRightPanel,
    settlementRightPanel,
    handleFetchGraph,
    traceabilityCount,
    onOpenNetOffModal,
    onOpenPoModal,
    onOpenSoModal,
    onOpenGarageCaseModal,
  ]);
}
