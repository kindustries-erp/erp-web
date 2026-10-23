import React from "react";
import { V2StandardDrawer } from "@/v2/shared/components";
import { ErpInvoiceSettlementProvider } from "../erp-invoice-settlement-tab";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";
import { useErpInvoiceDetailDrawer } from "./ErpInvoiceDetailDrawer.hook";
import { useErpInvoiceDetailDrawerPresentation } from "./ErpInvoiceDetailDrawer.presentation.hook";
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
    loadingDetail,
    hideEditToggle,
    form,
    fieldSet,
    direction,
    defaultTabKey = "invoice_details",
    activeTabKey,
    onTabChange,
    relatedTabs: customRelatedTabs,
    defaultRelatedTabKey,
    defaultRelatedCollapsed,
    bottomPanel,
  } = props;
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
    actionGroups,
    footerLeft,
  } = useErpInvoiceDetailDrawer(props);
  const { drawerTitle, titleExtra, defaultRightPanel, tabs } =
    useErpInvoiceDetailDrawerPresentation(props, {
      partnerDefaultSubTab,
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
      <V2StandardDrawer
        open={open}
        mode={editMode ? "edit" : "view"}
        onClose={onClose}
        onToggleEdit={!editMode && !hideEditToggle ? startEdit : undefined}
        title={drawerTitle}
        titleExtra={titleExtra}
        size="xl"
        layout={tabs ? "2-columns" : rightPanel ? "2-columns" : "1-column"}
        collapsibleRightPanel={true}
        confirmOnClose={editMode}
        actions={editMode ? editActions : undefined}
        actionGroups={actionGroups}
        footerLeft={footerLeft}
        tabs={tabs}
        loading={loadingDetail}
        defaultTabKey={defaultTabKey}
        activeTabKey={
          activeTabKey === "financials" ||
          activeTabKey === "accounting" ||
          activeTabKey === "linked_docs"
            ? "invoice_details"
            : activeTabKey
        }
        onTabChange={onTabChange}
        leftPanel={!tabs ? children : undefined}
        rightPanel={!tabs ? defaultRightPanel : undefined}
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
