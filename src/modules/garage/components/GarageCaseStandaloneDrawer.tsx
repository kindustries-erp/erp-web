import React, { useMemo } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { useTranslation } from "react-i18next";
import {
  GarageCaseDetailsTab,
  type GarageCaseDetailViewMode,
} from "./garage-case-details-tab";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { GarageCaseSettlementDrawerModal } from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import {
  GarageCaseFinancialsTab,
  GarageCaseFinancialsRightPanel,
  GarageCaseFinancialsProvider,
} from "./GarageCaseFinancialsTab";
import { DrawerDocumentTraceability } from "@/shared/components/drawer/DrawerDocumentTraceability";
import { garageApi } from "../api/garageApi";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";
import {
  Link2,
  History,
  RefreshCw,
  ChevronDown,
  Wallet,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGarageCaseDrawerLogic } from "./drawer/hooks/useGarageCaseDrawerLogic";
import { GarageCaseGeneralInfoSection } from "./drawer/sections/GarageCaseGeneralInfoSection";
import { GarageCaseDefaultAttributesSection } from "./drawer/sections/GarageCaseDefaultAttributesSection";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/organisms";
import { GarageCaseBusinessPerformanceSection } from "./drawer/sections/GarageCaseBusinessPerformanceSection";

export interface GarageCaseStandaloneDrawerProps {
  isOpen: boolean;
  caseCode?: string | null;
  initialEditMode?: boolean;
  initialTabKey?: string;
  initialSubTabKey?: GarageCaseDetailViewMode;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageCaseStandaloneDrawer(
  props: GarageCaseStandaloneDrawerProps,
) {
  const { t } = useTranslation(["garage", "common"]);
  const logic = useGarageCaseDrawerLogic(props);
  const {
    selectedBranchId,
    selectedCase,
    isLoadingCase,
    refetchCase,
    syncCaseDetail,
    isSyncingDetail,
    grossProfit,
    canUpdateGarage,
    editMode,
    startEdit,
    saving,
    totalHasPendingChanges,
    draftCategoryId,
    setDraftCategoryId,
    draftExcludeFromReports,
    setDraftExcludeFromReports,
    draftExcludeFromDebt,
    setDraftExcludeFromDebt,
    draftErpNotes,
    setDraftErpNotes,
    draftAttributes,
    setDraftAttributes,
    draftGlobalAttributes,
    setDraftGlobalAttributes,
    handleCancel,
    handleSaveAll,
    activeTabKey,
    setActiveTabKey,
    detailsSubTab,
    setDetailsSubTab,
    handleSelectCase,
    activeSettlements,
    activeLinkedInvoices,
    activeSummary,
    mergedGraphData,
    auditItems,
    showSettlementModal,
    setShowSettlementModal,
    settlementModalType,
    editingSettlementItem,
    setEditingSettlementItem,
    showInvoiceModal,
    setShowInvoiceModal,
    handleOpenAddSettlement,
    handleOpenAddInvoice,
    handleEditSettlementNode,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    queryClient,
  } = logic;

  let footerLeft: React.ReactNode = undefined;
  if (!editMode) {
    const dropdownItems: ActionDropdownItem[] = [
      {
        groupLabel: "ĐỒNG BỘ",
        items: [
          {
            label: t("cases.actions.syncDetails", "Đồng bộ chi tiết từ KGara"),
            icon: (
              <RefreshCw
                className={`w-4 h-4 ${isSyncingDetail ? "animate-spin" : ""}`}
              />
            ),
            onClick: () => {
              if (selectedBranchId && selectedCase?.hdPhieuDichVuId) {
                syncCaseDetail({
                  branchId: selectedBranchId,
                  caseId: selectedCase.hdPhieuDichVuId,
                });
              }
            },
            disabled:
              isSyncingDetail ||
              !selectedBranchId ||
              !selectedCase?.hdPhieuDichVuId,
          },
        ],
      },
    ];

    footerLeft = (
      <ActionDropdown
        align="start"
        items={dropdownItems}
        customTrigger={
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[color:var(--border)] bg-white hover:bg-[color:var(--bg-muted)] text-[color:var(--fg)] shadow-sm transition-colors cursor-pointer"
          >
            <span className="font-semibold text-[color:var(--fg)]">
              {t("common:actions", "Thao tác")}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[color:var(--faint)]" />
          </button>
        }
      />
    );
  }

  const editActions = [
    {
      label: t("common:cancel", "Hủy"),
      variant: "outline" as const,
      disabled: saving,
      onClick: handleCancel,
    },
    {
      label: saving
        ? t("common:saving", "Đang lưu...")
        : t("common:saveChanges", "Lưu thay đổi"),
      primary: true,
      loading: saving,
      disabled: saving || !totalHasPendingChanges,
      onClick: handleSaveAll,
    },
  ];

  const resolvedDrawerTabs = useMemo<DrawerTopTabItem[] | undefined>(() => {
    if (!selectedCase) return undefined;

    return [
      {
        key: "quote_details",
        label: t("cases.drawer.tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <GarageCaseDetailsTab
            selectedCase={selectedCase}
            grossProfit={grossProfit}
            selectedBranchId={selectedCase.branchExternalId || selectedBranchId}
            viewMode={detailsSubTab}
            onViewModeChange={setDetailsSubTab}
            onSelectCase={handleSelectCase}
          />
        ),
      },
      {
        key: "financials",
        label: t("cases.drawer.financials", "Tài chính"),
        icon: <Wallet className="w-3.5 h-3.5" />,
        badgeCount:
          (activeLinkedInvoices?.length || 0) +
          (activeSettlements?.length || 0),
        content: (
          <GarageCaseFinancialsTab
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            caseData={selectedCase}
            grossProfit={grossProfit}
            editMode={editMode}
            onStartEdit={startEdit}
            activeSettlements={activeSettlements}
            activeLinkedInvoices={activeLinkedInvoices}
            activeSummary={activeSummary}
            onAddSettlement={addSettlements}
            onRemoveSettlement={removeSettlement}
            onAddInvoice={addLinkedInvoice}
            onRemoveInvoice={removeLinkedInvoice}
          />
        ),
        rightPanel: (
          <GarageCaseFinancialsRightPanel
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            caseData={selectedCase}
            grossProfit={grossProfit}
          />
        ),
      },
      {
        key: "linked_docs",
        label: t("cases.drawer.linkedDocs", "Chứng từ liên kết"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount:
          (activeLinkedInvoices?.length || 0) +
          (activeSettlements?.length || 0),
        hideRightPanel: true,
        content: (
          <DrawerDocumentTraceability
            rootId={selectedCase.id}
            rootType="GARAGE_CASE"
            graphData={mergedGraphData}
            fetchGraph={(id) => garageApi.getCaseTraceabilityGraph(id)}
            editMode={editMode}
            allowedDocTypes={[
              "BANK_TXN",
              "INVOICE",
              "PURCHASE_ORDER",
              "SALES_ORDER",
            ]}
            onEditManualSettlement={handleEditSettlementNode}
            onAddLink={(stageKey, docType) => {
              if (docType === "INVOICE" || stageKey === "INVOICE") {
                handleOpenAddInvoice();
              } else if (docType === "BANK_TXN" || stageKey === "PAYMENT") {
                handleOpenAddSettlement("RECEIPT");
              } else if (
                docType === "PURCHASE_ORDER" ||
                stageKey === "ORDER_STOCK"
              ) {
                toast(
                  "Tính năng ghép nối Đơn mua hàng PO đang được cập nhật.",
                  { icon: "ℹ️" },
                );
              } else if (docType === "SALES_ORDER") {
                toast(
                  "Tính năng ghép nối Đơn bán hàng SO đang được cập nhật.",
                  { icon: "ℹ️" },
                );
              } else {
                handleOpenAddSettlement("RECEIPT");
              }
            }}
            onUnlinkNode={async (node) => {
              try {
                if (editMode) {
                  if (node.docType === "INVOICE") {
                    const target = activeLinkedInvoices.find(
                      (l: any) =>
                        l.invoiceId === node.id ||
                        l.id === node.id ||
                        l.invoice?.id === node.id,
                    );
                    if (target) {
                      removeLinkedInvoice(target.id || target.tempId);
                    }
                  } else if (node.docType === "BANK_TXN") {
                    const target = activeSettlements.find(
                      (s: any) =>
                        s.bank_transaction_id === node.id ||
                        s.bankTransactionId === node.id ||
                        s.id === node.id ||
                        s.tempId === node.id ||
                        `manual-${s.id}` === node.id,
                    );
                    if (target) {
                      removeSettlement(target.id || target.tempId);
                    }
                  }
                } else {
                  toast.error(
                    t(
                      "cases.drawer.enterEditToUnlink",
                      "Vui lòng chuyển sang chế độ Chỉnh sửa trước khi gỡ liên kết chứng từ.",
                    ),
                  );
                }
              } catch (err: any) {
                toast.error(
                  err?.response?.data?.message || "Lỗi khi hủy liên kết",
                );
              }
            }}
          />
        ),
      },
      {
        key: "sync_history",
        label: t("cases.drawer.syncHistory", "Lịch sử & Đồng bộ"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
            <DrawerAuditTimeline
              items={auditItems}
              emptyLabel={t(
                "cases.drawer.noAuditLogs",
                "Chưa có ghi nhận lịch sử.",
              )}
            />
          </div>
        ),
      },
    ];
  }, [
    selectedCase,
    grossProfit,
    selectedBranchId,
    activeLinkedInvoices,
    activeSettlements,
    activeSummary,
    editMode,
    startEdit,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    mergedGraphData,
    handleEditSettlementNode,
    handleOpenAddInvoice,
    handleOpenAddSettlement,
    auditItems,
    detailsSubTab,
    setDetailsSubTab,
    handleSelectCase,
    refetchCase,
    queryClient,
    t,
  ]);

  return (
    <GarageCaseFinancialsProvider
      caseId={selectedCase?.id || ""}
      caseCode={selectedCase?.soChungTu || ""}
      caseData={selectedCase}
      editMode={editMode}
      onStartEdit={canUpdateGarage ? startEdit : undefined}
      activeSettlements={activeSettlements}
      activeLinkedInvoices={activeLinkedInvoices}
      activeSummary={activeSummary}
      onAddSettlement={addSettlements}
      onRemoveSettlement={removeSettlement}
      onAddInvoice={addLinkedInvoice}
      onRemoveInvoice={removeLinkedInvoice}
    >
      <StandardFormDrawer
        open={props.isOpen}
        mode={editMode ? "edit" : "view"}
        onToggleEdit={!editMode && canUpdateGarage ? startEdit : undefined}
        confirmOnClose={editMode}
        onClose={props.onClose}
        collapsibleRightPanel={true}
        title={`${t("cases.drawer.caseDetails", "Sổ báo giá:")} ${selectedCase?.soChungTu || ""}`}
        titleExtra={
          selectedCase?.tenTinhTrangDichVu ? (
            <KgaraCaseStatusBadge status={selectedCase.tenTinhTrangDichVu} />
          ) : undefined
        }
        footerLeft={footerLeft}
        actions={editMode ? editActions : undefined}
        tabs={resolvedDrawerTabs}
        activeTabKey={activeTabKey}
        onTabChange={setActiveTabKey}
        defaultTabKey="quote_details"
        leftPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 animate-pulse px-2 w-full">
              <div className="h-48 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-64 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ) : undefined
        }
        rightPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 animate-pulse px-2 w-full">
              <div className="h-20 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-40 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ) : selectedCase ? (
            <div className="space-y-3 pb-3">
              <GarageCaseGeneralInfoSection
                caseData={selectedCase}
                editMode={editMode}
                erpNotes={draftErpNotes}
                onErpNotesChange={setDraftErpNotes}
              />
              <GarageCaseDefaultAttributesSection
                caseData={selectedCase}
                editMode={editMode}
                categoryId={draftCategoryId}
                onCategoryChange={setDraftCategoryId}
                excludeFromReports={draftExcludeFromReports}
                onExcludeFromReportsChange={setDraftExcludeFromReports}
                excludeFromDebt={draftExcludeFromDebt}
                onExcludeFromDebtChange={setDraftExcludeFromDebt}
                onStartEdit={canUpdateGarage ? startEdit : undefined}
              />
              <ModuleEntityCustomFieldsSection
                moduleKey="GARAGE_CASE"
                entityId={selectedCase.id}
                editMode={editMode}
                categoryId={draftCategoryId}
                onCategoryChange={setDraftCategoryId}
                attributes={draftAttributes}
                onAttributesChange={setDraftAttributes}
                globalAttributes={draftGlobalAttributes}
                onGlobalAttributesChange={setDraftGlobalAttributes}
                includeSystemAttributes={false}
                hideCategorySection={true}
                globalTitle={t(
                  "cases.drawer.customAttributes",
                  "Thuộc tính tùy chỉnh",
                )}
              />
              <GarageCaseBusinessPerformanceSection
                caseData={selectedCase}
                grossProfit={grossProfit}
              />
            </div>
          ) : null
        }
      />

      {selectedCase && (
        <>
          <GarageCaseSettlementDrawerModal
            open={showSettlementModal}
            onClose={() => {
              setShowSettlementModal(false);
              setEditingSettlementItem(null);
            }}
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            defaultType={settlementModalType}
            editingItem={editingSettlementItem}
            suggestedAmount={
              settlementModalType === "RECEIPT"
                ? activeSummary?.breakdown?.receipts?.remainingReceivable || 0
                : activeSummary?.breakdown?.payments?.remainingPayable || 0
            }
            remainingReceivable={
              activeSummary?.breakdown?.receipts?.remainingReceivable || 0
            }
            remainingPayable={
              activeSummary?.breakdown?.payments?.remainingPayable || 0
            }
            existingTxnIds={
              activeSettlements
                ?.map((s: any) => s.bank_transaction_id || s.bankTransactionId)
                .filter(Boolean) || []
            }
            onSubmit={async (items) => {
              if (editMode) {
                if (editingSettlementItem?.id) {
                  removeSettlement(editingSettlementItem.id);
                }
                addSettlements(items);
              } else {
                if (editingSettlementItem?.id) {
                  await garageApi.removeCaseSettlement(
                    selectedCase.id,
                    editingSettlementItem.id,
                  );
                }
                for (const item of items) {
                  await garageApi.addCaseSettlement(selectedCase.id, item);
                }
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-financial-summary", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-settlements", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-traceability-graph", selectedCase.id],
                });
                toast.success(
                  editingSettlementItem
                    ? "Đã cập nhật giao dịch thành công"
                    : "Đã ghi nhận giao dịch thành công",
                );
              }
            }}
          />

          <InvoiceSelectionDrawer
            open={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            defaultLinkType="OUT"
            onSubmit={async (payloads) => {
              const items = Array.isArray(payloads) ? payloads : [payloads];
              if (editMode) {
                addLinkedInvoice(items);
              } else {
                if (items.length === 1) {
                  await garageApi.addCaseLinkedInvoice(
                    selectedCase.id,
                    items[0].invoiceId,
                    items[0].linkType,
                    items[0].note,
                  );
                } else if (items.length > 1) {
                  await garageApi.addCaseLinkedInvoices(
                    selectedCase.id,
                    items.map((i) => ({
                      invoiceId: i.invoiceId,
                      linkType: i.linkType,
                      note: i.note,
                    })),
                  );
                }
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-financial-summary", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-linked-invoices", selectedCase.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["garage-case-traceability-graph", selectedCase.id],
                });
                toast.success(
                  items.length > 1
                    ? `Đã liên kết thành công ${items.length} hóa đơn`
                    : "Đã liên kết hóa đơn thành công",
                );
              }
            }}
          />
        </>
      )}
    </GarageCaseFinancialsProvider>
  );
}
