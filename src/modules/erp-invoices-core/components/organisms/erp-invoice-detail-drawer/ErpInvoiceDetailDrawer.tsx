import React, { useMemo, useState, useEffect } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  DrawerDocumentTraceability,
} from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { FileText, Users, Link2, History } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { VoucherNetoffSelectionModal } from "../voucher-netoff-selection-modal";
import { PurchaseOrderSelectionModal } from "../purchase-order-selection-modal";
import { SalesOrderSelectionModal } from "../sales-order-selection-modal";
import { GarageCaseSelectionModal } from "../garage-case-selection-modal";
import { ErpInvoiceSettlementProvider } from "../erp-invoice-settlement-tab";
import { ErpInvoiceSettlementRightPanel } from "../erp-invoice-settlement-right-panel";
import {
  ErpInvoicePartnerTab,
  ErpInvoicePartnerSection,
} from "../erp-invoice-partner-tab";
import { ErpInvoiceInternalSidebar } from "./ErpInvoiceInternalSidebar";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";
import { useErpInvoiceDetailDrawer } from "./ErpInvoiceDetailDrawer.hook";
import {
  formatTaxInvoiceStatus,
  buildInvoiceAuditItems,
} from "./ErpInvoiceDetailDrawer.state";

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
    hideEditToggle = false,
    form,
    fieldSet,
    direction,
    postingState,
    pendingUnpost = false,
    onUnpost,
    tabs: customTabs,
    defaultTabKey = "invoice_details",
    activeTabKey,
    onTabChange,
    relatedTabs: customRelatedTabs,
    defaultRelatedTabKey = "financials",
    defaultRelatedCollapsed = false,
    bottomPanel,
    pendingTagIds,
    onPendingTagsChange,
  } = props;

  const {
    t,
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
    handleSelectBankNetOff,
    handleSelectPo,
    handleSelectSo,
    handleSelectGarageCase,
    editActions,
    footerLeft,
  } = useErpInvoiceDetailDrawer(props);

  const [invoiceDetailSubTab, setInvoiceDetailSubTab] = useState<
    "details" | "accounting"
  >(activeTabKey === "accounting" ? "accounting" : "details");

  useEffect(() => {
    if (activeTabKey === "accounting") {
      setInvoiceDetailSubTab("accounting");
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
        // No Blue Mandate: Thay thế blue-* bằng slate-*
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

  // Build Top Navigation Tabs for Invoice
  const resolvedDrawerTabs = useMemo(() => {
    if (customTabs) return customTabs;
    if (!detailInvoice) return undefined;

    const auditItems = buildInvoiceAuditItems(detailInvoice, t);

    const linkedCount =
      (detailInvoice.voucherNetOffs?.length || 0) +
      ((detailInvoice as any).relatedPos?.length || 0);

    const financialsBadgeCount =
      form?.pendingDocumentChanges?.filter((p) => p.type === "BANK")?.length ||
      0;

    return [
      // 1. Tab Chi tiết: nội dung HĐ + xem trước / PDF + hạch toán kế toán (sub-tabs)
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
          >
            <div className="space-y-4">{children}</div>
          </ErpInvoicePartnerTab>
        ),
        rightPanel: defaultRightPanel,
      },

      // 2. Tab Chi tiết theo NCC/KH (đối tượng, HHDV, biến động & phân tích)
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

      // 3. Tab Chứng từ liên kết: sơ đồ liên kết; ghép nối qua dropdown mở drawer chọn
      {
        key: "linked_docs",
        label: t("tabLinkedFinance", "Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount: linkedCount + financialsBadgeCount,
        rightPanel: (
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
        ),
        content: (
          <DrawerSection
            title={t(
              "drawerSectionLinkedDocs",
              "Sơ đồ luồng chứng từ liên kết",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <DrawerDocumentTraceability
              rootId={detailInvoice.id}
              rootType="INVOICE"
              fetchGraph={handleFetchGraph}
              editMode={editMode}
              allowedDocTypes={[
                "BANK_TXN",
                "PURCHASE_ORDER",
                "SALES_ORDER",
                "GARAGE_CASE",
              ]}
              onAddLink={(stageKey, docType) => {
                if (docType === "BANK_TXN" || stageKey === "PAYMENT") {
                  setShowNetOffModal(true);
                } else if (
                  docType === "PURCHASE_ORDER" ||
                  stageKey === "ORDER_STOCK"
                ) {
                  setShowPoModal(true);
                } else if (docType === "SALES_ORDER") {
                  setShowSoModal(true);
                } else if (docType === "GARAGE_CASE") {
                  setShowGarageCaseModal(true);
                } else {
                  setShowNetOffModal(true);
                }
              }}
              onUnlinkNode={async (node) => {
                try {
                  if (editMode) {
                    const currentChanges = form?.pendingDocumentChanges || [];
                    if (node.docType === "BANK_TXN") {
                      fieldSet?.("pendingDocumentChanges", [
                        ...currentChanges,
                        { type: "BANK", action: "REMOVE", refId: node.id },
                      ]);
                    } else if (node.docType === "PURCHASE_ORDER") {
                      fieldSet?.("pendingDocumentChanges", [
                        ...currentChanges,
                        { type: "PO", action: "REMOVE", refId: node.id },
                      ]);
                    } else if (node.docType === "GARAGE_CASE") {
                      fieldSet?.("pendingDocumentChanges", [
                        ...currentChanges,
                        { type: "CASE", action: "REMOVE", refId: node.id },
                      ]);
                    } else if (node.docType === "SALES_ORDER") {
                      fieldSet?.("pendingDocumentChanges", [
                        ...currentChanges,
                        { type: "SO", action: "REMOVE", refId: node.id },
                      ]);
                    }
                  }
                } catch {
                  // ignore
                }
              }}
            />
          </DrawerSection>
        ),
      },

      // 4. Tab Lịch sử & Kiểm duyệt (Audit Timeline)
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
                emptyLabel={t("Chưa có ghi nhận lịch sử.")}
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
    editMode,
    postingState,
    pendingUnpost,
    onUnpost,
    invoiceDetailSubTab,
    direction,
    onSyncDetail,
    handleFetchGraph,
    defaultRightPanel,
    pendingTagIds,
    onPendingTagsChange,
    partnerDefaultSubTab,
    isDirectionIn,
    setShowNetOffModal,
    setShowPoModal,
    setShowSoModal,
    setShowGarageCaseModal,
    startEdit,
    form,
    fieldSet,
  ]);

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
          activeTabKey === "financials" || activeTabKey === "accounting"
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

      {detailInvoice && (
        <>
          <VoucherNetoffSelectionModal
            open={showNetOffModal}
            onClose={() => setShowNetOffModal(false)}
            invoice={detailInvoice}
            onSelect={handleSelectBankNetOff}
            existingVoucherIds={(detailInvoice.voucherNetOffs || []).map(
              (v) => v.bankTransactionId,
            )}
          />
          <PurchaseOrderSelectionModal
            open={showPoModal}
            onClose={() => setShowPoModal(false)}
            onSelect={handleSelectPo}
            existingPoIds={
              detailInvoice.purchaseOrderId
                ? [detailInvoice.purchaseOrderId]
                : []
            }
          />
          <SalesOrderSelectionModal
            open={showSoModal}
            onClose={() => setShowSoModal(false)}
            onSelect={handleSelectSo}
          />
          <GarageCaseSelectionModal
            open={showGarageCaseModal}
            onClose={() => setShowGarageCaseModal(false)}
            onSelect={handleSelectGarageCase}
          />
        </>
      )}
    </ErpInvoiceSettlementProvider>
  );
}
