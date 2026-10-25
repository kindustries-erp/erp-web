import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { V2TabItemData } from "@/v2/shared/components";
import type {
  InvoiceDetailSubTabKey,
  PartnerSubTabMode,
} from "../erp-invoice-partner-tab";
import { ErpInvoiceSettlementRightPanel } from "../erp-invoice-settlement-right-panel";
import { ErpInvoiceInternalSidebar } from "./ErpInvoiceInternalSidebar";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";
import { formatTaxInvoiceStatus } from "./ErpInvoiceDetailDrawer.state";
import { useInvoiceDrawerTabs } from "./ErpInvoiceDrawerTabs";

interface DrawerPresentationActions {
  partnerDefaultSubTab: PartnerSubTabMode;
  handleFetchGraph: (id: string) => Promise<any>;
  traceabilityCount?: number | null;
  onOpenNetOffModal: () => void;
  onOpenPoModal: () => void;
  onOpenSoModal: () => void;
  onOpenGarageCaseModal: () => void;
}

export function useErpInvoiceDetailDrawerPresentation(
  props: ErpInvoiceDetailDrawerProps,
  actions: DrawerPresentationActions,
) {
  const {
    detailInvoice,
    direction,
    editMode,
    form,
    fieldSet,
    pendingTagIds,
    onPendingTagsChange,
    onSyncDetail,
    startEdit,
    children,
    activeTabKey,
  } = props;
  const { t } = useTranslation("erpInvoices");
  const [invoiceDetailSubTab, setInvoiceDetailSubTab] =
    useState<InvoiceDetailSubTabKey>(
      activeTabKey === "accounting"
        ? "accounting"
        : activeTabKey === "linked_docs" || activeTabKey === "financials"
          ? "linked_docs"
          : "details",
    );

  useEffect(() => {
    if (activeTabKey === "accounting") setInvoiceDetailSubTab("accounting");
    else if (activeTabKey === "linked_docs" || activeTabKey === "financials")
      setInvoiceDetailSubTab("linked_docs");
  }, [activeTabKey]);

  const drawerTitle = detailInvoice
    ? `${t("internalTitle", "Thông tin nội bộ")}: ${detailInvoice.invoiceNo}`
    : t("internalTitle", "Thông tin nội bộ");
  const titleExtra = useMemo(() => {
    if (!detailInvoice || detailInvoice.taxInvoiceStatus == null)
      return undefined;
    const status = detailInvoice.taxInvoiceStatus;
    const badgeClass =
      status === 1
        ? "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        : [2, 3, 5].includes(status)
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : [4, 6].includes(status)
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-slate-50 text-slate-700";
    return (
      <Badge variant="ghost" className={`border ${badgeClass}`}>
        {formatTaxInvoiceStatus(status, t)}
      </Badge>
    );
  }, [detailInvoice, t]);

  const defaultRightPanel = useMemo(() => {
    if (props.rightPanel) return props.rightPanel;
    if (!detailInvoice) return undefined;
    return (
      <div className="flex flex-col gap-4">
        <ErpInvoiceInternalSidebar
          form={form as any}
          editMode={editMode}
          fieldSet={fieldSet as any}
          invoiceId={detailInvoice.id}
          pendingTagIds={pendingTagIds}
          onPendingTagsChange={onPendingTagsChange}
          direction={
            direction || (detailInvoice.direction as "IN" | "OUT") || "IN"
          }
          detailInvoice={detailInvoice}
          onRefreshDetail={onSyncDetail}
        />
      </div>
    );
  }, [
    props.rightPanel,
    detailInvoice,
    form,
    editMode,
    fieldSet,
    pendingTagIds,
    onPendingTagsChange,
    direction,
    onSyncDetail,
  ]);

  const settlementRightPanel = useMemo(() => {
    if (!detailInvoice) return undefined;
    return (
      <ErpInvoiceSettlementRightPanel
        invoice={detailInvoice}
        form={form}
        editMode={editMode}
        fieldSet={fieldSet}
        direction={direction}
        onRefresh={onSyncDetail}
        onStartEdit={startEdit}
        pendingTagIds={pendingTagIds}
        onPendingTagsChange={onPendingTagsChange}
      />
    );
  }, [
    detailInvoice,
    form,
    editMode,
    fieldSet,
    direction,
    onSyncDetail,
    startEdit,
    pendingTagIds,
    onPendingTagsChange,
  ]);

  const resolvedDrawerTabs = useInvoiceDrawerTabs({
    customTabs: props.tabs,
    detailInvoice,
    children,
    direction,
    isDirectionIn: (direction || detailInvoice?.direction) === "IN",
    editMode,
    form,
    fieldSet,
    postingState: props.postingState,
    pendingUnpost: props.pendingUnpost,
    onUnpost: props.onUnpost,
    invoiceDetailSubTab,
    setInvoiceDetailSubTab,
    partnerDefaultSubTab: actions.partnerDefaultSubTab,
    defaultRightPanel,
    settlementRightPanel,
    handleFetchGraph: actions.handleFetchGraph,
    traceabilityCount: actions.traceabilityCount,
    onOpenNetOffModal: actions.onOpenNetOffModal,
    onOpenPoModal: actions.onOpenPoModal,
    onOpenSoModal: actions.onOpenSoModal,
    onOpenGarageCaseModal: actions.onOpenGarageCaseModal,
  });
  const tabs: V2TabItemData[] | undefined = resolvedDrawerTabs?.map((tab) => ({
    key: tab.key,
    label: tab.label,
    icon: tab.icon,
    badgeCount: tab.badgeCount,
    hideRightPanel: tab.hideRightPanel,
    rightPanel: tab.rightPanel,
    headerExtra: tab.headerExtra,
    content: tab.content,
  }));

  return { drawerTitle, titleExtra, defaultRightPanel, tabs };
}
