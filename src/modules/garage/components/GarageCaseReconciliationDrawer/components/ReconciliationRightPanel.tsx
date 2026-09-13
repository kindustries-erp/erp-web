import React from "react";
import { useTranslation } from "react-i18next";
import {
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { SmartSuggestionCard } from "@/modules/erp-invoices-core/components/SmartSuggestionCard";
import { SmartInvoiceSuggestionCard } from "../../SmartInvoiceSuggestionCard";
import type { ReconciliationRightPanelProps } from "../types";

export function ReconciliationRightPanel({
  caseId,
  caseCode,
  caseSummary,
  settlementType,
  activeTab,
  targetRevenue,
  targetCost,
  totalCollected,
  totalPaid,
  activeTabSettlementTotal,
  bankSuggestions,
  isLoadingBankSuggestions,
  selectedIds,
  invoiceSuggestions,
  isLoadingInvoiceSuggestions,
  selectedInvoicesMap,
  invoiceNote,
  onSetSettlementType,
  onSelectBankTxn,
  onViewBankDetail,
  onNavigateToInvoiceTab,
  onToggleInvoice,
  onViewInvoiceDetail,
  onSetInvoiceNote,
}: ReconciliationRightPanelProps) {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="space-y-3 pb-3">
      {/* SECTION 1: CHIỀU ĐỐI SOÁT (MODE SWITCHER CARDS) */}
      <DrawerSection
        title={
          <div className="flex items-center gap-1.5 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {t("cases.reconciliation.directionLabel", "Chiều đối soát")}
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSetSettlementType("RECEIPT")}
            className={cn(
              "p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 border-2",
              settlementType === "RECEIPT"
                ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-400",
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg shrink-0 transition-colors",
                settlementType === "RECEIPT"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500",
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs flex items-center justify-between">
                <span>
                  {t("cases.reconciliation.receiptLabel", "Thu tiền")}
                </span>
                {settlementType === "RECEIPT" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {t("cases.reconciliation.receiptDesc", "Tiền vào từ khách")}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSetSettlementType("PAYMENT")}
            className={cn(
              "p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 border-2",
              settlementType === "PAYMENT"
                ? "border-[#ea580c] bg-orange-50/80 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 shadow-xs ring-2 ring-orange-500/20"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-400",
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg shrink-0 transition-colors",
                settlementType === "PAYMENT"
                  ? "bg-[#ea580c] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500",
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs flex items-center justify-between">
                <span>
                  {t("cases.reconciliation.paymentLabel", "Chi tiền")}
                </span>
                {settlementType === "PAYMENT" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {t("cases.reconciliation.paymentDesc", "Chi phí NCC / thợ")}
              </div>
            </div>
          </button>
        </div>
      </DrawerSection>

      {/* SECTION 2: THÔNG TIN VỤ VIỆC & ĐỐI TÁC */}
      <DrawerSection
        title={t(
          "cases.reconciliation.caseInfoTitle",
          "Thông tin Vụ việc & Đối tác",
        )}
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("cases.reconciliation.caseCode", "Mã vụ việc:")}
            </span>
            <span className="font-mono font-bold text-primary">
              {caseCode || caseId || "—"}
            </span>
          </div>
          {caseSummary?.licensePlate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("cases.reconciliation.licensePlate", "Biển số xe:")}
              </span>
              <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                🚗 {caseSummary.licensePlate}
              </span>
            </div>
          )}
          {caseSummary?.customerName && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground shrink-0">
                {t("cases.reconciliation.customer", "Khách hàng:")}
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate">
                {caseSummary.customerName}
              </span>
            </div>
          )}
          <div className="pt-1.5 border-t border-border flex items-center justify-between font-medium">
            <span className="text-muted-foreground">
              {t("cases.reconciliation.targetRevenue", "Doanh thu mục tiêu:")}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {targetRevenue > 0 ? money(targetRevenue) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span className="text-muted-foreground">
              {t("cases.reconciliation.targetCost", "Chi phí mục tiêu:")}
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {targetCost > 0 ? money(targetCost) : "—"}
            </span>
          </div>
        </div>
      </DrawerSection>

      {/* SECTION 3: TIẾN ĐỘ & MỤC TIÊU TÀI CHÍNH */}
      <DrawerSection
        title={
          <div className="flex items-center gap-1.5 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {t(
                "cases.reconciliation.progressTitle",
                "Tiến độ & Mục tiêu Tài chính",
              )}
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="space-y-2.5 text-xs">
          {/* Thu tiền / Doanh thu */}
          <div
            className={cn(
              "p-3 rounded-xl border space-y-2 transition-all",
              settlementType === "RECEIPT" &&
                (activeTab === "bank_cash" || activeTab === "manual_cashflow")
                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 shadow-xs"
                : "bg-card border-border/70",
            )}
          >
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {t(
                    "cases.reconciliation.receiptSectionTitle",
                    "Thu tiền (Doanh thu)",
                  )}
                </span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-200">
                {targetRevenue > 0 ? money(targetRevenue) : "—"}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px] border-t border-border/50">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  {t(
                    "cases.reconciliation.alreadyCollected",
                    "Đã thu trước đó:",
                  )}
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {money(totalCollected)}
                </span>
              </div>

              {/* Real-time staged preview for RECEIPT */}
              {settlementType === "RECEIPT" &&
                (activeTab === "bank_cash" ||
                  activeTab === "manual_cashflow") &&
                activeTabSettlementTotal > 0 && (
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                    <span>
                      {t(
                        "cases.reconciliation.stagingNetoff",
                        "⚡ Cấn trừ đợt này:",
                      )}
                    </span>
                    <span className="font-mono">
                      +{money(activeTabSettlementTotal)}
                    </span>
                  </div>
                )}

              <div className="flex items-center justify-between pt-1 border-t border-dashed border-border/60">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {settlementType === "RECEIPT" &&
                  (activeTab === "bank_cash" ||
                    activeTab === "manual_cashflow") &&
                  activeTabSettlementTotal > 0
                    ? t(
                        "cases.reconciliation.remainingAfterStaging",
                        "Còn lại sau đợt này:",
                      )
                    : t(
                        "cases.reconciliation.remainingReceiptNeed",
                        "Cần thu còn lại:",
                      )}
                </span>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const isStaging =
                      settlementType === "RECEIPT" &&
                      (activeTab === "bank_cash" ||
                        activeTab === "manual_cashflow") &&
                      activeTabSettlementTotal > 0;
                    const projectedTotal = isStaging
                      ? totalCollected + activeTabSettlementTotal
                      : totalCollected;
                    const isOver =
                      targetRevenue > 0 && projectedTotal > targetRevenue;
                    const isExact =
                      targetRevenue > 0 && projectedTotal === targetRevenue;

                    if (isOver) {
                      return (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 font-mono font-bold"
                        >
                          {t("cases.reconciliation.overCollectedBadge", {
                            amount: money(projectedTotal - targetRevenue),
                            defaultValue: `Thu vượt: +${money(projectedTotal - targetRevenue)}`,
                          })}
                        </Badge>
                      );
                    }
                    if (isExact) {
                      return (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                        >
                          {t("cases.reconciliation.exact100Badge", "Đủ 100%")}
                        </Badge>
                      );
                    }
                    if (targetRevenue === 0) {
                      return (
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{money(projectedTotal)}
                        </span>
                      );
                    }
                    return (
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {money(Math.max(0, targetRevenue - projectedTotal))}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiền / Chi phí */}
          <div
            className={cn(
              "p-3 rounded-xl border space-y-2 transition-all",
              settlementType === "PAYMENT" &&
                (activeTab === "bank_cash" || activeTab === "manual_cashflow")
                ? "bg-orange-50/70 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700/80 shadow-xs"
                : "bg-card border-border/70",
            )}
          >
            <div className="flex items-center justify-between font-bold text-orange-900 dark:text-orange-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>
                  {t(
                    "cases.reconciliation.paymentSectionTitle",
                    "Chi tiền (Chi phí)",
                  )}
                </span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-200">
                {targetCost > 0 ? money(targetCost) : "—"}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px] border-t border-border/50">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  {t("cases.reconciliation.alreadyPaid", "Đã chi trước đó:")}
                </span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {money(totalPaid)}
                </span>
              </div>

              {/* Real-time staged preview for PAYMENT */}
              {settlementType === "PAYMENT" &&
                (activeTab === "bank_cash" ||
                  activeTab === "manual_cashflow") &&
                activeTabSettlementTotal > 0 && (
                  <div className="flex items-center justify-between font-bold text-[#ea580c] dark:text-orange-400 bg-orange-100/60 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">
                    <span>
                      {t(
                        "cases.reconciliation.stagingNetoff",
                        "⚡ Cấn trừ đợt này:",
                      )}
                    </span>
                    <span className="font-mono">
                      +{money(activeTabSettlementTotal)}
                    </span>
                  </div>
                )}

              <div className="flex items-center justify-between pt-1 border-t border-dashed border-border/60">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {settlementType === "PAYMENT" &&
                  (activeTab === "bank_cash" ||
                    activeTab === "manual_cashflow") &&
                  activeTabSettlementTotal > 0
                    ? t(
                        "cases.reconciliation.remainingAfterStaging",
                        "Còn lại sau đợt này:",
                      )
                    : t(
                        "cases.reconciliation.remainingPaymentNeed",
                        "Cần chi còn lại:",
                      )}
                </span>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const isStaging =
                      settlementType === "PAYMENT" &&
                      (activeTab === "bank_cash" ||
                        activeTab === "manual_cashflow") &&
                      activeTabSettlementTotal > 0;
                    const projectedTotal = isStaging
                      ? totalPaid + activeTabSettlementTotal
                      : totalPaid;
                    const isOver =
                      targetCost > 0 && projectedTotal > targetCost;
                    const isExact =
                      targetCost > 0 && projectedTotal === targetCost;

                    if (isOver) {
                      return (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 font-mono font-bold"
                        >
                          {t("cases.reconciliation.overPaidBadge", {
                            amount: money(projectedTotal - targetCost),
                            defaultValue: `Chi vượt: +${money(projectedTotal - targetCost)}`,
                          })}
                        </Badge>
                      );
                    }
                    if (isExact) {
                      return (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                        >
                          {t("cases.reconciliation.exact100Badge", "Đủ 100%")}
                        </Badge>
                      );
                    }
                    if (targetCost === 0) {
                      return (
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          +{money(projectedTotal)}
                        </span>
                      );
                    }
                    return (
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {money(Math.max(0, targetCost - projectedTotal))}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerSection>

      {/* SECTION 4: GỢI Ý THÔNG MINH CONTEXTUAL */}
      {activeTab === "bank_cash" && (
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                {settlementType === "RECEIPT"
                  ? t(
                      "cases.reconciliation.suggestReceipt",
                      "Gợi ý Thu tiền (Vào)",
                    )
                  : t(
                      "cases.reconciliation.suggestPayment",
                      "Gợi ý Chi tiền (Ra)",
                    )}
              </span>
              {bankSuggestions.length > 0 && (
                <Badge variant="outline" className="text-[10px] ml-1">
                  {bankSuggestions.length}
                </Badge>
              )}
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
        >
          {isLoadingBankSuggestions ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {t(
                  "cases.reconciliation.analyzingBank",
                  "Đang phân tích sao kê...",
                )}
              </span>
            </div>
          ) : bankSuggestions.length > 0 ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {bankSuggestions.map((sug: any) => {
                const isSelected = selectedIds.includes(
                  sug.bankTransaction?.id || sug.transactionId,
                );
                const txn = sug.bankTransaction || sug.transaction;
                return (
                  <div
                    key={sug.id || txn?.id || sug.transactionId}
                    className="space-y-1"
                  >
                    <SmartSuggestionCard
                      txn={txn}
                      amount={
                        txn?.debitAmount > 0
                          ? txn.debitAmount
                          : txn?.creditAmount
                      }
                      isSuggestion={true}
                      badgeType={sug.score?.badge || "exact"}
                      matchedKeywords={sug.matchedKeywords || []}
                      onAccept={() => {
                        if (txn) {
                          onSelectBankTxn(txn, !isSelected);
                        }
                      }}
                      onViewDetail={(id) => onViewBankDetail(id)}
                    />

                    {/* If suggestion is cross-linked with an invoice, show navigate button */}
                    {(txn?.invoiceNo || sug.invoiceNo) && (
                      <div className="px-2 py-1 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                          {t("cases.reconciliation.hasLinkedInvoiceBadge", {
                            invoiceNo: txn?.invoiceNo || sug.invoiceNo,
                            defaultValue: `🔗 Có HĐ #${txn?.invoiceNo || sug.invoiceNo}`,
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToInvoiceTab(
                              settlementType === "RECEIPT" ? "OUT" : "IN",
                              txn?.invoiceNo || sug.invoiceNo,
                            )
                          }
                          className="text-primary hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                        >
                          <span>
                            {t(
                              "cases.reconciliation.navToInvoiceTab",
                              "Chuyển sang Tab HĐ",
                            )}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic text-center py-3">
              {t(
                "cases.reconciliation.noBankSuggestions",
                "Không tìm thấy giao dịch sao kê khớp chính xác. Bạn có thể tìm trong danh sách bảng bên trái.",
              )}
            </div>
          )}
        </DrawerSection>
      )}

      {(activeTab === "invoices_out" || activeTab === "invoices_in") && (
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                {activeTab === "invoices_out"
                  ? t(
                      "cases.reconciliation.suggestInvoiceOut",
                      "Gợi ý HĐ Bán ra",
                    )
                  : t(
                      "cases.reconciliation.suggestInvoiceIn",
                      "Gợi ý HĐ Mua vào",
                    )}
              </span>
              {invoiceSuggestions.length > 0 && (
                <Badge variant="outline" className="text-[10px] ml-1">
                  {invoiceSuggestions.length}
                </Badge>
              )}
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
        >
          {isLoadingInvoiceSuggestions ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {t(
                  "cases.reconciliation.searchingInvoices",
                  "Đang tìm kiếm hóa đơn khớp...",
                )}
              </span>
            </div>
          ) : invoiceSuggestions.length > 0 ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {invoiceSuggestions.map((sug) => {
                const isSelected = !!selectedInvoicesMap[sug.invoice.id];
                return (
                  <SmartInvoiceSuggestionCard
                    key={sug.invoice.id}
                    suggestion={sug}
                    isSelected={isSelected}
                    onAccept={() => onToggleInvoice(sug.invoice as any)}
                    onViewDetail={(item: any) => onViewInvoiceDetail(item.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic text-center py-3">
              {t(
                "cases.reconciliation.noInvoiceSuggestions",
                "Không tìm thấy hóa đơn khớp chính xác. Bạn có thể chọn từ danh sách bảng bên trái.",
              )}
            </div>
          )}
        </DrawerSection>
      )}

      {/* SECTION 5: GHI CHÚ LIÊN KẾT / ĐỐI SOÁT */}
      {(activeTab === "invoices_out" || activeTab === "invoices_in") && (
        <DrawerSection
          title={t("cases.reconciliation.noteTitle", "Ghi chú liên kết")}
          collapsible={true}
          defaultCollapsed={false}
        >
          <Textarea
            value={invoiceNote}
            onChange={(e) => onSetInvoiceNote(e.target.value)}
            placeholder={t(
              "cases.reconciliation.notePlaceholder",
              "Ghi chú mục đích liên kết hóa đơn này với sổ báo giá...",
            )}
            rows={2}
            className="text-xs"
          />
        </DrawerSection>
      )}
    </div>
  );
}
