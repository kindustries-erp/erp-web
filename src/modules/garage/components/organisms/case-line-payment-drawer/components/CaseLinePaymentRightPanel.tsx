import React from "react";
import { useTranslation } from "react-i18next";
import { Receipt, CheckCircle2 } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { formatNumber } from "../../garage-case-preview/GarageCasePreview.helper";
import type { CaseLinePaymentDrawerProps } from "../CaseLinePaymentDrawer.type";

interface CaseLinePaymentRightPanelProps {
  props: CaseLinePaymentDrawerProps;
  targetAmount: number;
  selectedAmount: number;
  remainingAmount: number;
  progressPercent: number;
  lineTypeLabel: string;
  payerLabel: string;
  isCost?: boolean;
  realSettledAmount?: number;
}

export function CaseLinePaymentRightPanel({
  props,
  targetAmount,
  selectedAmount,
  remainingAmount,
  progressPercent,
  lineTypeLabel,
  payerLabel,
  isCost = props.direction === "COST" || props.lineType === "PT",
  realSettledAmount = 0,
}: CaseLinePaymentRightPanelProps) {
  const { t } = useTranslation(["garage", "common"]);

  const titleKpi = isCost
    ? t("cases.financials.paymentCostKpi", "Tiến độ chi tiền")
    : t("cases.financials.paymentKpi", "Tiến độ thu tiền");

  const settledLabel = isCost
    ? t("cases.financials.paidActual", "Đã chi (sao kê)")
    : t("cases.financials.collectedActual", "Đã thu (sao kê)");

  const remainingLabel = isCost
    ? t("cases.financials.remainingPayable", "Còn phải chi")
    : t("cases.financials.remainingReceivable", "Còn phải thu");

  return (
    <div className="space-y-4">
      {/* 1. Thông tin dòng đang cấn trừ */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Receipt className="w-3.5 h-3.5 text-primary" />
            {t("cases.quotePreview.paymentTargetInfo", "Khoản mục cấn trừ")}
          </span>
        }
      >
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.typeCol", "Phân loại")}:
            </span>
            <span className="font-semibold">{lineTypeLabel}</span>
          </div>
          {props.lineCode && (
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">
                {t("cases.quotePreview.partCode", "Mã")}:
              </span>
              <span className="font-mono">{props.lineCode}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.partName", "Tên")}:
            </span>
            <span className="font-medium text-right max-w-[180px] truncate">
              {props.lineName || "---"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.fin.payerCol", "Bên thanh toán")}:
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {payerLabel}
            </span>
          </div>
        </div>
      </DrawerSection>

      {/* 2. KPI Bar cấn trừ */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {titleKpi}
          </span>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("cases.quotePreview.fin.amountCol", "Số tiền mục tiêu")}:
            </span>
            <span className="font-mono font-bold text-foreground">
              {formatNumber(targetAmount)} ₫
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t(
                "cases.financials.selectedInvoicesTotal",
                "HĐ đã chọn cấn trừ",
              )}
              :
            </span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
              {formatNumber(selectedAmount)} ₫
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{settledLabel}:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(realSettledAmount)} ₫
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{remainingLabel}:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {formatNumber(remainingAmount)} ₫
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            {progressPercent}% {t("cases.quotePreview.completed", "hoàn thành")}
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}
