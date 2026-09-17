import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowDownLeft, Wallet, Building2 } from "lucide-react";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { useErpInvoiceSettlement } from "./context/ErpInvoiceSettlementContext";
import { type ErpInvoiceSettlementTabProps } from "./types";

export function ErpInvoiceSettlementRightPanel(
  props?: ErpInvoiceSettlementTabProps,
) {
  void props;
  const { t } = useTranslation(["erpInvoices", "common"]);
  const ctx = useErpInvoiceSettlement();

  const invoiceNo = ctx.invoice?.invoiceNo || ctx.form?.invoiceNo;
  const isInvoiceIn = ctx.direction === "IN";

  return (
    <div className="space-y-2 pb-2">
      {/* ─── SECTION 1: THÔNG TIN CHUNG HÓA ĐƠN (ĐƯA LÊN ĐẦU TIÊN) ─── */}
      <DrawerSection
        title={
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t("generalInfo", "Thông tin chung")}</span>
          </div>
        }
        titleExtra={
          <span className="text-[10px] font-mono text-muted-foreground">
            {invoiceNo ? `#${invoiceNo}` : "—"}
          </span>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
      >
        <div className="space-y-1 text-xs">
          <DrawerRow
            label={t(
              "sellerBuyerPartner",
              isInvoiceIn ? "Nhà cung cấp" : "Khách hàng",
            )}
            value={
              isInvoiceIn
                ? ctx.invoice?.sellerName || ctx.form?.sellerName || "—"
                : ctx.invoice?.buyerName || ctx.form?.buyerName || "—"
            }
          />
          <DrawerRow
            label={t("branch", "Chi nhánh")}
            value={
              (ctx.invoice as any)?.branch?.name || ctx.invoice?.branchId || "—"
            }
          />
          <DrawerRow
            label={t("notes", "Ghi chú")}
            value={ctx.invoice?.description || ctx.form?.description || "—"}
          />
        </div>
      </DrawerSection>

      {/* ─── SECTION 2: CÔNG NỢ & MỤC TIÊU CẤN TRỪ ─── */}
      <DrawerSection
        title={
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {isInvoiceIn
                ? t("debtAndCashflowTargetIn", "Công nợ & Dòng tiền (Mua vào)")
                : t("debtAndCashflowTargetOut", "Công nợ & Dòng tiền (Bán ra)")}
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
              {isInvoiceIn ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t("invoiceDirectionInTitle", "Chi tiền NCC")}</span>
                </>
              ) : (
                <>
                  <ArrowDownLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {t("invoiceDirectionOutTitle", "Thu tiền từ khách")}
                  </span>
                </>
              )}
            </div>

            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                ctx.isPaidFull
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                  : ctx.totalNetOff > 0
                    ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
              )}
            >
              {ctx.isPaidFull
                ? t("paidFullBadge", "✓ ĐÃ THANH TOÁN ĐỦ (100%)")
                : ctx.totalNetOff > 0
                  ? t("paidPartialBadge", "ĐÃ THANH TOÁN ({{percent}}%)", {
                      percent: ctx.paymentPercent,
                    })
                  : t("unpaidBadge", "CHƯA THANH TOÁN (0%)")}
            </span>
          </div>

          {/* Dòng số liệu & Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {isInvoiceIn
                  ? t("paidAmountLabel", "Đã thanh toán:")
                  : t("collectedAmountLabel", "Đã thu tiền:")}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {money(ctx.totalNetOff)}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">
                  / {money(ctx.totalInvoiceAmount)}
                </span>
              </div>
            </div>

            {/* Neutral / Emerald Progress bar */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  ctx.isPaidFull
                    ? "bg-emerald-600"
                    : "bg-slate-700 dark:bg-slate-300",
                )}
                style={{ width: `${Math.min(ctx.paymentPercent, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-slate-600 dark:text-slate-400 font-sans">
                {isInvoiceIn
                  ? t("remainingToPayLabel", "Còn phải thanh toán:")
                  : t("remainingToCollectLabel", "Còn phải thu:")}
              </span>
              <span
                className={cn(
                  "font-bold text-sm",
                  ctx.remainingDebt === 0 && ctx.totalInvoiceAmount > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {money(ctx.remainingDebt)}
              </span>
            </div>
          </div>

          {/* Phân cách & Cấn trừ đợt này */}
          <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{t("currentNetOffLabel", "Cấn trừ ròng đợt này:")}</span>
              <span
                className={cn(
                  "font-mono font-bold text-sm",
                  ctx.totalCurrentNetOff > 0
                    ? "text-primary font-black"
                    : "text-slate-400",
                )}
              >
                {money(ctx.totalCurrentNetOff)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {t("remainingAfterNetOff", "Còn lại sau cấn trừ:")}
              </span>
              <span
                className={cn(
                  "font-mono font-bold",
                  ctx.remainingAfterNetOff === 0
                    ? "text-emerald-600 dark:text-emerald-400 font-black"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                {money(ctx.remainingAfterNetOff)}
              </span>
            </div>

            {ctx.isOverRemaining && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 leading-tight">
                ⚠️ Tổng tiền cấn trừ đang vượt quá nợ còn lại (
                <span className="font-mono font-bold">
                  +{money(ctx.suggestedDebtDiff)}
                </span>
                ). Vui lòng điều chỉnh lại.
              </div>
            )}

            <p className="text-[10px] text-muted-foreground leading-tight pt-0.5">
              {isInvoiceIn
                ? t(
                    "invoiceDirectionInHint",
                    "💡 Tự động bù trừ: Giao dịch chi (+), NCC hoàn tiền (-).",
                  )
                : t(
                    "invoiceDirectionOutHint",
                    "💡 Tự động bù trừ: Giao dịch thu (+), hoàn trả khách (-).",
                  )}
            </p>
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}
