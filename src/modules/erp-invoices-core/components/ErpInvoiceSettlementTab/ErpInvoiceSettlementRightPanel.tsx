import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  CheckCircle2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { useErpInvoiceSettlement } from "./context/ErpInvoiceSettlementContext";
import { type ErpInvoiceSettlementTabProps } from "./types";
import { ErpInvoiceGeneralInfoSection } from "../ErpInvoiceGeneralInfoSection";

export function ErpInvoiceSettlementRightPanel(
  props?: ErpInvoiceSettlementTabProps,
) {
  void props;
  const { t } = useTranslation(["erpInvoices", "common"]);
  const ctx = useErpInvoiceSettlement();

  const isInvoiceIn = ctx.direction === "IN";
  const pendingCount = ctx.activeVouchers.filter((v) => v.isPending).length;

  return (
    <div className="space-y-4 pb-2">
      {/* ─── SECTION 1: THÔNG TIN CHUNG HÓA ĐƠN (SHARED COMPONENT) ─── */}
      <ErpInvoiceGeneralInfoSection
        invoice={ctx.invoice}
        form={ctx.form}
        editMode={ctx.editMode}
        fieldSet={ctx.fieldSet}
        direction={ctx.direction}
        invoiceId={ctx.invoice?.id}
      />

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

          {/* Action Buttons: Xác nhận cấn trừ / Bỏ chọn */}
          {ctx.selectedIds.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
              <Button
                size="sm"
                onClick={ctx.handleConfirmNetOff}
                disabled={ctx.isSubmitting || ctx.isOverRemaining}
                className="w-full h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                {ctx.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("saving", "Đang xử lý...")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {ctx.editMode
                        ? t(
                            "confirmPendingNetOff",
                            "Cấn trừ đã chọn ({{count}} GD)",
                            { count: ctx.selectedIds.length },
                          )
                        : t("confirmDirectNetOff", "Xác nhận cấn trừ ngay")}
                    </span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={ctx.handleUnselectAll}
                className="w-full h-7 text-[11px] text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <span>
                  {t("unselectAll", "Bỏ chọn tất cả ({{count}})", {
                    count: ctx.selectedIds.length,
                  })}
                </span>
              </Button>
            </div>
          )}

          {/* Thông báo trạng thái chờ lưu khi ở editMode */}
          {ctx.editMode && pendingCount > 0 && (
            <div className="p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>
                ⏳ Có <strong className="font-bold">{pendingCount}</strong> giao
                dịch chờ lưu.
              </span>
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Nhấn "Lưu thay đổi" bên dưới
              </span>
            </div>
          )}
        </div>
      </DrawerSection>
    </div>
  );
}
