import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import { toast } from "react-hot-toast";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Wallet,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Layers,
  Lock,
  Plus,
  Landmark,
  DollarSign,
} from "lucide-react";
import {
  GarageCaseSettlementDrawerModal,
  SettlementSubmissionItem,
} from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionModal } from "./InvoiceSelectionModal";
import { cn } from "@/shared/utils";

interface GarageCaseSettlementSectionProps {
  caseId: string;
  caseCode?: string;
  isCompleted?: boolean;
  editMode?: boolean;
}

export function GarageCaseSettlementSection({
  caseId,
  caseCode,
  isCompleted = false,
  editMode = false,
}: GarageCaseSettlementSectionProps) {
  const queryClient = useQueryClient();
  const [showSettlementModal, setShowSettlementModal] =
    useState<boolean>(false);
  const [settlementModalType, setSettlementModalType] = useState<
    "RECEIPT" | "PAYMENT"
  >("RECEIPT");
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  // 1. Fetch Financial Summary (3 Tiers & Reconciliation)
  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["garage-case-financial-summary", caseId],
    queryFn: () => garageApi.getCaseFinancialSummary(caseId),
    enabled: !!caseId,
  });

  // 2. Fetch Direct Settlements
  const {
    data: settlements,
    isLoading: isLoadingSettlements,
    refetch: refetchSettlements,
  } = useQuery({
    queryKey: ["garage-case-settlements", caseId],
    queryFn: () => garageApi.getCaseSettlements(caseId),
    enabled: !!caseId,
  });

  // 3. Fetch Linked Invoices
  const {
    data: linkedInvoices,
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["garage-case-linked-invoices", caseId],
    queryFn: () => garageApi.getCaseLinkedInvoices(caseId),
    enabled: !!caseId,
  });

  const refetchAll = () => {
    refetchSummary();
    refetchSettlements();
    refetchInvoices();
    queryClient.invalidateQueries({
      queryKey: ["garage-case-traceability-graph", caseId],
    });
  };

  // Mutation: Add batch settlements
  const addSettlementsMutation = useMutation({
    mutationFn: async (items: SettlementSubmissionItem[]) => {
      for (const item of items) {
        await garageApi.addCaseSettlement(caseId, item);
      }
    },
    onSuccess: () => {
      refetchAll();
    },
  });

  // Mutation: Remove settlement
  const removeSettlementMutation = useMutation({
    mutationFn: (settlementId: string) =>
      garageApi.removeCaseSettlement(caseId, settlementId),
    onSuccess: () => {
      toast.success("Đã xóa giao dịch thành công");
      refetchAll();
    },
  });

  // Mutation: Add linked invoice
  const addInvoiceMutation = useMutation({
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

  // Mutation: Remove linked invoice
  const removeInvoiceMutation = useMutation({
    mutationFn: (linkedId: string) =>
      garageApi.removeCaseLinkedInvoice(caseId, linkedId),
    onSuccess: () => {
      toast.success("Đã hủy liên kết hóa đơn thành công");
      refetchAll();
    },
  });

  const breakdown = summary?.breakdown;
  const reconciliation = summary?.reconciliation;

  return (
    <div className="space-y-4">
      {/* ─── 1. BẢNG TỔNG QUAN TIẾN ĐỘ THU / CHI & ĐỐI SOÁT THANH TOÁN (Neutral Enterprise Card) ─── */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Tổng quan Dòng tiền & Đối soát thanh toán
              </h4>
              <p className="text-[11px] text-slate-500">
                Theo dõi tiến độ thu hồi công nợ, chi phí và đối soát thực tế
              </p>
            </div>
          </div>

          {/* Badge Chế độ xem hoặc Nút hành động */}
          {editMode ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSettlementModalType("RECEIPT");
                  setShowSettlementModal(true);
                }}
                className="h-7 text-xs gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Ghi nhận Thu / Chi
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 text-xs italic bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
              <Lock className="w-3 h-3" />
              Chế độ xem (Bấm "Chỉnh sửa" ở góc trên để thêm/gỡ liên kết)
            </div>
          )}
        </div>

        {/* Thẻ KPIs Neutral Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Cột 1: Doanh thu / Báo giá */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-500">
              {summary?.isCompleted ? "Doanh thu dịch vụ" : "Dự kiến báo giá"}
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(summary?.targetRevenue || 0)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {summary?.isCompleted
                ? "Đã kết thúc (chính thức)"
                : "Chưa hoàn tất"}
            </div>
          </div>

          {/* Cột 2: Đã thu & Còn phải thu */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Tổng thực thu</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(breakdown?.receipts?.totalCollected || 0)}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between truncate">
              <span>Còn nợ:</span>
              <span
                className={cn(
                  "font-semibold font-mono",
                  (breakdown?.receipts?.remainingReceivable || 0) > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-600 dark:text-slate-400",
                )}
              >
                {money(breakdown?.receipts?.remainingReceivable || 0)}
              </span>
            </div>
          </div>

          {/* Cột 3: Chi phí & Thực chi */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Tổng thực chi
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(breakdown?.payments?.totalPaid || 0)}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between truncate">
              <span>Định mức CP:</span>
              <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                {money(summary?.targetCost || 0)}
              </span>
            </div>
          </div>

          {/* Cột 4: Lãi dòng tiền thực tế */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Lợi nhuận dòng tiền
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(breakdown?.realizedCashProfit || 0)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {breakdown?.receipts?.isOverCollected
                ? `Khách nộp dư ${money(breakdown?.receipts?.overCollectedAmount || 0)}`
                : "Thực thu - Thực chi"}
            </div>
          </div>
        </div>

        {/* Thanh Đối soát KGara vs ERP phẳng tinh tế */}
        {reconciliation && (
          <div
            className={cn(
              "p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all",
              reconciliation.hasDiscrepancy
                ? "border-amber-200 bg-amber-50/60 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
            )}
          >
            <div className="flex items-center gap-2">
              {reconciliation.hasDiscrepancy ? (
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
              )}
              <span>
                <strong>Đối soát KGara:</strong> Đã thu trên KGara:{" "}
                <span className="font-semibold font-mono">
                  {money(reconciliation.kgaraPaidAmount)}
                </span>{" "}
                | Thực thu ERP:{" "}
                <span className="font-semibold font-mono">
                  {money(reconciliation.erpCollectedAmount)}
                </span>
              </span>
            </div>
            <div>
              {reconciliation.hasDiscrepancy ? (
                <span className="font-semibold text-amber-700 dark:text-amber-400 font-mono">
                  Lệch {money(reconciliation.discrepancy)}
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Khớp 100%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. DANH SÁCH HÓA ĐƠN VAT LIÊN KẾT ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            Hóa đơn VAT liên kết ({linkedInvoices?.length || 0})
          </h5>
          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInvoiceModal(true)}
              className="h-6 text-xs px-2 gap-1 border-slate-300 dark:border-slate-700"
            >
              <Plus className="w-3 h-3" />
              Liên kết HĐ VAT
            </Button>
          )}
        </div>

        {linkedInvoices && linkedInvoices.length > 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {linkedInvoices.map((inv: any) => {
              const isOut = inv.linkType === "OUT" || inv.direction === "OUT";

              return (
                <div
                  key={inv.id}
                  className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {isOut
                          ? "HĐ Bán ra (Doanh thu)"
                          : "HĐ Mua vào (Chi phí)"}
                      </span>
                      <span>Số: {inv.invoiceNo || "---"}</span>
                    </div>
                    <div className="text-slate-500 truncate">
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
                        onClick={() => removeInvoiceMutation.mutate(inv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Hủy liên kết"
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
          <div className="p-3.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Chưa có hóa đơn VAT nào được liên kết với vụ việc này.
          </div>
        )}
      </div>

      {/* ─── 3. DANH SÁCH GIAO DỊCH THU / CHI (SAO KÊ ERP & NGOÀI SỔ SÁCH) ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            Giao dịch Dòng tiền (Sao kê ERP & Ngoài sổ sách) (
            {settlements?.length || 0})
          </h5>
          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSettlementModalType("RECEIPT");
                setShowSettlementModal(true);
              }}
              className="h-6 text-xs px-2 gap-1 border-slate-300 dark:border-slate-700"
            >
              <Plus className="w-3 h-3" />
              Ghi nhận Thu / Chi
            </Button>
          )}
        </div>

        {settlements && settlements.length > 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {settlements.map((s: any) => {
              const isReceipt = s.settlement_type === "RECEIPT";
              const isOnSystem = s.source_channel === "ON_SYSTEM";

              return (
                <div
                  key={s.id}
                  className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {isReceipt ? "Đã thu" : "Đã chi"}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        {isOnSystem ? (
                          <>
                            <Landmark className="w-3 h-3 text-slate-400" />
                            {s.referenceNumber ||
                              s.bankName ||
                              "Sao kê / Sổ quỹ ERP"}
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-3 h-3 text-slate-400" />
                            Ngoài ERP ({s.category || "Tiền ngoài"})
                          </>
                        )}
                      </span>
                      {s.trans_date && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatGMT7(s.trans_date, "date")}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 truncate">
                      {s.partner_name || s.correspondentName || s.note || "---"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {isReceipt ? "+" : "-"}
                      {money(Number(s.amount || 0))}
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => removeSettlementMutation.mutate(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Xóa giao dịch"
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
          <div className="p-3.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Chưa có giao dịch thu/chi nào được ghi nhận cho vụ việc này.
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <GarageCaseSettlementDrawerModal
        open={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        caseId={caseId}
        caseCode={caseCode}
        defaultType={settlementModalType}
        suggestedAmount={
          settlementModalType === "RECEIPT"
            ? breakdown?.receipts?.remainingReceivable || 0
            : breakdown?.payments?.remainingPayable || 0
        }
        existingTxnIds={
          settlements?.map((s: any) => s.bank_transaction_id).filter(Boolean) ||
          []
        }
        onSubmit={async (items) => {
          await addSettlementsMutation.mutateAsync(items);
        }}
      />

      <InvoiceSelectionModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        caseId={caseId}
        caseCode={caseCode}
        defaultLinkType="OUT"
        onSuccess={refetchAll}
        onSubmit={async (payload) => {
          await addInvoiceMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
}
