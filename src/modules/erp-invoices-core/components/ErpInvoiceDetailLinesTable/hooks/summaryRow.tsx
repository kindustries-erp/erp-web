import React from "react";
import type { TFunction } from "i18next";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import type { OutInvoiceLineDisplayResult } from "../../../utils/outInvoiceDisplay";

export function getInvoiceDetailLinesSummaryRow(
  displayItems: OutInvoiceLineDisplayResult[],
  t: TFunction<"erpInvoices", undefined>,
) {
  if (!displayItems.length) return undefined;

  const totalQty = displayItems.reduce(
    (acc, cur) => acc + (cur.quantity || 0),
    0,
  );
  const totalPreVat = displayItems.reduce(
    (acc, cur) => acc + (cur.preVatAmount || 0),
    0,
  );
  const totalVat = displayItems.reduce(
    (acc, cur) => acc + (cur.vatAmount || 0),
    0,
  );
  const totalDiscount = displayItems.reduce(
    (acc, cur) => acc + (cur.discountAmount || 0),
    0,
  );
  const grandTotal = displayItems.reduce(
    (acc, cur) => acc + (cur.totalAmount || 0),
    0,
  );

  return {
    description: (
      <SubtotalSummaryCell
        variantType="label"
        label={t("totalSummary", "Tổng cộng:")}
        currentPageCount={displayItems.length}
        totalCount={displayItems.length}
      />
    ),
    quantity: (
      <SubtotalSummaryCell
        variantType="qty"
        metricTitle={t("totalQuantity", "Tổng số lượng")}
        itemTitle={t("itemUnit", "Dòng HHDV")}
        itemUnit="dòng"
        subtotalQty={totalQty}
        grandTotalQty={totalQty}
        currentPageCount={displayItems.length}
        totalCount={displayItems.length}
      />
    ),
    discountAmount:
      totalDiscount !== 0 ? (
        <SubtotalSummaryCell
          variantType="amount"
          subtotalAmount={totalDiscount}
          grandTotalAmount={totalDiscount}
        />
      ) : undefined,
    vatAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        subtotalAmount={totalVat}
        grandTotalAmount={totalVat}
      />
    ),
    preVatAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        subtotalAmount={totalPreVat}
        grandTotalAmount={totalPreVat}
      />
    ),
    totalAmount: (
      <SubtotalSummaryCell
        variantType="amount"
        subtotalAmount={grandTotal}
        grandTotalAmount={grandTotal}
      />
    ),
  };
}
