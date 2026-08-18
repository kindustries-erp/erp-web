import React, { useEffect } from "react";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCaseGrossProfit,
  useSyncGarageCaseDetail,
  useGarageCaseByCode,
} from "../hooks/useGarage";
import { useGarageCaseEditForm } from "../hooks/useGarageCaseEditForm";
import { GarageCasePreview } from "./GarageCasePreview";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { GarageCaseSettlementSection } from "./GarageCaseSettlementSection";
import { DrawerDocumentTraceability } from "@/shared/components/drawer/DrawerDocumentTraceability";
import { garageApi } from "../api/garageApi";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";
import { Wallet, Link2, History, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface GarageCaseStandaloneDrawerProps {
  isOpen: boolean;
  caseCode?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageCaseStandaloneDrawer({
  isOpen,
  caseCode,
  onClose,
}: GarageCaseStandaloneDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();

  const { data: selectedCase, isLoading: isLoadingCase } = useGarageCaseByCode(
    isOpen && caseCode ? caseCode : undefined,
  );

  const { mutate: syncCaseDetail, isPending: isSyncingDetail } =
    useSyncGarageCaseDetail();

  const { data: grossProfit } = useGarageCaseGrossProfit(caseCode || undefined);

  // 1. Fetch Financial Summary
  const { data: serverSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", selectedCase?.id],
    queryFn: () => garageApi.getCaseFinancialSummary(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // 2. Fetch Direct Settlements
  const { data: serverSettlements } = useQuery({
    queryKey: ["garage-case-settlements", selectedCase?.id],
    queryFn: () => garageApi.getCaseSettlements(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // 3. Fetch Linked Invoices
  const { data: serverLinkedInvoices } = useQuery({
    queryKey: ["garage-case-linked-invoices", selectedCase?.id],
    queryFn: () => garageApi.getCaseLinkedInvoices(selectedCase!.id),
    enabled: isOpen && !!selectedCase?.id,
  });

  // Client-side edit state and batch save hook
  const {
    editMode,
    startEdit,
    cancelEdit,
    saving,
    hasPendingChanges,
    addSettlements,
    removeSettlement,
    addLinkedInvoice,
    removeLinkedInvoice,
    handleSave,
    getActiveSettlements,
    getActiveLinkedInvoices,
    getActiveFinancialSummary,
  } = useGarageCaseEditForm(selectedCase?.id);

  // Reset state when caseId changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      cancelEdit();
    }
  }, [isOpen, caseCode, cancelEdit]);

  const activeSettlements = getActiveSettlements(serverSettlements);
  const activeLinkedInvoices = getActiveLinkedInvoices(serverLinkedInvoices);
  const activeSummary = getActiveFinancialSummary(
    serverSummary,
    activeSettlements,
  );

  const refreshAllData = () => {
    if (selectedCase?.id) {
      queryClient.invalidateQueries({
        queryKey: ["garage-case-financial-summary", selectedCase.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-case-settlements", selectedCase.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-case-linked-invoices", selectedCase.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-case-traceability-graph", selectedCase.id],
      });
    }
  };

  // Dropdown menu items for the left side of the footer (View mode only)
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
      onClick: cancelEdit,
    },
    {
      label: saving
        ? t("common:saving", "Đang lưu...")
        : t("common:saveChanges", "Lưu thay đổi"),
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: () => handleSave(selectedCase?.id),
    },
  ];

  let resolvedRelatedTabs = undefined;

  if (selectedCase) {
    const auditItems: DrawerAuditLogItem[] = [];

    // 1. Tiếp nhận xe & Khởi tạo phiếu
    if (selectedCase.ngayPhatSinh || selectedCase.createdAt) {
      auditItems.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: t(
          "cases.drawer.auditCreated",
          "Tiếp nhận xe & Khởi tạo phiếu",
        ),
        actorName: selectedCase.rawData?.NhanVienTiepNhanName || "KGara",
        timestamp: selectedCase.ngayPhatSinh || selectedCase.createdAt,
        message: `${selectedCase.soChungTu || ""} - ${selectedCase.bienSoXe || ""} (${selectedCase.khachHangName || "Khách hàng"})`,
      });
    }

    // 2. Bắt đầu sửa chữa (nếu có)
    const startDate =
      selectedCase.ngayBatDauSuaChua || selectedCase.rawData?.NgayBatDauSuaChua;
    if (startDate) {
      auditItems.push({
        id: "start_repair",
        actionType: "SYNC",
        actionLabel: t("cases.drawer.auditStartRepair", "Bắt đầu sửa chữa"),
        timestamp: startDate,
        message: t(
          "cases.drawer.auditStartRepairMsg",
          "Xe bắt đầu đưa vào quy trình sửa chữa & bảo dưỡng tại xưởng",
        ),
      });
    }

    // 3. Nghiệm thu & Kết thúc sửa chữa (nếu có)
    const completionDate =
      selectedCase.ngayHoanThanhCongViec || selectedCase.rawData?.NgayKetThuc;
    if (completionDate) {
      auditItems.push({
        id: "completed_repair",
        actionType: "APPROVE",
        actionLabel: t(
          "cases.drawer.auditCompletedRepair",
          "Nghiệm thu & Kết thúc sửa chữa",
        ),
        timestamp: completionDate,
        message: t(
          "cases.drawer.auditCompletedRepairMsg",
          "Xe đã hoàn thành toàn bộ hạng mục kỹ thuật và nghiệm thu xuất xưởng",
        ),
      });
    }

    // 4. Bàn giao xe (nếu có)
    const deliveryDate =
      selectedCase.ngayGiaoXe || selectedCase.rawData?.NgayGiaoXe;
    if (deliveryDate) {
      auditItems.push({
        id: "delivered",
        actionType: "DONE",
        actionLabel: t("cases.drawer.auditDelivered", "Bàn giao xe cho khách"),
        timestamp: deliveryDate,
        message: t(
          "cases.drawer.auditDeliveredMsg",
          "Đã bàn giao xe cho khách hàng / đại diện bảo hiểm",
        ),
      });
    }

    // 5. Đồng bộ từ KGara
    if (selectedCase.updatedAt) {
      auditItems.push({
        id: "synced",
        actionType: "SYNC",
        actionLabel: t("cases.drawer.auditSyncKgara", "Đồng bộ dữ liệu KGara"),
        timestamp: selectedCase.updatedAt,
        message: `${t("cases.drawer.refCode", "Mã tham chiếu:")} #${selectedCase.hdPhieuDichVuId || "---"}`,
      });
    }

    // 6. Các hóa đơn VAT liên kết
    (activeLinkedInvoices || []).forEach((inv: any, idx: number) => {
      const invDate = inv.createdAt || inv.invoiceDate;
      if (invDate) {
        const isOut = inv.linkType === "OUT" || inv.direction === "OUT";
        auditItems.push({
          id: `inv-${inv.id || idx}`,
          actionType: "INSERT",
          actionLabel: isOut
            ? t("cases.drawer.auditInvOut", "Liên kết HĐ Bán ra")
            : t("cases.drawer.auditInvIn", "Liên kết HĐ Mua vào"),
          timestamp: invDate,
          message: `Số HĐ: ${inv.invoiceNo || "---"} (${money(Number(inv.totalAmount || 0))})`,
        });
      }
    });

    // 7. Các giao dịch dòng tiền
    (activeSettlements || []).forEach((s: any, idx: number) => {
      const sDate = s.trans_date || s.transDate || s.created_at || s.createdAt;
      if (sDate) {
        const isReceipt =
          s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
        const isOnSystem =
          s.source_channel === "ON_SYSTEM" || s.sourceChannel === "ON_SYSTEM";
        auditItems.push({
          id: `settle-${s.id || idx}`,
          actionType: isReceipt ? "APPROVE" : "CONFIRM",
          actionLabel: isReceipt
            ? t("cases.drawer.auditReceipt", "Ghi nhận Thu tiền")
            : t("cases.drawer.auditPayment", "Ghi nhận Chi tiền"),
          timestamp: sDate,
          message: `${isOnSystem ? "Sao kê ERP" : "Ngoài sổ sách"}: ${money(Number(s.amount || 0))} ${s.referenceNumber ? `(#${s.referenceNumber})` : ""}`,
        });
      }
    });

    // Sắp xếp giảm dần theo thời gian (mới nhất lên trước)
    auditItems.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return isNaN(timeB) ? -1 : isNaN(timeA) ? 1 : timeB - timeA;
    });

    resolvedRelatedTabs = [
      // Tab 1: Trung tâm Trực quan hóa Mạng lưới Chứng từ (Visualization Hub)
      {
        key: "linked_docs",
        label: t("cases.drawer.linkedDocs", "Mạng lưới chứng từ"),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount:
          (activeLinkedInvoices?.length || 0) +
          (activeSettlements?.length || 0),
        flush: true,
        content: (
          <DrawerDocumentTraceability
            rootId={selectedCase.id}
            rootType="GARAGE_CASE"
            fetchGraph={(id) => garageApi.getCaseTraceabilityGraph(id)}
            editMode={editMode}
            allowedDocTypes={["PURCHASE_ORDER", "SALES_ORDER"]}
            onEditManualSettlement={(node) => {
              window.dispatchEvent(
                new CustomEvent("open_manual_settlement_editor", {
                  detail: { node },
                }),
              );
            }}
            onAddLink={(stageKey, docType) => {
              if (docType === "PURCHASE_ORDER" || stageKey === "ORDER_STOCK") {
                toast(
                  "Tính năng ghép nối Đơn mua hàng PO đang được cập nhật.",
                  { icon: "ℹ️" },
                );
              } else {
                toast(
                  "Vui lòng chuyển sang tab 'Dòng tiền & Hóa đơn đối soát' để liên kết Hóa đơn và Cấn trừ sao kê.",
                  { icon: "💡" },
                );
              }
            }}
            onUnlinkNode={async (node) => {
              try {
                if (editMode) {
                  if (node.docType === "INVOICE") {
                    const target = activeLinkedInvoices.find(
                      (l: any) => l.invoiceId === node.id || l.id === node.id,
                    );
                    if (target) {
                      removeLinkedInvoice(target.id);
                    }
                  } else if (node.docType === "BANK_TXN") {
                    const target = activeSettlements.find(
                      (s: any) =>
                        s.bank_transaction_id === node.id ||
                        s.id === node.id ||
                        `manual-${s.id}` === node.id,
                    );
                    if (target) {
                      removeSettlement(target.id);
                    }
                  }
                } else {
                  if (node.docType === "INVOICE") {
                    const links = await garageApi.getCaseLinkedInvoices(
                      selectedCase.id,
                    );
                    const target = links.find(
                      (l: any) => l.invoiceId === node.id,
                    );
                    if (target) {
                      await garageApi.removeCaseLinkedInvoice(
                        selectedCase.id,
                        target.id,
                      );
                      toast.success("Đã hủy liên kết hóa đơn");
                    }
                  } else if (node.docType === "BANK_TXN") {
                    const settlements = await garageApi.getCaseSettlements(
                      selectedCase.id,
                    );
                    const target = settlements.find(
                      (s: any) =>
                        s.bank_transaction_id === node.id ||
                        `manual-${s.id}` === node.id,
                    );
                    if (target) {
                      await garageApi.removeCaseSettlement(
                        selectedCase.id,
                        target.id,
                      );
                      toast.success("Đã xóa giao dịch thanh toán");
                    }
                  }
                  refreshAllData();
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

      // Tab 2: Trung tâm Thao tác Nghiệp vụ Dòng tiền & Hóa đơn (Financial Operations Hub)
      {
        key: "cashflow_reconciliation",
        label: t(
          "cases.drawer.cashflowReconciliation",
          "Dòng tiền & Hóa đơn đối soát",
        ),
        icon: <Wallet className="w-3.5 h-3.5" />,
        badgeCount:
          (activeLinkedInvoices?.length || 0) +
          (activeSettlements?.length || 0),
        cardClassName: "p-3 max-h-[520px] overflow-hidden",
        content: (
          <div className="max-h-[490px] overflow-y-auto pr-1">
            <GarageCaseSettlementSection
              caseId={selectedCase.id}
              caseCode={selectedCase.soChungTu}
              isCompleted={selectedCase.tinhTrangDichVu === 3}
              editMode={editMode}
              activeSettlements={activeSettlements}
              activeLinkedInvoices={activeLinkedInvoices}
              activeSummary={activeSummary}
              onAddSettlement={addSettlements}
              onRemoveSettlement={removeSettlement}
              onAddInvoice={addLinkedInvoice}
              onRemoveInvoice={removeLinkedInvoice}
            />
          </div>
        ),
      },

      // Tab 3: Lịch sử & Đồng bộ dữ liệu KGara (DrawerAuditTimeline)
      {
        key: "sync_history",
        label: t("cases.drawer.syncHistory", "Lịch sử & Đồng bộ"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        cardClassName: "p-3 max-h-[480px] overflow-hidden",
        content: (
          <div className="max-h-[450px] overflow-y-auto pr-1 py-1">
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
  }

  return (
    <StandardFormDrawer
      open={isOpen}
      mode={editMode ? "edit" : "view"}
      onToggleEdit={!editMode ? startEdit : undefined}
      confirmOnClose={editMode && hasPendingChanges}
      onClose={onClose}
      collapsibleRightPanel={true}
      title={`${t("cases.drawer.caseDetails", "Sổ báo giá:")} ${selectedCase?.soChungTu || ""}`}
      titleExtra={
        <KgaraCaseStatusBadge status={selectedCase?.tenTinhTrangDichVu} />
      }
      footerLeft={footerLeft}
      actions={editMode ? editActions : undefined}
      leftPanel={
        isLoadingCase || isSyncingDetail ? (
          <div className="space-y-4 animate-pulse px-2 w-full">
            <div className="h-48 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-64 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ) : selectedCase ? (
          <div className="space-y-4">
            <GarageCasePreview
              caseData={selectedCase}
              grossProfit={grossProfit}
            />
          </div>
        ) : null
      }
      rightPanel={
        isLoadingCase || isSyncingDetail ? (
          <div className="space-y-4 animate-pulse px-2 w-full">
            <div className="h-20 bg-slate-100 rounded-lg w-full"></div>
            <div className="h-40 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ) : selectedCase ? (
          <div className="space-y-3 pb-3">
            {/* 1. THÔNG TIN CHUNG */}
            <DrawerSection
              title={t("cases.drawer.generalInfo", "Thông tin chung")}
              collapsible
              defaultCollapsed={false}
            >
              <DrawerRow
                label={t("cases.drawer.caseCode", "Số chứng từ")}
                value={selectedCase.soChungTu}
              />
              <DrawerRow
                label={t("cases.drawer.plate", "Biển số xe")}
                value={selectedCase.bienSoXe}
              />
              <DrawerRow
                label={t("cases.drawer.customer", "Khách hàng")}
                value={selectedCase.khachHangName}
              />
              <DrawerRow
                label={t("cases.drawer.serviceStatus", "Trạng thái")}
                value={selectedCase.tenTinhTrangDichVu}
              />
              <DrawerRow
                label={t("cases.drawer.creationDate", "Ngày phát sinh")}
                value={formatGMT7(selectedCase.ngayPhatSinh, "date")}
              />
            </DrawerSection>

            {/* 2. HIỆU QUẢ KINH DOANH & LỢI NHUẬN GỘP */}
            {(() => {
              const revenueAmount = Number(
                grossProfit?.DoanhThu ??
                  selectedCase.doanhThu ??
                  selectedCase.rawData?.DoanhThu ??
                  selectedCase.rawData?.TongTienHang ??
                  0,
              );
              const totalCostAmount = Number(
                grossProfit?.ChiPhi ??
                  selectedCase.chiPhi ??
                  selectedCase.rawData?.ChiPhi ??
                  0,
              );
              const grossProfitAmount = Number(
                grossProfit?.LoiNhuan ??
                  selectedCase.loiNhuan ??
                  selectedCase.rawData?.LoiNhuan ??
                  revenueAmount - totalCostAmount,
              );
              const profitMargin =
                grossProfit?.BienLoiNhuan != null
                  ? Number(grossProfit.BienLoiNhuan)
                  : revenueAmount > 0
                    ? Number(
                        ((grossProfitAmount / revenueAmount) * 100).toFixed(1),
                      )
                    : 0;

              if (
                revenueAmount === 0 &&
                totalCostAmount === 0 &&
                !grossProfit
              ) {
                return null;
              }

              return (
                <DrawerSection
                  title={t(
                    "cases.drawer.businessPerformance",
                    "Hiệu quả kinh doanh & Lợi nhuận",
                  )}
                  collapsible
                  defaultCollapsed={false}
                >
                  <DrawerRow
                    label={t(
                      "cases.drawer.preTaxRevenue",
                      "Doanh thu (chưa thuế)",
                    )}
                    value={money(revenueAmount)}
                  />
                  <DrawerRow
                    label={t("cases.drawer.totalCost", "Tổng chi phí vụ việc")}
                    cls="text-slate-700 dark:text-slate-300 font-medium"
                    value={money(totalCostAmount)}
                  />
                  {Number(grossProfit?.GiaVonPhuTung || 0) > 0 && (
                    <DrawerRow
                      label={t("cases.drawer.partCost", "↳ Giá vốn phụ tùng")}
                      cls="text-xs text-slate-500 pl-2"
                      value={money(Number(grossProfit.GiaVonPhuTung))}
                    />
                  )}
                  {Number(grossProfit?.ChiPhiGiaCongNgoai || 0) > 0 && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.subcontractCost",
                        "↳ Gia công ngoài",
                      )}
                      cls="text-xs text-slate-500 pl-2"
                      value={money(Number(grossProfit.ChiPhiGiaCongNgoai))}
                    />
                  )}
                  {Number(grossProfit?.ChiPhiHoaHongGDV || 0) > 0 && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.commissionSurveyor",
                        "↳ Hoa hồng Giám định viên",
                      )}
                      cls="text-xs text-slate-500 pl-2"
                      value={money(Number(grossProfit.ChiPhiHoaHongGDV))}
                    />
                  )}
                  {Number(grossProfit?.ChiPhiHoaHongMG || 0) > 0 && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.commissionBroker",
                        "↳ Hoa hồng Môi giới",
                      )}
                      cls="text-xs text-slate-500 pl-2"
                      value={money(Number(grossProfit.ChiPhiHoaHongMG))}
                    />
                  )}
                  <DrawerRow
                    label={t("cases.drawer.grossProfit", "Lợi nhuận gộp")}
                    cls="text-emerald-600 font-bold"
                    value={money(grossProfitAmount)}
                  />
                  {revenueAmount > 0 && (
                    <DrawerRow
                      label={t("cases.drawer.profitMargin", "Biên lợi nhuận")}
                      cls={
                        profitMargin >= 0
                          ? "text-emerald-600 font-bold font-mono"
                          : "text-rose-600 font-bold font-mono"
                      }
                      value={`${profitMargin >= 0 ? "+" : ""}${profitMargin}%`}
                    />
                  )}
                  {grossProfit?.LoiNhuanCoThue != null && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.grossProfitTax",
                        "Lợi nhuận gộp có thuế",
                      )}
                      cls="text-emerald-700 font-semibold"
                      value={money(Number(grossProfit.LoiNhuanCoThue || 0))}
                    />
                  )}
                </DrawerSection>
              );
            })()}

            {/* 3. TÀI CHÍNH & CÔNG NỢ ERP (THU & CHI) */}
            {(() => {
              const totalPayableAmount = Number(
                selectedCase.tienCoThue ||
                  selectedCase.rawData?.TongTienThanhToan ||
                  activeSummary?.targetRevenue ||
                  0,
              );
              const erpTotalCollected = Number(
                activeSummary?.breakdown?.receipts?.totalCollected || 0,
              );
              const erpBankCollected = Number(
                (activeSummary?.breakdown?.receipts?.directReceiptOnSystem ||
                  0) +
                  (activeSummary?.breakdown?.receipts?.invoiceCollected || 0),
              );
              const erpCashCollected = Number(
                activeSummary?.breakdown?.receipts?.directReceiptOffSystem || 0,
              );
              const erpRemaining = Math.max(
                0,
                totalPayableAmount - erpTotalCollected,
              );
              const isSettled = erpRemaining === 0 && totalPayableAmount > 0;
              const collectionPercent =
                totalPayableAmount > 0
                  ? Math.min(
                      Math.round(
                        (erpTotalCollected / totalPayableAmount) * 100,
                      ),
                      999,
                    )
                  : erpTotalCollected > 0
                    ? 100
                    : 0;

              const targetCostAmount = Number(
                grossProfit?.ChiPhi ??
                  selectedCase.chiPhi ??
                  selectedCase.rawData?.ChiPhi ??
                  activeSummary?.targetCost ??
                  0,
              );
              const erpTotalPaid = Number(
                activeSummary?.breakdown?.payments?.totalPaid || 0,
              );
              const erpBankPaid = Number(
                (activeSummary?.breakdown?.payments?.directPaymentOnSystem ||
                  0) + (activeSummary?.breakdown?.payments?.invoicePaid || 0),
              );
              const erpCashPaid = Number(
                activeSummary?.breakdown?.payments?.directPaymentOffSystem || 0,
              );
              const erpRemainingPayable = Math.max(
                0,
                targetCostAmount - erpTotalPaid,
              );
              const paymentPercent =
                targetCostAmount > 0
                  ? Math.min(
                      Math.round((erpTotalPaid / targetCostAmount) * 100),
                      999,
                    )
                  : erpTotalPaid > 0
                    ? 100
                    : 0;
              const isPaidFull =
                erpRemainingPayable === 0 && targetCostAmount > 0;

              return (
                <DrawerSection
                  title={t("cases.drawer.financials", "Tài chính & Công nợ")}
                  collapsible
                  defaultCollapsed={false}
                >
                  {/* Nhóm 1: Thu tiền (Doanh thu / Khách hàng) */}
                  <div className="space-y-0.5 pb-2">
                    <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>
                        {t(
                          "cases.drawer.receiptsFlow",
                          "1. Dòng tiền Thu (Khách hàng)",
                        )}
                      </span>
                      <span className="font-mono text-[10px] font-normal">
                        {collectionPercent}%
                      </span>
                    </div>
                    <DrawerRow
                      label={t("cases.drawer.totalPayable", "Mục tiêu thu")}
                      cls="font-semibold"
                      value={money(totalPayableAmount)}
                    />
                    <DrawerRow
                      label={t("cases.drawer.erpCollected", "Đã thu thực tế")}
                      cls="text-emerald-600 font-semibold"
                      value={`${money(erpTotalCollected)} (${collectionPercent}%)`}
                    />
                    {erpBankCollected > 0 && (
                      <DrawerRow
                        label={t(
                          "cases.drawer.erpCollectedBank",
                          "↳ Qua Ngân hàng / Sao kê",
                        )}
                        cls="text-xs text-slate-500 pl-2"
                        value={money(erpBankCollected)}
                      />
                    )}
                    {erpCashCollected > 0 && (
                      <DrawerRow
                        label={t(
                          "cases.drawer.erpCollectedCash",
                          "↳ Tiền mặt / Ngoài sổ",
                        )}
                        cls="text-xs text-slate-500 pl-2"
                        value={money(erpCashCollected)}
                      />
                    )}
                    <DrawerRow
                      label={t("cases.drawer.erpRemaining", "Còn phải thu")}
                      cls={
                        isSettled
                          ? "text-emerald-600 font-semibold"
                          : "text-rose-600 font-semibold"
                      }
                      value={money(erpRemaining)}
                    />
                  </div>

                  {/* Nhóm 2: Chi tiền (Chi phí / NCC) */}
                  {targetCostAmount > 0 && (
                    <div className="space-y-0.5 pt-2 border-t border-dashed border-border/80">
                      <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>
                          {t(
                            "cases.drawer.paymentsFlow",
                            "2. Dòng tiền Chi (Chi phí / NCC)",
                          )}
                        </span>
                        <span className="font-mono text-[10px] font-normal">
                          {paymentPercent}%
                        </span>
                      </div>
                      <DrawerRow
                        label={t(
                          "cases.drawer.targetCostTitle",
                          "Tổng chi phí",
                        )}
                        cls="font-semibold"
                        value={money(targetCostAmount)}
                      />
                      <DrawerRow
                        label={t("cases.drawer.erpPaid", "Đã thanh toán")}
                        cls="text-sky-600 dark:text-sky-400 font-semibold"
                        value={`${money(erpTotalPaid)} (${paymentPercent}%)`}
                      />
                      {erpBankPaid > 0 && (
                        <DrawerRow
                          label={t(
                            "cases.drawer.erpPaidBank",
                            "↳ Qua Ngân hàng / Sao kê",
                          )}
                          cls="text-xs text-slate-500 pl-2"
                          value={money(erpBankPaid)}
                        />
                      )}
                      {erpCashPaid > 0 && (
                        <DrawerRow
                          label={t(
                            "cases.drawer.erpPaidCash",
                            "↳ Tiền mặt / Ngoài sổ",
                          )}
                          cls="text-xs text-slate-500 pl-2"
                          value={money(erpCashPaid)}
                        />
                      )}
                      <DrawerRow
                        label={t(
                          "cases.drawer.erpRemainingPayable",
                          "Còn phải chi trả",
                        )}
                        cls={
                          isPaidFull
                            ? "text-emerald-600 font-semibold"
                            : "text-amber-600 font-semibold"
                        }
                        value={money(erpRemainingPayable)}
                      />
                    </div>
                  )}
                </DrawerSection>
              );
            })()}
          </div>
        ) : null
      }
      relatedTabs={resolvedRelatedTabs}
      defaultRelatedTabKey="linked_docs"
    />
  );
}
