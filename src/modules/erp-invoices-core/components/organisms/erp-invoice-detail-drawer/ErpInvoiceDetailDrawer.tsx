import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { ErpInvoiceSettlementProvider } from "../erp-invoice-settlement-tab";
import { ErpInvoiceSettlementRightPanel } from "../erp-invoice-settlement-right-panel";
import type { InvoiceDetailSubTabKey } from "../erp-invoice-partner-tab";
import { ErpInvoiceInternalSidebar } from "./ErpInvoiceInternalSidebar";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";
import { useErpInvoiceDetailDrawer } from "./ErpInvoiceDetailDrawer.hook";
import { formatTaxInvoiceStatus } from "./ErpInvoiceDetailDrawer.state";
import { useInvoiceDrawerTabs } from "./ErpInvoiceDrawerTabs";
import { ErpInvoiceDetailDrawerModals } from "./ErpInvoiceDetailDrawerModals";

export function ErpInvoiceDetailDrawer(props: ErpInvoiceDetailDrawerProps) {
  const {
    open,
    onClose,
    editMode,
    detailInvoice,
    startEdit,
    rightPanel,
    children,
    onSyncDetail,
    hideEditToggle,
    form,
    fieldSet,
    direction,
    postingState,
    pendingUnpost,
    onUnpost,
    tabs: customTabs,
    defaultTabKey = "invoice_details",
    activeTabKey,
    onTabChange,
    relatedTabs: customRelatedTabs,
    defaultRelatedTabKey,
    defaultRelatedCollapsed,
    bottomPanel,
    pendingTagIds,
    onPendingTagsChange,
  } = props;

  const { t } = useTranslation("erpInvoices");

  const {
    showNetOffModal,
    setShowNetOffModal,
    showPoModal,
    setShowPoModal,
    showSoModal,
    setShowSoModal,
    showGarageCaseModal,
    setShowGarageCaseModal,
    partnerDefaultSubTab,
    handleFetchGraph,
    traceabilityCount,
    handleSelectBankNetOff,
    handleSelectPo,
    handleSelectSo,
    handleSelectGarageCase,
    editActions,
    footerLeft,
  } = useErpInvoiceDetailDrawer(props);

  const [invoiceDetailSubTab, setInvoiceDetailSubTab] =
    useState<InvoiceDetailSubTabKey>(
      activeTabKey === "accounting"
        ? "accounting"
        : activeTabKey === "linked_docs" || activeTabKey === "financials"
          ? "linked_docs"
          : "details",
    );

  useEffect(() => {
    if (activeTabKey === "accounting") {
      setInvoiceDetailSubTab("accounting");
    } else if (
      activeTabKey === "linked_docs" ||
      activeTabKey === "financials"
    ) {
      setInvoiceDetailSubTab("linked_docs");
    }
  }, [activeTabKey]);

  const drawerTitle = detailInvoice
    ? `${t("internalTitle", "Thông tin nội bộ")}: ${detailInvoice.invoiceNo}`
    : t("internalTitle", "Thông tin nội bộ");

  const titleExtra = useMemo(() => {
    if (!detailInvoice || detailInvoice.taxInvoiceStatus == null)
      return undefined;
    const lbl = formatTaxInvoiceStatus(detailInvoice.taxInvoiceStatus);
    let badgeClass = "border-slate-200 bg-slate-50 text-slate-700";
    switch (detailInvoice.taxInvoiceStatus) {
      case 1:
        badgeClass =
          "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
        break;
      case 2:
      case 3:
      case 5:
        badgeClass = "border-amber-200 bg-amber-50 text-amber-700";
        break;
      case 4:
      case 6:
        badgeClass = "border-red-200 bg-red-50 text-red-700";
        break;
    }
    return (
      <Badge variant="ghost" className={`border ${badgeClass}`}>
        {lbl}
      </Badge>
    );
  }, [detailInvoice]);

  const isDirectionIn = (direction || detailInvoice?.direction) === "IN";

  const defaultRightPanel = useMemo(() => {
    if (rightPanel) return rightPanel;
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
    rightPanel,
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
    onOpenNetOffModal: () => setShowNetOffModal(true),
    onOpenPoModal: () => setShowPoModal(true),
    onOpenSoModal: () => setShowSoModal(true),
    onOpenGarageCaseModal: () => setShowGarageCaseModal(true),
  });

  return (
    <ErpInvoiceSettlementProvider
      invoice={detailInvoice}
      form={form}
      editMode={editMode}
      fieldSet={fieldSet}
      direction={direction}
      onRefresh={onSyncDetail}
      enabled={open}
    >
      <StandardFormDrawer
        open={open}
        mode={editMode ? "edit" : "view"}
        onClose={onClose}
        onToggleEdit={!editMode && !hideEditToggle ? startEdit : undefined}
        title={drawerTitle}
        titleExtra={titleExtra}
        size="xl"
        layout={
          resolvedDrawerTabs
            ? "2-columns"
            : rightPanel
              ? "2-columns"
              : "1-column"
        }
        collapsibleRightPanel={true}
        confirmOnClose={editMode}
        actions={editMode ? editActions : undefined}
        footerLeft={footerLeft}
        tabs={resolvedDrawerTabs}
        defaultTabKey={defaultTabKey}
        activeTabKey={
          activeTabKey === "financials" ||
          activeTabKey === "accounting" ||
          activeTabKey === "linked_docs"
            ? "invoice_details"
            : activeTabKey
        }
        onTabChange={onTabChange}
        leftPanel={!resolvedDrawerTabs ? children : undefined}
        rightPanel={!resolvedDrawerTabs ? defaultRightPanel : undefined}
        relatedTabs={customRelatedTabs}
        defaultRelatedTabKey={defaultRelatedTabKey}
        defaultRelatedCollapsed={defaultRelatedCollapsed}
        bottomPanel={bottomPanel}
      />

      <ErpInvoiceDetailDrawerModals
        detailInvoice={detailInvoice}
        showNetOffModal={showNetOffModal}
        setShowNetOffModal={setShowNetOffModal}
        showPoModal={showPoModal}
        setShowPoModal={setShowPoModal}
        showSoModal={showSoModal}
        setShowSoModal={setShowSoModal}
        showGarageCaseModal={showGarageCaseModal}
        setShowGarageCaseModal={setShowGarageCaseModal}
        handleSelectBankNetOff={handleSelectBankNetOff}
        handleSelectPo={handleSelectPo}
        handleSelectSo={handleSelectSo}
        handleSelectGarageCase={handleSelectGarageCase}
      />
    </ErpInvoiceSettlementProvider>
  );
}
