import React, { useMemo } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  DrawerDocumentTraceability,
} from "@/shared/components/StandardFormDrawer";
import { FileText, Wallet, Link2, BookOpen, History } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { VoucherNetoffSelectionModal } from "../voucher-netoff-selection-modal";
import { PurchaseOrderSelectionModal } from "../purchase-order-selection-modal";
import { SalesOrderSelectionModal } from "../sales-order-selection-modal";
import { GarageCaseSelectionModal } from "../garage-case-selection-modal";
import {
  ErpInvoiceSettlementTab,
  ErpInvoiceSettlementProvider,
} from "../erp-invoice-settlement-tab";
import { ErpInvoiceSettlementRightPanel } from "../erp-invoice-settlement-right-panel";
import { ErpInvoicePartnerTab } from "../erp-invoice-partner-tab";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { resolvePurchaseDebitAccountCode } from "@/modules/erp-invoices-core/utils/invoiceTaxCodeAccounting";
import type { ErpInvoiceDetailDrawerProps } from "./ErpInvoiceDetailDrawer.type";
import { useErpInvoiceDetailDrawer } from "./ErpInvoiceDetailDrawer.hook";
import {
  formatTaxInvoiceStatus,
  createClientId,
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
    partnerViewMode,
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
    setSubTabKey,
    handleFetchGraph,
    handleSelectBankNetOff,
    handleSelectPo,
    handleSelectSo,
    handleSelectGarageCase,
    editActions,
    footerLeft,
  } = useErpInvoiceDetailDrawer(props);

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

  const formAccountingEnabled = (form as any)?.accountingEnabled;

  // Build Top Navigation Tabs for Invoice
  const resolvedDrawerTabs = useMemo(() => {
    if (customTabs) return customTabs;
    if (!detailInvoice) return undefined;

    const auditItems = buildInvoiceAuditItems(detailInvoice, t);

    const linkedCount =
      (detailInvoice.voucherNetOffs?.length || 0) +
      ((detailInvoice as any).relatedPos?.length || 0);

    return [
      // 1. Tab Chi tiết (Hợp nhất: Thông tin HĐ + Đối tác + Hàng hóa + Analytics + Tài liệu đính kèm)
      {
        key: "invoice_details",
        label: t("tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <ErpInvoicePartnerTab
            detailInvoice={detailInvoice}
            direction={direction}
            defaultViewMode={partnerViewMode ?? "details"}
            onViewModeChange={setSubTabKey}
            form={form}
            editMode={editMode}
            fieldSet={fieldSet}
          >
            <div className="space-y-4">{children}</div>
          </ErpInvoicePartnerTab>
        ),
        rightPanel,
      },

      // 2. Tab Tài chính (Settlements & Cashflow)
      {
        key: "financials",
        label: t("tabFinancials", "Tài chính"),
        icon: <Wallet className="w-3.5 h-3.5" />,
        badgeCount:
          (detailInvoice.voucherNetOffs?.length || 0) +
          (form?.pendingDocumentChanges?.filter((p) => p.type === "BANK")
            ?.length || 0),
        content: (
          <ErpInvoiceSettlementTab
            invoice={detailInvoice}
            form={form}
            editMode={editMode}
            fieldSet={fieldSet}
            direction={direction}
            onRefresh={onSyncDetail}
            onStartEdit={startEdit}
          />
        ),
        rightPanel: (
          <ErpInvoiceSettlementRightPanel
            invoice={detailInvoice}
            form={form}
            editMode={editMode}
            fieldSet={fieldSet}
            direction={direction}
            onRefresh={onSyncDetail}
            onStartEdit={startEdit}
          />
        ),
      },

      // 3. Tab Mạng lưới chứng từ liên kết (Canvas Graph Traceability - Full Width)
      {
        key: "linked_docs",
        label: t("tabLinkedDocs", "Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount: linkedCount,
        hideRightPanel: true,
        content: (
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
        ),
      },

      // 4. Tab Hạch toán kế toán (View & Edit)
      {
        key: "accounting",
        label: t("tabAccounting", "Hạch toán kế toán"),
        icon: <BookOpen className="w-3.5 h-3.5" />,
        badgeCount:
          detailInvoice.postingStatus === "POSTED" ||
          (form as any)?.accountingEnabled
            ? 1
            : 0,
        content: (
          <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
            {editMode && postingState ? (
              <div className="py-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Định khoản nghiệp vụ kế toán
                  </span>
                  {form?.branchId && (
                    <Button
                      type="button"
                      variant={
                        (form as any).accountingEnabled ? "outline" : "primary"
                      }
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        fieldSet?.(
                          "accountingEnabled",
                          !(form as any).accountingEnabled,
                        );
                      }}
                    >
                      {(form as any).accountingEnabled
                        ? "Hủy hạch toán"
                        : "Bật hạch toán"}
                    </Button>
                  )}
                </div>

                {!form?.branchId ? (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch
                    toán kế toán.
                  </div>
                ) : null}

                <div
                  className={`transition-all duration-200 ${
                    (form as any).accountingEnabled
                      ? "opacity-100"
                      : "opacity-40 grayscale pointer-events-none"
                  }`}
                >
                  <PostingSection
                    postingState={postingState}
                    editMode={true}
                    isPosted={
                      detailInvoice.postingStatus === "POSTED" && !pendingUnpost
                    }
                    journalEntryId={detailInvoice.journalEntryId}
                    defaultDate={form?.invoiceDate || ""}
                    defaultDescription={
                      detailInvoice.description ||
                      form?.description ||
                      `Hạch toán hóa đơn ${form?.invoiceNo || ""}`
                    }
                    onUnpost={() => {
                      if (onUnpost) {
                        onUnpost();
                        postingState?.reset?.();
                      }
                    }}
                    getDefaultLines={(accountOptions) => {
                      const findAccount = (prefix: string) =>
                        accountOptions.find((a) =>
                          a.label.split(" - ")[0]?.startsWith(prefix),
                        )?.value || "";
                      const preVat =
                        Number(
                          detailInvoice?.preVatAmount || form?.preVatAmount,
                        ) || 0;
                      const vat =
                        Number(detailInvoice?.vatAmount || form?.vatAmount) ||
                        0;
                      const total =
                        Number(
                          detailInvoice?.totalAmount || form?.totalAmount,
                        ) || 0;
                      const baseDesc =
                        detailInvoice?.description ||
                        `${t("postingDefaultDesc", "Hạch toán hóa đơn")} ${detailInvoice?.invoiceNo || form?.invoiceNo}`;

                      const newLines = [];
                      if (direction === "IN") {
                        const sellerTaxCode =
                          detailInvoice?.sellerTaxCode ||
                          form?.sellerTaxCode ||
                          "";
                        const debitCode =
                          resolvePurchaseDebitAccountCode(sellerTaxCode);
                        const debitAccountId =
                          debitCode === "642"
                            ? findAccount("642") || findAccount("632")
                            : findAccount("632") || findAccount("642");

                        if (preVat > 0)
                          newLines.push({
                            id: createClientId(),
                            accountId:
                              debitAccountId ||
                              findAccount("152") ||
                              findAccount("156"),
                            debit: preVat,
                            credit: 0,
                            description: baseDesc,
                          });
                        if (vat > 0)
                          newLines.push({
                            id: createClientId(),
                            accountId: findAccount("133"),
                            debit: vat,
                            credit: 0,
                            description: `Thuế GTGT ${detailInvoice?.invoiceNo || form?.invoiceNo}`,
                          });
                        if (total > 0)
                          newLines.push({
                            id: createClientId(),
                            accountId: findAccount("331"),
                            debit: 0,
                            credit: total,
                            description: baseDesc,
                          });
                      } else {
                        if (total > 0)
                          newLines.push({
                            id: createClientId(),
                            accountId: findAccount("131"),
                            debit: total,
                            credit: 0,
                            description: baseDesc,
                          });
                        if (preVat > 0)
                          newLines.push({
                            id: createClientId(),
                            accountId: findAccount("511") || findAccount("711"),
                            debit: 0,
                            credit: preVat,
                            description: baseDesc,
                          });
                        if (vat > 0)
                          newLines.push({
                            id: createClientId(),
                            accountId:
                              findAccount("3331") || findAccount("333"),
                            debit: 0,
                            credit: vat,
                            description: `Thuế GTGT ${detailInvoice?.invoiceNo || form?.invoiceNo}`,
                          });
                      }
                      return newLines;
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-1">
                <PostedAccountingSummary
                  isPosted={detailInvoice.postingStatus === "POSTED"}
                  journalEntryId={detailInvoice.journalEntryId}
                  postingDate={detailInvoice.postingDate}
                />
              </div>
            )}
          </div>
        ),
      },

      // 5. Tab Lịch sử & Kiểm duyệt (Audit Timeline)
      {
        key: "history",
        label: t("tabHistory", "Lịch sử & Kiểm duyệt"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
            <DrawerAuditTimeline
              items={auditItems}
              emptyLabel={t("Chưa có ghi nhận lịch sử.")}
            />
          </div>
        ),
      },
    ];
  }, [
    customTabs,
    detailInvoice,
    t,
    children,
    editMode,
    postingState,
    formAccountingEnabled,
    form?.branchId,
    form?.invoiceDate,
    form?.description,
    form?.invoiceNo,
    form?.preVatAmount,
    form?.vatAmount,
    form?.totalAmount,
    form?.sellerTaxCode,
    form?.pendingDocumentChanges,
    fieldSet,
    pendingUnpost,
    direction,
    onUnpost,
    onSyncDetail,
    handleFetchGraph,
    rightPanel,
    partnerViewMode,
    setSubTabKey,
    setShowNetOffModal,
    setShowPoModal,
    setShowSoModal,
    setShowGarageCaseModal,
    startEdit,
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
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        leftPanel={!resolvedDrawerTabs ? children : undefined}
        rightPanel={!resolvedDrawerTabs ? rightPanel : undefined}
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
