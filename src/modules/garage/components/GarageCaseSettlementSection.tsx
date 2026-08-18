import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import { toast } from "react-hot-toast";
import {
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
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import { cn } from "@/shared/utils";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useTranslation } from "react-i18next";

export interface GarageCaseSettlementSectionProps {
  caseId: string;
  caseCode?: string;
  isCompleted?: boolean;
  editMode?: boolean;
  // External client-side state / callbacks (from useGarageCaseEditForm)
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
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  // 1. Fetch Financial Summary (fallback if not provided by parent)
  const { data: serverSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", caseId],
    queryFn: () => garageApi.getCaseFinancialSummary(caseId),
    enabled: !!caseId && !externalSummary,
  });

  // 2. Fetch Direct Settlements (fallback if not provided by parent)
  const { data: serverSettlements, refetch: refetchSettlements } = useQuery({
    queryKey: ["garage-case-settlements", caseId],
    queryFn: () => garageApi.getCaseSettlements(caseId),
    enabled: !!caseId && !externalSettlements,
  });

  // 3. Fetch Linked Invoices (fallback if not provided by parent)
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

  // Fallback direct mutations (when not using client-side pending batch form)
  const directAddSettlementsMutation = useMutation({
    mutationFn: async (items: SettlementSubmissionItem[]) => {
      for (const item of items) {
        await garageApi.addCaseSettlement(caseId, item);
      }
    },
    onSuccess: () => {
      refetchAll();
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

  // Resolve active data (prioritize external client-side state)
  const summary = externalSummary ?? serverSummary;
  const settlements = externalSettlements ?? serverSettlements ?? [];
  const linkedInvoices = externalLinkedInvoices ?? serverLinkedInvoices ?? [];

  const breakdown = summary?.breakdown;
  const reconciliation = summary?.reconciliation;

  const handleOpenAddSettlement = (type: "RECEIPT" | "PAYMENT" = "RECEIPT") => {
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
                {t(
                  "cases.settlementSection.cashflowOverview",
                  "Tổng quan Dòng tiền & Đối soát thanh toán",
                )}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t(
                  "cases.settlementSection.cashflowOverviewDesc",
                  "Theo dõi tiến độ thu hồi công nợ, chi phí và đối soát thực tế",
                )}
              </p>
            </div>
          </div>

          {/* Badge Chế độ xem */}
          {!editMode && (
            <div className="flex items-center gap-1 text-slate-400 text-xs italic bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
              <Lock className="w-3 h-3" />
              {t(
                "cases.settlementSection.viewModeNotice",
                'Chế độ xem (Bấm "Chỉnh sửa" ở góc trên để thêm/gỡ liên kết)',
              )}
            </div>
          )}
        </div>

        {/* Thẻ KPIs Neutral Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Cột 1: Doanh thu / Báo giá */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-500">
              {summary?.isCompleted || isCompleted
                ? t(
                    "cases.settlementSection.targetRevenue",
                    "Doanh thu dịch vụ",
                  )
                : t(
                    "cases.settlementSection.targetEstimate",
                    "Dự kiến báo giá",
                  )}
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(summary?.targetRevenue || 0)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {summary?.isCompleted || isCompleted
                ? t(
                    "cases.settlementSection.completedStatus",
                    "Đã kết thúc (chính thức)",
                  )
                : t(
                    "cases.settlementSection.inProgressStatus",
                    "Chưa hoàn tất",
                  )}
            </div>
          </div>

          {/* Cột 2: Đã thu & Còn phải thu */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>
                {t("cases.settlementSection.totalCollected", "Tổng thực thu")}
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(breakdown?.receipts?.totalCollected || 0)}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between truncate">
              <span>{t("cases.settlementSection.debt", "Còn nợ:")}</span>
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
              {t("cases.settlementSection.totalPaid", "Tổng thực chi")}
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(breakdown?.payments?.totalPaid || 0)}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between truncate">
              <span>
                {t("cases.settlementSection.targetCost", "Định mức CP:")}
              </span>
              <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                {money(summary?.targetCost || 0)}
              </span>
            </div>
          </div>

          {/* Cột 4: Lãi dòng tiền thực tế */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs space-y-1">
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {t(
                "cases.settlementSection.realizedProfit",
                "Lợi nhuận dòng tiền",
              )}
            </div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {money(breakdown?.realizedCashProfit || 0)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {breakdown?.receipts?.isOverCollected
                ? t("cases.settlementSection.overCollected", {
                    amount: money(
                      breakdown?.receipts?.overCollectedAmount || 0,
                    ),
                    defaultValue: `Khách nộp dư ${money(breakdown?.receipts?.overCollectedAmount || 0)}`,
                  })
                : t("cases.settlementSection.formula", "Thực thu - Thực chi")}
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
                <strong>
                  {t(
                    "cases.settlementSection.reconciliationTitle",
                    "Đối soát KGara:",
                  )}
                </strong>{" "}
                {t("cases.settlementSection.reconciliationKgara", {
                  amount: money(reconciliation.kgaraPaidAmount),
                  defaultValue: `Đã thu trên KGara: ${money(reconciliation.kgaraPaidAmount)}`,
                })}{" "}
                |{" "}
                {t("cases.settlementSection.reconciliationErp", {
                  amount: money(reconciliation.erpCollectedAmount),
                  defaultValue: `Thực thu ERP: ${money(reconciliation.erpCollectedAmount)}`,
                })}
              </span>
            </div>
            <div>
              {reconciliation.hasDiscrepancy ? (
                <span className="font-semibold text-amber-700 dark:text-amber-400 font-mono">
                  {t("cases.settlementSection.discrepancy", {
                    amount: money(reconciliation.discrepancy),
                    defaultValue: `Lệch ${money(reconciliation.discrepancy)}`,
                  })}
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {t("cases.settlementSection.match100", "Khớp 100%")}
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
            {t("cases.settlementSection.linkedInvoicesTitle", {
              count: linkedInvoices?.length || 0,
              defaultValue: `Hóa đơn VAT liên kết (${linkedInvoices?.length || 0})`,
            })}
          </h5>
          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenAddInvoice}
              className="h-7 text-xs px-2.5 gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("cases.settlementSection.linkInvoiceBtn", "Liên kết HĐ VAT")}
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
                          ? t(
                              "cases.settlementSection.invOut",
                              "HĐ Bán ra (Doanh thu)",
                            )
                          : t(
                              "cases.settlementSection.invIn",
                              "HĐ Mua vào (Chi phí)",
                            )}
                      </span>
                      <span>
                        {t("cases.invoiceDrawer.invoiceNo", "Số")}:{" "}
                        {inv.invoiceNo || "---"}
                      </span>
                      {inv.isPending && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 animate-pulse">
                          {t("cases.settlementSection.pendingBadge", "Chờ lưu")}
                        </span>
                      )}
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
          <div className="p-3.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            {t(
              "cases.settlementSection.noLinkedInvoices",
              "Chưa có hóa đơn VAT nào được liên kết với vụ việc này.",
            )}
          </div>
        )}
      </div>

      {/* ─── 3. DANH SÁCH GIAO DỊCH THU / CHI (SAO KÊ ERP & NGOÀI SỔ SÁCH) ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            {t("cases.settlementSection.cashflowTxnsTitle", {
              count: settlements?.length || 0,
              defaultValue: `Giao dịch Dòng tiền (Sao kê ERP & Ngoài sổ sách) (${settlements?.length || 0})`,
            })}
          </h5>
          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenAddSettlement("RECEIPT")}
              className="h-7 text-xs px-2.5 gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t(
                "cases.settlementSection.recordSettlementBtn",
                "Ghi nhận Thu / Chi",
              )}
            </Button>
          )}
        </div>

        {settlements && settlements.length > 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
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
                  className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {isReceipt
                          ? t(
                              "cases.settlementSection.collectedBadge",
                              "Đã thu",
                            )
                          : t("cases.settlementSection.paidBadge", "Đã chi")}
                      </span>
                      {s.isPending && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 animate-pulse">
                          {t("cases.settlementSection.pendingBadge", "Chờ lưu")}
                        </span>
                      )}
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        {isOnSystem ? (
                          <>
                            <Landmark className="w-3 h-3 text-slate-400" />
                            {s.referenceNumber ||
                              s.bankName ||
                              t(
                                "cases.settlementSection.erpSource",
                                "Sao kê / Sổ quỹ ERP",
                              )}
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-3 h-3 text-slate-400" />
                            {t("cases.settlementSection.manualSource", {
                              category: s.category || "Tiền ngoài",
                              defaultValue: `Ngoài ERP (${s.category || "Tiền ngoài"})`,
                            })}
                          </>
                        )}
                      </span>
                      {(s.trans_date || s.transDate) && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatGMT7(s.trans_date || s.transDate, "date")}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 truncate">
                      {s.partner_name ||
                        s.partnerName ||
                        s.correspondentName ||
                        s.note ||
                        "---"}
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
          <div className="p-3.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            {t(
              "cases.settlementSection.noSettlements",
              "Chưa có giao dịch thu/chi nào được ghi nhận cho vụ việc này.",
            )}
          </div>
        )}
      </div>

      {/* ─── DRAWERS ─── */}
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
          settlements
            ?.map((s: any) => s.bank_transaction_id || s.bankTransactionId)
            .filter(Boolean) || []
        }
        onSubmit={async (items) => {
          if (editMode && onAddSettlement) {
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
