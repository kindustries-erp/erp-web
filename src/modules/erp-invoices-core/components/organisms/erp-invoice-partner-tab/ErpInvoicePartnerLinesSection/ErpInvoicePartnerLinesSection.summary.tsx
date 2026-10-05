import React from "react";
import type { TFunction } from "i18next";
import { money } from "@/shared/utils/format";

export function buildItemSummaryRow(summary: any, t: TFunction) {
  if (!summary) return undefined;
  return {
    invoiceDate: (
      <span className="font-semibold text-xs text-foreground block">
        {t("total", "Tổng")}
      </span>
    ),
    quantity: (
      <span className="font-semibold text-right block tabular-nums text-xs">
        {Number(summary.totalQuantity || 0).toLocaleString("vi-VN")}
      </span>
    ),
    preVatAmount: (
      <span className="font-semibold text-right block tabular-nums text-xs">
        {money(Number(summary.totalPreVatAmount || 0))}
      </span>
    ),
    vatAmount: (
      <span className="font-semibold text-right block tabular-nums text-xs">
        {money(Number(summary.totalVatAmount || 0))}
      </span>
    ),
    totalAmount: (
      <span className="font-bold text-right block tabular-nums text-xs text-primary">
        {money(Number(summary.totalAmount || 0))}
      </span>
    ),
  };
}
