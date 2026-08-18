import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import { toast } from "react-hot-toast";
import {
  Trash2,
  Wallet,
  Receipt,
  AlertTriangle,
  Lock,
  Plus,
  Landmark,
  DollarSign,
  Edit3,
  TrendingUp,
  Scale,
  Users,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  GarageCaseSettlementDrawerModal,
  SettlementSubmissionItem,
} from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import { cn } from "@/shared/utils";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useTranslation } from "react-i18next";

export interface GarageCaseSettlementSectionProps {
  caseId: string;
  caseCode?: string;
  isCompleted?: boolean;
  editMode?: boolean;
  activeSettlements?: any[];
  activeLinkedInvoices?: any[];
  activeSummary?: any;
  onAddSettlement?: (items: SettlementSubmissionItem[]) => void;
  onRemoveSettlement?: (id: string) => void;
  onAddInvoice?: (payload: {
    invoiceId: string;
    linkType: "IN" | "OUT";
    note?: string;
    invoice?: ErpInvoice;
  }) => void;
  onRemoveInvoice?: (id: string) => void;
}

export function GarageCaseSettlementSection({
  caseId,
  caseCode,
  isCompleted = false,
  editMode = false,
  activeSettlements: externalSettlements,
  activeLinkedInvoices: externalLinkedInvoices,
  activeSummary: externalSummary,
  onAddSettlement,
  onRemoveSettlement,
  onAddInvoice,
  onRemoveInvoice,
}: GarageCaseSettlementSectionProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const [showSettlementModal, setShowSettlementModal] =
    useState<boolean>(false);
  const [settlementModalType, setSettlementModalType] = useState<
    "RECEIPT" | "PAYMENT"
  >("RECEIPT");
  const [editingSettlementItem, setEditingSettlementItem] =
    useState<SettlementSubmissionItem | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  // 1. Fetch Financial Summary
  const { data: serverSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", caseId],
    queryFn: () => garageApi.getCaseFinancialSummary(caseId),
    enabled: !!caseId && !externalSummary,
  });

  // 2. Fetch Direct Settlements
  const { data: serverSettlements, refetch: refetchSettlements } = useQuery({
    queryKey: ["garage-case-settlements", caseId],
    queryFn: () => garageApi.getCaseSettlements(caseId),
    enabled: !!caseId && !externalSettlements,
  });

  // 3. Fetch Linked Invoices
  const { data: serverLinkedInvoices, refetch: refetchInvoices } = useQuery({
    queryKey: ["garage-case-linked-invoices", caseId],
    queryFn: () => garageApi.getCaseLinkedInvoices(caseId),
    enabled: !!caseId && !externalLinkedInvoices,
  });

  const refetchAll = () => {
    refetchSummary();
    refetchSettlements();
    refetchInvoices();
    queryClient.invalidateQueries({
      queryKey: ["garage-case-traceability-graph", caseId],
    });
  };

  const handleEditSettlement = (s: any) => {
    if (!editMode) return;

    const isReceipt =
      s.settlement_type === "RECEIPT" || s.settlementType === "RECEIPT";
    setEditingSettlementItem({
      id: s.id,
      bankTransactionId: s.bank_transaction_id || s.bankTransactionId,
      settlementType: isReceipt ? "RECEIPT" : "PAYMENT",
      sourceChannel: s.source_channel || s.sourceChannel || "OFF_SYSTEM_MANUAL",
      category: s.category || "TIEN_MAT_NGOAI",
      amount: Number(s.amount || 0),
      transDate: s.trans_date || s.transDate || s.createdAt,
      partnerName: s.partner_name || s.partnerName || s.correspondentName || "",
      note: s.note || "",
      referenceNumber: s.referenceNumber || "",
      bankName: s.bankName || "",
    });
    setSettlementModalType(isReceipt ? "RECEIPT" : "PAYMENT");
    setShowSettlementModal(true);
  };

  useEffect(() => {
    const handleOpenManualEditor = (e: any) => {
      // Chỉ cho phép mở modal sửa khi ở chế độ editMode
      if (!editMode) return;

      const node = e.detail?.node;
      if (!node) return;
      const target = (externalSettlements || serverSettlements || []).find(
        (s: any) =>
          s.id === node.id ||
          `manual-${s.id}` === node.id ||
          s.bank_transaction_id === node.id,
      );

      if (target) {
        handleEditSettlement(target);
      } else {
        setEditingSettlementItem({
          id: node.id,
          settlementType: node.amount >= 0 ? "RECEIPT" : "PAYMENT",
          sourceChannel: "OFF_SYSTEM_MANUAL",
          amount: Math.abs(node.amount || node.netOffAmount || 0),
          transDate: node.date,
          partnerName: node.partnerName,
          note: node.title,
        });
        setSettlementModalType(node.amount >= 0 ? "RECEIPT" : "PAYMENT");
        setShowSettlementModal(true);
      }
    };

    window.addEventListener(
      "open_manual_settlement_editor",
      handleOpenManualEditor,
    );
    return () => {
      window.removeEventListener(
        "open_manual_settlement_editor",
        handleOpenManualEditor,
      );
    };
  }, [externalSettlements, serverSettlements, editMode]);

  const directAddSettlementsMutation = useMutation({
    mutationFn: async (items: SettlementSubmissionItem[]) => {
      if (editingSettlementItem?.id) {
        await garageApi.removeCaseSettlement(caseId, editingSettlementItem.id);
      }
      for (const item of items) {
        await garageApi.addCaseSettlement(caseId, item);
      }
    },
    onSuccess: () => {
      refetchAll();
      toast.success(
        editingSettlementItem
          ? "Đã cập nhật giao dịch thành công"
          : "Đã ghi nhận giao dịch thành công",
      );
    },
  });

  const directRemoveSettlementMutation = useMutation({
    mutationFn: (settlementId: string) =>
      garageApi.removeCaseSettlement(caseId, settlementId),
    onSuccess: () => {
      toast.success("Đã xóa giao dịch thành công");
      refetchAll();
    },
  });

  const directAddInvoiceMutation = useMutation({
    mutationFn: (payload: {
      invoiceId: string;
      linkType: "IN" | "OUT";
      note?: string;
    }) =>
      garageApi.addCaseLinkedInvoice(
        caseId,
        payload.invoiceId,
        payload.linkType,
        payload.note,
      ),
    onSuccess: () => {
      refetchAll();
    },
  });

  const directRemoveInvoiceMutation = useMutation({
    mutationFn: (linkedId: string) =>
      garageApi.removeCaseLinkedInvoice(caseId, linkedId),
    onSuccess: () => {
      toast.success("Đã hủy liên kết hóa đơn thành công");
      refetchAll();
    },
  });

  const summary = externalSummary ?? serverSummary;
  const settlements = externalSettlements ?? serverSettlements ?? [];
  const linkedInvoices = externalLinkedInvoices ?? serverLinkedInvoices ?? [];

  const breakdown = summary?.breakdown;
  const reconciliation = summary?.reconciliation;

  // 1. Chỉ số Công nợ Phải Thu (Khách hàng)
  const targetRevenue = Number(summary?.targetRevenue || 0);
  const totalCollected = Number(breakdown?.receipts?.totalCollected || 0);
  const remainingReceivable = Number(
    breakdown?.receipts?.remainingReceivable || 0,
  );
  const isOverCollected = Boolean(breakdown?.receipts?.isOverCollected);
  const overAmount = Number(breakdown?.receipts?.overCollectedAmount || 0);

  const collectionPercent =
    targetRevenue > 0
      ? Math.min(Math.round((totalCollected / targetRevenue) * 100), 999)
      : totalCollected > 0
        ? 100
        : 0;

  // 2. Chỉ số Công nợ Phải Chi (Chi phí / Nhà cung cấp)
  const targetCost = Number(summary?.targetCost || 0);
  const totalPaid = Number(breakdown?.payments?.totalPaid || 0);
  const remainingPayable = Number(breakdown?.payments?.remainingPayable || 0);

  const paymentPercent =
    targetCost > 0
      ? Math.min(Math.round((totalPaid / targetCost) * 100), 999)
      : totalPaid > 0
        ? 100
        : 0;

  // 3. Dòng tiền ròng
  const realizedProfit = Number(breakdown?.realizedCashProfit || 0);

  const handleOpenAddSettlement = (type: "RECEIPT" | "PAYMENT" = "RECEIPT") => {
    setEditingSettlementItem(null);
    setSettlementModalType(type);
    setShowSettlementModal(true);
  };

  const handleOpenAddInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleDeleteSettlement = (s: any) => {
    if (editMode && onRemoveSettlement) {
      onRemoveSettlement(s.id);
    } else {
      directRemoveSettlementMutation.mutate(s.id);
    }
  };

  const handleDeleteInvoice = (inv: any) => {
    if (editMode && onRemoveInvoice) {
      onRemoveInvoice(inv.id);
    } else {
      directRemoveInvoiceMutation.mutate(inv.id);
    }
  };

  return (
    <div className="space-y-4 py-1">
      {/* ─── 1. BẢNG TIẾN ĐỘ CÔNG NỢ & DÒNG TIỀN (Receivable & Payable Dual Boards) ─── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>{t("Theo dõi Dòng tiền & Công nợ Vụ việc")}</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t(
                "Đối soát tiến độ thu tiền từ Khách hàng và tiến độ chi trả Chi phí / Nhà cung cấp",
              )}
            </p>
          </div>

          {!editMode && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>{t("Chế độ xem")}</span>
            </div>
          )}
        </div>

        {/* 2 Cột Thẻ Công Nợ Đối Xứng (Khách Hàng vs Nhà Cung Cấp) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* ✦ Thẻ 1: CÔNG NỢ PHẢI THU (KHÁCH HÀNG) */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    {t("Công nợ Phải thu (Khách hàng)")}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {summary?.isCompleted || isCompleted
                      ? t("Doanh thu chính thức đã chốt")
                      : t("Doanh thu dự toán báo giá")}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                  isOverCollected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : remainingReceivable === 0 && targetRevenue > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
                )}
              >
                {isOverCollected
                  ? `✓ THU DƯ (${collectionPercent}%)`
                  : remainingReceivable === 0 && targetRevenue > 0
                    ? `✓ ĐÃ THU ĐỦ (100%)`
                    : `CÒN NỢ (${collectionPercent}%)`}
              </span>
            </div>

            {/* Số liệu & Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("Đã thu thực tế:")}
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {money(totalCollected)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1.5">
                    / {money(targetRevenue)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isOverCollected || remainingReceivable === 0
                      ? "bg-emerald-500"
                      : "bg-amber-500",
                  )}
                  style={{ width: `${Math.min(collectionPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Chi tiết phụ */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                {isOverCollected ? t("Khách nộp dư:") : t("Còn phải thu:")}
              </span>
              <span
                className={cn(
                  "font-bold",
                  isOverCollected
                    ? "text-emerald-700 dark:text-emerald-400"
                    : remainingReceivable > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-slate-700 dark:text-slate-300",
                )}
              >
                {isOverCollected
                  ? `+${money(overAmount)}`
                  : money(remainingReceivable)}
              </span>
            </div>
          </div>

          {/* ✦ Thẻ 2: CÔNG NỢ PHẢI CHI (CHI PHÍ / NHÀ CUNG CẤP) */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    {t("Công nợ Phải chi (Chi phí / NCC)")}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t("Vật tư, phụ tùng & gia công ngoài")}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                  totalPaid >= targetCost && targetCost > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : totalPaid > 0
                      ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                )}
              >
                {totalPaid >= targetCost && targetCost > 0
                  ? `✓ ĐÃ CHI ĐỦ (${paymentPercent}%)`
                  : totalPaid > 0
                    ? `ĐÃ CHI (${paymentPercent}%)`
                    : `CHƯA CHI (0%)`}
              </span>
            </div>

            {/* Số liệu & Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("Đã thực chi:")}
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {money(totalPaid)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1.5">
                    / {money(targetCost)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(paymentPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Chi tiết phụ */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                {t("Còn phải chi trả:")}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {money(remainingPayable)}
              </span>
            </div>
          </div>
        </div>

        {/* Dòng tóm tắt: Lợi Nhuận Dòng Tiền Ròng & Cảnh báo Đồng Bộ KGara (nếu có) */}
        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">
              {t("Lợi nhuận dòng tiền thực tế:")}
            </span>
            <strong className="font-mono text-sm text-slate-900 dark:text-slate-100">
              {money(realizedProfit)}
            </strong>
            <span className="text-[11px] text-slate-400 italic">
              ({t("Thực thu")} {money(totalCollected)} - {t("Thực chi")}{" "}
              {money(totalPaid)})
            </span>
          </div>

          {/* Cảnh báo đồng bộ KGara (nếu phát hiện chênh lệch) */}
          {reconciliation?.hasDiscrepancy ? (
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {t("Chênh lệch với KGara xưởng:")}{" "}
                {money(reconciliation.discrepancy)} ({t("KGara ghi nhận:")}{" "}
                {money(reconciliation.kgaraPaidAmount)})
              </span>
            </div>
          ) : reconciliation ? (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("Khớp với KGara xưởng")}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ─── 2. DANH SÁCH HÓA ĐƠN VAT LIÊN KẾT ─── */}
      <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t("Hóa đơn VAT liên kết")}
            </h5>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {linkedInvoices?.length || 0}
            </span>
          </div>

          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenAddInvoice}
              className="h-7 text-xs px-2.5 gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("Liên kết HĐ VAT")}
            </Button>
          )}
        </div>

        {linkedInvoices && linkedInvoices.length > 0 ? (
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
            {linkedInvoices.map((inv: any) => {
              const isOut = inv.linkType === "OUT" || inv.direction === "OUT";

              return (
                <div
                  key={inv.id}
                  className="px-3.5 py-2.5 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {isOut ? "HĐ BÁN RA" : "HĐ MUA VÀO"}
                      </span>
                      <span className="font-mono">
                        Số: {inv.invoiceNo || "---"}
                      </span>
                      {inv.isPending && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 animate-pulse">
                          {t("Chờ lưu")}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {inv.sellerName || inv.buyerName || inv.note || "---"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {money(Number(inv.totalAmount || 0))}
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteInvoice(inv)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title={t("common:delete", "Xóa")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            {t("Chưa có hóa đơn VAT nào được liên kết với vụ việc này.")}
          </div>
        )}
      </div>

      {/* ─── 3. DANH SÁCH GIAO DỊCH THU / CHI ─── */}
      <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t("Giao dịch Dòng tiền (Sao kê ERP & Ngoài sổ sách)")}
            </h5>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {settlements?.length || 0}
            </span>
          </div>

          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenAddSettlement("RECEIPT")}
              className="h-7 text-xs px-2.5 gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("Ghi nhận Thu / Chi")}
            </Button>
          )}
        </div>

        {settlements && settlements.length > 0 ? (
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
            {settlements.map((s: any) => {
              const isReceipt =
                s.settlement_type === "RECEIPT" ||
                s.settlementType === "RECEIPT";
              const isOnSystem =
                s.source_channel === "ON_SYSTEM" ||
                s.sourceChannel === "ON_SYSTEM";

              return (
                <div
                  key={s.id}
                  className="px-3.5 py-2.5 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border",
                          isReceipt
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                            : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
                        )}
                      >
                        {isReceipt ? "ĐÃ THU" : "ĐÃ CHI"}
                      </span>

                      {s.isPending && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 animate-pulse">
                          {t("Chờ lưu")}
                        </span>
                      )}

                      {s.isViaInvoice && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {t("Qua HĐ")} {s.invoiceNo || ""}
                        </span>
                      )}

                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                        {isOnSystem ? (
                          <>
                            <Landmark className="w-3 h-3 text-slate-400" />
                            <span>
                              {s.referenceNumber ||
                                s.bankName ||
                                t("Sao kê / Sổ quỹ ERP")}
                            </span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-3 h-3 text-indigo-500" />
                            <span>
                              {t("Ngoài ERP")} ({s.category || "Tiền ngoài"})
                            </span>
                          </>
                        )}
                      </span>

                      {(s.trans_date || s.transDate) && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatGMT7(s.trans_date || s.transDate, "date")}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-500 text-[11px] truncate">
                      {s.partner_name ||
                        s.partnerName ||
                        s.correspondentName ||
                        s.note ||
                        "---"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {isReceipt ? "+" : "-"}
                      {money(Number(s.amount || 0))}
                    </div>

                    {/* Nút sửa chỉ xuất hiện khi ở chế độ editMode và là giao dịch ngoài sổ sách */}
                    {editMode && !isOnSystem && !s.isViaInvoice && (
                      <button
                        type="button"
                        onClick={() => handleEditSettlement(s)}
                        className="p-1 text-slate-400 hover:text-primary transition-all rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title={t("Chỉnh sửa giao dịch ngoài")}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {editMode && !s.isViaInvoice && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSettlement(s)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title={t("common:delete", "Xóa")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            {t("Chưa có giao dịch thu/chi nào được ghi nhận cho vụ việc này.")}
          </div>
        )}
      </div>

      {/* ─── DRAWERS ─── */}
      <GarageCaseSettlementDrawerModal
        open={showSettlementModal}
        onClose={() => {
          setShowSettlementModal(false);
          setEditingSettlementItem(null);
        }}
        caseId={caseId}
        caseCode={caseCode}
        defaultType={settlementModalType}
        editingItem={editingSettlementItem}
        suggestedAmount={
          settlementModalType === "RECEIPT"
            ? remainingReceivable || 0
            : remainingPayable || 0
        }
        existingTxnIds={
          settlements
            ?.map((s: any) => s.bank_transaction_id || s.bankTransactionId)
            .filter(Boolean) || []
        }
        onSubmit={async (items) => {
          if (editMode && onAddSettlement) {
            if (editingSettlementItem?.id && onRemoveSettlement) {
              onRemoveSettlement(editingSettlementItem.id);
            }
            onAddSettlement(items);
          } else {
            await directAddSettlementsMutation.mutateAsync(items);
          }
        }}
      />

      <InvoiceSelectionDrawer
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        caseId={caseId}
        caseCode={caseCode}
        defaultLinkType="OUT"
        onSuccess={() => {
          if (!editMode) refetchAll();
        }}
        onSubmit={async (payload) => {
          if (editMode && onAddInvoice) {
            onAddInvoice(payload);
          } else {
            await directAddInvoiceMutation.mutateAsync(payload);
          }
        }}
      />
    </div>
  );
}
