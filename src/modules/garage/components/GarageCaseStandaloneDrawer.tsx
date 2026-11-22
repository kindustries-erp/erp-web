import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { GarageCasePartnerTab } from "./GarageCasePartnerTab";
import { DrawerDocumentTraceability } from "@/shared/components/drawer/DrawerDocumentTraceability";
import { garageApi } from "../api/garageApi";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";
import { History, RefreshCw, ChevronDown, FileText, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { useGarageCaseDrawerLogic } from "./drawer/hooks/useGarageCaseDrawerLogic";
import { GarageCaseGeneralInfoSection } from "./drawer/sections/GarageCaseGeneralInfoSection";
import { GarageCaseDefaultAttributesSection } from "./drawer/sections/GarageCaseDefaultAttributesSection";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/organisms";
import { GarageCaseBusinessPerformanceSection } from "./drawer/sections/GarageCaseBusinessPerformanceSection";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";
import {
  resolveGarageAddLink,
  resolveGarageUnlink,
} from "@/v2/core/cases-garage";

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

  const effectiveBranchId =
    selectedCase?.branchExternalId || selectedBranchId || "";
  const customerCode = selectedCase?.khachHangCode;

  const { data: partnerCases = [] } = useQuery({
    queryKey: ["garage-cases-by-customer", effectiveBranchId, customerCode],
    queryFn: () => {
      if (!customerCode) return Promise.resolve([]);
      return garageApi.getCasesByCustomer(effectiveBranchId, customerCode);
    },
    enabled: Boolean(props.isOpen && customerCode),
    staleTime: 30000,
  });

  const partnerCasesCount = Array.isArray(partnerCases)
    ? partnerCases.length
    : 0;

  const financialsBadgeCount =
    (activeLinkedInvoices?.length || 0) + (activeSettlements?.length || 0);
  const linkedDocsBadgeCount =
    (activeLinkedInvoices?.length || 0) + (activeSettlements?.length || 0);

  const resolvedDrawerTabs = useMemo<DrawerTopTabItem[] | undefined>(() => {
    if (!selectedCase) return undefined;

    return [
      // 1. Tab Chi tiết (gồm 3 sub-tabs: Chi tiết báo giá | Tài chính | Chứng từ liên kết)
      {
        key: "quote_details",
        label: t("cases.drawer.tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        hideRightPanel: detailsSubTab === "linked_docs",
        rightPanel:
          detailsSubTab === "financials" ? (
            <GarageCaseFinancialsRightPanel
              caseId={selectedCase.id}
              caseCode={selectedCase.soChungTu}
              caseData={selectedCase}
              grossProfit={grossProfit}
            />
          ) : undefined,
        content: (
          <GarageCaseDetailsTab
            selectedCase={selectedCase}
            grossProfit={grossProfit}
            selectedBranchId={effectiveBranchId}
            viewMode={detailsSubTab}
            onViewModeChange={setDetailsSubTab}
            onSelectCase={handleSelectCase}
            financialsBadgeCount={financialsBadgeCount}
            linkedDocsBadgeCount={linkedDocsBadgeCount}
            financialsSlot={
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
            }
            linkedDocsSlot={
              <DrawerDocumentTraceability
                rootId={selectedCase.id}
                rootType="GARAGE_CASE"
                graphData={mergedGraphData}
                editMode={editMode}
                allowedDocTypes={[
                  "BANK_TXN",
                  "INVOICE",
                  "PURCHASE_ORDER",
                  "SALES_ORDER",
                ]}
                onEditManualSettlement={handleEditSettlementNode}
                onAddLink={(stageKey, docType) => {
                  const action = resolveGarageAddLink(stageKey, docType);
                  if (action === "ADD_INVOICE") handleOpenAddInvoice();
                  else if (action === "ADD_SETTLEMENT")
                    handleOpenAddSettlement("RECEIPT");
                  else
                    toast(
                      action === "PO_UNSUPPORTED"
                        ? t(
                            "cases.drawer.linkPoSoon",
                            "Tính năng ghép nối Đơn mua hàng PO đang được cập nhật.",
                          )
                        : t(
                            "cases.drawer.linkSoSoon",
                            "Tính năng ghép nối Đơn bán hàng SO đang được cập nhật.",
                          ),
                      { icon: "ℹ️" },
                    );
                }}
                onUnlinkNode={(node) => {
                  if (!editMode) {
                    toast.error(
                      t(
                        "cases.drawer.enterEditToUnlink",
                        "Vui lòng chuyển sang chế độ Chỉnh sửa trước khi gỡ liên kết chứng từ.",
                      ),
                    );
                    return;
                  }
                  const target = resolveGarageUnlink(
                    node as never,
                    activeSettlements as never,
                    activeLinkedInvoices as never,
                  );
                  if (target?.kind === "INVOICE")
                    removeLinkedInvoice(target.id);
                  else if (target?.kind === "SETTLEMENT")
                    removeSettlement(target.id);
                }}
              />
            }
          />
        ),
      },

      // 2. Tab Chi tiết theo Khách hàng
      {
        key: "customer_details",
        label: t("cases.drawer.tabCustomerDetails", "Chi tiết theo Khách hàng"),
        icon: <Users className="w-3.5 h-3.5" />,
        badgeCount: partnerCasesCount > 0 ? partnerCasesCount : undefined,
        content: (
          <GarageCasePartnerTab
            customerCode={selectedCase.khachHangCode}
            customerName={selectedCase.khachHangName}
            currentCaseCode={selectedCase.soChungTu}
            branchId={effectiveBranchId}
            onSelectCase={handleSelectCase}
          />
        ),
      },

      // 3. Tab Lịch sử & Đồng bộ
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
    effectiveBranchId,
    detailsSubTab,
    setDetailsSubTab,
    handleSelectCase,
    financialsBadgeCount,
    linkedDocsBadgeCount,
    editMode,
    startEdit,
    activeSettlements,
    activeLinkedInvoices,
    activeSummary,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    mergedGraphData,
    handleEditSettlementNode,
    handleOpenAddInvoice,
    handleOpenAddSettlement,
    partnerCasesCount,
    auditItems,
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
            <div className="space-y-4 px-2 w-full">
              <V2Skeleton className="h-48 w-full rounded-lg" />
              <V2Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ) : undefined
        }
        rightPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 px-2 w-full">
              <V2Skeleton className="h-20 w-full rounded-lg" />
              <V2Skeleton className="h-40 w-full rounded-lg" />
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
