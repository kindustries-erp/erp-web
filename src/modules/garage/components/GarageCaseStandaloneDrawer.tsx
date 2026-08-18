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
        content: (
          <DrawerDocumentTraceability
            rootId={selectedCase.id}
            rootType="GARAGE_CASE"
            fetchGraph={(id) => garageApi.getCaseTraceabilityGraph(id)}
            editMode={editMode}
            allowedDocTypes={["PURCHASE_ORDER", "SALES_ORDER"]}
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
          <div className="space-y-4">
            {/* THÔNG TIN CHUNG */}
            <DrawerSection
              title={t("cases.drawer.generalInfo", "Thông tin chung")}
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

            {/* TÀI CHÍNH BÁO GIÁ */}
            <DrawerSection
              title={t("cases.drawer.financials", "Tài chính báo giá")}
            >
              <DrawerRow
                label={t("cases.drawer.totalAmount", "Tổng tiền")}
                cls="font-semibold"
                value={money(Number(selectedCase.tienCoThue || 0))}
              />
              <DrawerRow
                label={t(
                  "cases.drawer.paidAmountCombined",
                  "Đã thanh toán (KH & BH)",
                )}
                cls="text-emerald-600 font-semibold"
                value={money(
                  Number(selectedCase.khachHangDaThanhToan || 0) +
                    Number(selectedCase.baoHiemDaThanhToan || 0),
                )}
              />
              <DrawerRow
                label={t("cases.drawer.customerPaid", "Khách hàng thanh toán")}
                value={money(Number(selectedCase.khachHangDaThanhToan || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.insurancePaid", "Bảo hiểm thanh toán")}
                value={money(Number(selectedCase.baoHiemDaThanhToan || 0))}
              />
              <DrawerRow
                label={t("cases.drawer.remaining", "Còn phải thu")}
                cls="text-rose-600 font-semibold"
                value={money(Number(selectedCase.tienConPhaiThanhToan || 0))}
              />
            </DrawerSection>

            {/* LỢI NHUẬN GỘP & CHI PHÍ */}
            {grossProfit && (
              <DrawerSection
                title={t(
                  "cases.drawer.grossProfitSection",
                  "Lợi nhuận gộp & Chi phí",
                )}
              >
                <DrawerRow
                  label={t("cases.drawer.revenue", "Doanh thu")}
                  value={money(
                    Number(grossProfit.DoanhThu || selectedCase.doanhThu || 0),
                  )}
                />
                <DrawerRow
                  label={t("cases.drawer.partCost", "Giá vốn phụ tùng")}
                  value={money(Number(grossProfit.GiaVonPhuTung || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.subcontractCost", "Gia công ngoài")}
                  value={money(Number(grossProfit.ChiPhiGiaCongNgoai || 0))}
                />
                {Number(grossProfit.ChiPhiHoaHongGDV || 0) > 0 && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.commissionSurveyor",
                      "Hoa hồng Giám định viên",
                    )}
                    value={money(Number(grossProfit.ChiPhiHoaHongGDV || 0))}
                  />
                )}
                {Number(grossProfit.ChiPhiHoaHongMG || 0) > 0 && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.commissionBroker",
                      "Hoa hồng Môi giới",
                    )}
                    value={money(Number(grossProfit.ChiPhiHoaHongMG || 0))}
                  />
                )}
                <DrawerRow
                  label={t("cases.drawer.grossProfit", "Lãi tạm tính")}
                  cls="text-emerald-600 font-bold"
                  value={money(
                    Number(grossProfit.LoiNhuan || selectedCase.loiNhuan || 0),
                  )}
                />
                {grossProfit.LoiNhuanCoThue != null && (
                  <DrawerRow
                    label={t(
                      "cases.drawer.grossProfitTax",
                      "Lãi tạm tính có thuế",
                    )}
                    cls="text-emerald-700 font-bold"
                    value={money(Number(grossProfit.LoiNhuanCoThue || 0))}
                  />
                )}
              </DrawerSection>
            )}
          </div>
        ) : null
      }
      relatedTabs={resolvedRelatedTabs}
      defaultRelatedTabKey="linked_docs"
    />
  );
}
