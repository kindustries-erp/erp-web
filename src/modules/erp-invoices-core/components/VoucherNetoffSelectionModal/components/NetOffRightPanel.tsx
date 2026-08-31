import React from "react";
import { useTranslation } from "react-i18next";
import {
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { SmartSuggestionCard } from "../../SmartSuggestionCard";
import { type SettlementType } from "../types";

interface NetOffRightPanelProps {
  isInvoiceContext: boolean;
  invoiceDirection?: "IN" | "OUT";
  settlementType: SettlementType;
  handleSwitchSettlementType: (type: SettlementType) => void;
  resolvedTarget?: { code?: string; type?: string; totalAmount?: number };
  invoice?: any;
  caseCode?: string;
  currentRemaining: number;
  totalCurrentNetOff: number;
  remainingAfterNetOff: number;
  isOverRemaining: boolean;
  suggestedDebtDiff: number;
  filteredSuggestions: any[];
  isLoadingSuggestions: boolean;
  handleSelectAllFilteredSuggestions: () => void;
  selectedIds: string[];
  netOffAmounts: Record<string, number>;
  handleAmountChange: (txn: any, val: number) => void;
  handleToggleSuggestion: (txn: any) => void;
  setDetailTxnId: (id: string | null) => void;
  existingCaseSettlements?: any[];
}

export function NetOffRightPanel({
  isInvoiceContext,
  invoiceDirection,
  settlementType,
  handleSwitchSettlementType,
  resolvedTarget,
  invoice,
  caseCode,
  currentRemaining,
  totalCurrentNetOff,
  remainingAfterNetOff,
  isOverRemaining,
  suggestedDebtDiff,
  filteredSuggestions,
  isLoadingSuggestions,
  handleSelectAllFilteredSuggestions,
  selectedIds,
  netOffAmounts,
  handleAmountChange,
  handleToggleSuggestion,
  setDetailTxnId,
  existingCaseSettlements,
}: NetOffRightPanelProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  return (
    <div className="space-y-3 pb-3">
      {/* SECTION 1: CHIỀU ĐỐI SOÁT DÒNG TIỀN */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span>
              {t("directionCashflowTitle", "Chiều đối soát dòng tiền")}
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        {isInvoiceContext ? (
          invoiceDirection === "IN" ? (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs">
                <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div>
                    {t(
                      "invoiceDirectionInTitle",
                      "Hóa đơn Mua vào (Chi tiền NCC)",
                    )}
                  </div>
                  <div className="text-[10.5px] font-normal text-muted-foreground">
                    {t(
                      "invoiceDirectionInDesc",
                      "Thanh toán NCC • Ủy nhiệm chi / Phiếu chi",
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-tight pt-1 border-t border-slate-200/80 dark:border-slate-800">
                {t(
                  "invoiceDirectionInHint",
                  "💡 Tự động bù trừ số học: Giao dịch chi (+), Giao dịch NCC hoàn tiền (-).",
                )}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs">
                <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div>
                    {t(
                      "invoiceDirectionOutTitle",
                      "Hóa đơn Bán ra (Thu tiền Khách hàng)",
                    )}
                  </div>
                  <div className="text-[10.5px] font-normal text-muted-foreground">
                    {t(
                      "invoiceDirectionOutDesc",
                      "Thu tiền từ khách • Giấy báo có / Phiếu thu",
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-tight pt-1 border-t border-slate-200/80 dark:border-slate-800">
                {t(
                  "invoiceDirectionOutHint",
                  "💡 Tự động bù trừ số học: Giao dịch thu (+), Giao dịch hoàn trả khách (-).",
                )}
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSwitchSettlementType("RECEIPT")}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs",
                settlementType === "RECEIPT"
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{t("toggleReceipt", "Thu tiền (Vào)")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchSettlementType("PAYMENT")}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs",
                settlementType === "PAYMENT"
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
              )}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{t("togglePayment", "Chi tiền (Ra)")}</span>
            </button>
          </div>
        )}
      </DrawerSection>

      {/* SECTION 2: TIẾN ĐỘ & MỤC TIÊU DÒNG TIỀN */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span>
              {t("financialProgressTitle", "Tiến độ & Mục tiêu Dòng tiền")}
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>
              {isInvoiceContext
                ? t("invoiceTargetLabel", "Hóa đơn:")
                : t("caseTargetLabel", "Mã vụ việc:")}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {resolvedTarget?.code ||
                (invoice?.invoiceNo
                  ? `#${invoice.invoiceNo}`
                  : caseCode || "—")}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>{t("totalValueLabel", "Tổng giá trị:")}</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {money(resolvedTarget?.totalAmount || invoice?.totalAmount || 0)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800 pt-2 text-slate-500">
            <span>
              {settlementType === "PAYMENT"
                ? t("remainingToPayTarget", "Cần chi còn lại:")
                : t("remainingToCollectTarget", "Cần thu còn lại:")}
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {money(currentRemaining)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800 pt-2 font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              {t("currentNetOffLabel", "Cấn trừ ròng đợt này:")}
            </span>
            <span
              className={cn(
                "font-mono text-sm",
                totalCurrentNetOff > 0
                  ? "text-primary font-black"
                  : "text-slate-400",
              )}
            >
              {money(totalCurrentNetOff)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 text-[11px]">
            <span className="text-slate-500">
              {t("remainingAfterNetOff", "Còn lại sau cấn trừ:")}
            </span>
            <span
              className={cn(
                "font-mono font-bold",
                remainingAfterNetOff === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-700 dark:text-slate-300",
              )}
            >
              {money(remainingAfterNetOff)}
            </span>
          </div>

          {isOverRemaining && (
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 leading-tight">
              ⚠️ Tổng tiền cấn trừ đang vượt quá nợ còn lại (
              <span className="font-mono font-bold">
                +{money(suggestedDebtDiff)}
              </span>
              ). Vui lòng điều chỉnh lại.
            </div>
          )}
        </div>
      </DrawerSection>

      {/* SECTION 3: GỢI Ý THU/CHI TIỀN (SMART SUGGESTIONS) */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span>
              {isInvoiceContext
                ? invoiceDirection === "IN"
                  ? t("smartSuggestionsTitleIn", "Gợi ý Chi tiền (Sao kê)")
                  : t("smartSuggestionsTitleOut", "Gợi ý Thu tiền (Sao kê)")
                : settlementType === "RECEIPT"
                  ? t("smartSuggestionsReceipt", "Gợi ý Thu tiền (Vào)")
                  : t("smartSuggestionsPayment", "Gợi ý Chi tiền (Ra)")}
            </span>
          </div>
        }
        titleExtra={
          filteredSuggestions.length >= 2 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAllFilteredSuggestions}
              className="h-5 text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-slate-600 dark:text-slate-400" />
              {t("selectAllSuggestions", "Chọn tất cả ({{count}})", {
                count: filteredSuggestions.length,
              })}
            </Button>
          ) : undefined
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        {isLoadingSuggestions ? (
          <div className="py-4 text-center text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t("searchingSuggestions", "Đang tìm kiếm gợi ý...")}
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredSuggestions.map((s: any) => (
              <SmartSuggestionCard
                key={s.txn.id}
                txn={s.txn}
                amount={
                  s.txn.debitAmount > 0 ? s.txn.debitAmount : s.txn.creditAmount
                }
                isSuggestion={true}
                badgeType={s.confidence || "PERFECT"}
                matchedKeywords={s.matchedKeywords || []}
                onAccept={() => handleToggleSuggestion(s.txn)}
                onViewDetail={(id) => setDetailTxnId(id)}
                netOffProps={
                  selectedIds.includes(s.txn.id)
                    ? {
                        value: netOffAmounts[s.txn.id] || 0,
                        onChange: (val) => handleAmountChange(s.txn, val),
                        onRemove: () => handleToggleSuggestion(s.txn),
                      }
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic text-center py-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border px-3">
            {selectedIds.length > 0
              ? t(
                  "allSuggestionsSelected",
                  "Toàn bộ gợi ý phù hợp đã được chọn.",
                )
              : t(
                  "noMatchingTransactions",
                  "Chưa tìm thấy giao dịch khớp chính xác. Bạn có thể tìm trong danh sách bảng bên trái.",
                )}
          </div>
        )}
      </DrawerSection>

      {/* SECTION 4: LỊCH SỬ DÒNG TIỀN ĐÃ GHI NHẬN TRƯỚC ĐÓ (CHO CASE) */}
      {existingCaseSettlements && existingCaseSettlements.length > 0 && (
        <DrawerSection
          title={t("pastSettlementsTitle", "Dòng tiền đã ghi nhận trước đó")}
          titleExtra={
            <span className="text-[10px] font-semibold text-slate-500">
              {existingCaseSettlements.length} khoản
            </span>
          }
          collapsible={true}
          defaultCollapsed={true}
        >
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {existingCaseSettlements.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs flex items-center justify-between"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.sourceChannel === "ON_SYSTEM"
                      ? item.bankName || "Sao kê ERP"
                      : item.category === "TIEN_MAT_NGOAI"
                        ? "Tiền mặt ngoài"
                        : item.category === "CHUYEN_KHOAN_CA_NHAN"
                          ? "CK cá nhân"
                          : "Cấn trừ khác"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatGMT7(item.transDate || item.createdAt, "date")}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-mono font-bold shrink-0",
                    item.settlementType === "RECEIPT"
                      ? "text-emerald-600"
                      : "text-amber-600",
                  )}
                >
                  {item.settlementType === "RECEIPT" ? "+" : "-"}
                  {money(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </DrawerSection>
      )}
    </div>
  );
}
