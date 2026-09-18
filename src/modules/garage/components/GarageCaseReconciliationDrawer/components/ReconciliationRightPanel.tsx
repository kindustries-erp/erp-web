import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Textarea } from "@/shared/components/ui/textarea";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { ReconciliationRightPanelProps } from "../types";

export function ReconciliationRightPanel({
  caseId,
  caseCode,
  caseData,
  caseSummary,
  settlementType,
  activeTab,
  domainDirection = settlementType === "PAYMENT" ? "COST" : "REVENUE",
  targetRevenue,
  targetCost,
  totalCollected,
  totalPaid,
  activeTabSettlementTotal,
  isPaidFull: propIsPaidFull,
  paymentPercent: propPaymentPercent,
  remainingDebt: propRemainingDebt,
  remainingAfterNetOff: propRemainingAfterNetOff,
  selectedIds = [],
  selectedInvoicesCount = 0,
  invoiceNote,
  editMode = false,
  onSetInvoiceNote,
}: ReconciliationRightPanelProps) {
  void selectedIds;
  void selectedInvoicesCount;
  const { t } = useTranslation(["garage", "common"]);

  const isInvoiceTab =
    activeTab === "invoices_out" || activeTab === "invoices_in";

  const targetAmount = domainDirection === "COST" ? targetCost : targetRevenue;
  const settledAmount = domainDirection === "COST" ? totalPaid : totalCollected;

  const remainingDebt =
    propRemainingDebt !== undefined
      ? propRemainingDebt
      : Math.max(0, targetAmount - settledAmount);

  const remainingAfterNetOff =
    propRemainingAfterNetOff !== undefined
      ? propRemainingAfterNetOff
      : Math.max(
          0,
          remainingDebt - (isInvoiceTab ? 0 : activeTabSettlementTotal),
        );

  const paymentPercent =
    propPaymentPercent !== undefined
      ? propPaymentPercent
      : targetAmount <= 0
        ? settledAmount > 0
          ? 100
          : 0
        : Math.min(100, Math.round((settledAmount / targetAmount) * 100));

  const isPaidFull =
    propIsPaidFull !== undefined
      ? propIsPaidFull
      : remainingDebt <= 0 ||
        (targetAmount > 0 && settledAmount >= targetAmount);

  return (
    <div className="space-y-2 pb-2">
      {/* ─── SECTION 1: THÔNG TIN CHUNG VỤ VIỆC (ĐỒNG BỘ CHUẨN VỚI CÁC TAB CÒN LẠI) ─── */}
      <DrawerSection
        title={t("cases.drawer.generalInfo", "Thông tin chung")}
        collapsible
        defaultCollapsed={false}
      >
        <DrawerRow
          label={t("cases.drawer.caseCode", "Số chứng từ")}
          value={
            caseData?.soChungTu ||
            caseCode ||
            (caseId ? `#${caseId.slice(-6)}` : "—")
          }
        />
        <DrawerRow
          label={t("cases.drawer.plate", "Biển số xe")}
          value={caseData?.bienSoXe || caseSummary?.licensePlate || "—"}
        />
        <DrawerRow
          label={t("cases.drawer.customer", "Khách hàng")}
          value={caseData?.khachHangName || caseSummary?.customerName || "—"}
        />
        <DrawerRow
          label={t("cases.drawer.serviceStatus", "Trạng thái")}
          value={caseData?.tenTinhTrangDichVu || "—"}
        />
        <DrawerRow
          label={t("cases.drawer.creationDate", "Ngày phát sinh")}
          value={
            caseData?.ngayPhatSinh
              ? formatGMT7(caseData.ngayPhatSinh, "date")
              : "—"
          }
        />
        {isInvoiceTab && editMode && onSetInvoiceNote && (
          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-muted-foreground text-[11px] block mb-1 font-medium">
              {t("cases.reconciliation.noteTitle", "Ghi chú liên kết")}
            </span>
            <Textarea
              value={invoiceNote}
              onChange={(e) => onSetInvoiceNote?.(e.target.value)}
              placeholder={t(
                "cases.reconciliation.notePlaceholder",
                "Ghi chú liên kết hóa đơn...",
              )}
              rows={2}
              className="text-xs"
            />
          </div>
        )}
      </DrawerSection>

      {/* ─── SECTION 2: CÔNG NỢ & ĐỐI SOÁT DÒNG TIỀN (THEO LÀN ĐANG CHỌN) ─── */}
      <DrawerSection
        title={
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {domainDirection === "COST"
                ? t(
                    "cases.reconciliation.debtAndCashflowTargetCost",
                    "Công nợ & Dòng tiền (Chi phí)",
                  )
                : t(
                    "cases.reconciliation.debtAndCashflowTargetRevenue",
                    "Công nợ & Dòng tiền (Doanh thu)",
                  )}
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
      >
        <div className="space-y-2 pt-0.5">
          {/* Header Card: Chiều đối soát & Badge Trạng thái */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {domainDirection === "COST" ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {t(
                      "cases.reconciliation.paymentDesc",
                      "Chi tiền NCC / Thợ",
                    )}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {t("cases.reconciliation.receiptDesc", "Thu tiền từ khách")}
                  </span>
                </>
              )}
            </div>

            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                isPaidFull
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                  : settledAmount > 0
                    ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
              )}
            >
              {isPaidFull
                ? t(
                    "cases.reconciliation.paidFullBadge",
                    "✓ ĐÃ THANH TOÁN ĐỦ (100%)",
                  )
                : settledAmount > 0
                  ? t(
                      "cases.reconciliation.paidPartialBadge",
                      "ĐÃ THANH TOÁN ({{percent}}%)",
                      { percent: paymentPercent },
                    )
                  : t(
                      "cases.reconciliation.unpaidBadge",
                      "CHƯA THANH TOÁN (0%)",
                    )}
            </span>
          </div>

          {/* Dòng số liệu & Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {domainDirection === "COST"
                  ? t("cases.reconciliation.paidAmountLabel", "Đã thanh toán:")
                  : t(
                      "cases.reconciliation.collectedAmountLabel",
                      "Đã thu tiền:",
                    )}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {money(settledAmount)}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">
                  / {money(targetAmount)}
                </span>
              </div>
            </div>

            {/* Neutral / Emerald Progress bar */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isPaidFull
                    ? "bg-emerald-600"
                    : "bg-slate-700 dark:bg-slate-300",
                )}
                style={{ width: `${Math.min(paymentPercent, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-slate-600 dark:text-slate-400 font-sans">
                {domainDirection === "COST"
                  ? t(
                      "cases.reconciliation.remainingToPayLabel",
                      "Còn phải chi:",
                    )
                  : t(
                      "cases.reconciliation.remainingToCollectLabel",
                      "Còn phải thu:",
                    )}
              </span>
              <span
                className={cn(
                  "font-bold text-sm",
                  remainingDebt <= 0 && targetAmount > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {money(remainingDebt)}
              </span>
            </div>
          </div>

          {/* Phân cách & Cấn trừ đợt này */}
          <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                {t(
                  "cases.reconciliation.currentNetOffLabel",
                  "Cấn trừ ròng đợt này:",
                )}
              </span>
              <span
                className={cn(
                  "font-mono font-bold text-sm",
                  activeTabSettlementTotal > 0
                    ? "text-primary font-black"
                    : "text-slate-400",
                )}
              >
                {money(activeTabSettlementTotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {t(
                  "cases.reconciliation.remainingAfterNetOff",
                  "Còn lại sau cấn trừ:",
                )}
              </span>
              <span
                className={cn(
                  "font-mono font-bold",
                  remainingAfterNetOff === 0
                    ? "text-emerald-600 dark:text-emerald-400 font-black"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                {money(remainingAfterNetOff)}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground leading-tight pt-0.5">
              {domainDirection === "COST"
                ? t(
                    "cases.reconciliation.hintCost",
                    "💡 Tự động bù trừ: Giao dịch chi (+), NCC hoàn tiền (-).",
                  )
                : t(
                    "cases.reconciliation.hintRevenue",
                    "💡 Tự động bù trừ: Giao dịch thu (+), hoàn trả khách (-).",
                  )}
            </p>
          </div>
        </div>
      </DrawerSection>

      {/* ─── SECTION 3: HIỆU QUẢ LỢI NHUẬN GỘP ─── */}
      <DrawerSection
        title={
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {t(
                "cases.reconciliation.grossProfitSection",
                "Hiệu quả lợi nhuận gộp",
              )}
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
      >
        <div className="space-y-1 text-xs">
          <DrawerRow
            label={t(
              "cases.reconciliation.targetRevenue",
              "Doanh thu mục tiêu",
            )}
            value={
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {targetRevenue > 0 ? money(targetRevenue) : "—"}
              </span>
            }
          />
          <DrawerRow
            label={t("cases.reconciliation.targetCost", "Chi phí mục tiêu")}
            value={
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {targetCost > 0 ? money(targetCost) : "—"}
              </span>
            }
          />
          <DrawerRow
            label={t(
              "cases.reconciliation.targetProfit",
              "Lợi nhuận gộp mục tiêu",
            )}
            value={
              <span
                className={cn(
                  "font-mono font-bold",
                  targetRevenue - targetCost >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {targetRevenue > 0 || targetCost > 0 ? (
                  <>
                    {money(targetRevenue - targetCost)}
                    {targetRevenue > 0 && (
                      <span className="text-[10px] ml-1 font-normal text-muted-foreground">
                        (
                        {Math.round(
                          ((targetRevenue - targetCost) / targetRevenue) * 100,
                        )}
                        %)
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </span>
            }
          />
          <DrawerRow
            label={t(
              "cases.reconciliation.actualGrossProfit",
              "Lợi nhuận gộp thực tế",
            )}
            value={
              <span
                className={cn(
                  "font-mono font-bold",
                  totalCollected - totalPaid >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {totalCollected > 0 || totalPaid > 0
                  ? money(totalCollected - totalPaid)
                  : "—"}
              </span>
            }
          />
        </div>
      </DrawerSection>
    </div>
  );
}
