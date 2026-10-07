import type { TFunction } from "i18next";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { FinancialTreeItem } from "./FinancialTree.type";

export function calculatePercentage(amount: number, target: number): number {
  if (!target || target <= 0) return 0;
  const pct = (Number(amount || 0) / target) * 100;
  return Math.round(pct * 10) / 10;
}

export function buildReceivablesTreeItems(
  caseData: any,
  activeSettlements: any[] = [],
  activeLinkedInvoices: any[] = [],
  t: TFunction,
): FinancialTreeItem[] {
  const rawData = caseData?.rawData;
  const khAmount = Number(
    rawData?.TienThanhToanKH ?? caseData?.tienThanhToanKh ?? 0,
  );
  const bhAmount = Number(
    rawData?.TienThanhToanBH ?? caseData?.tienThanhToanBh ?? 0,
  );
  const totalTargetRevenue = Number(
    caseData?.tienCoThue ?? rawData?.TongTienThanhToan ?? khAmount + bhAmount,
  );

  let subTitle: string | undefined;
  if (bhAmount > 0) {
    subTitle = `${t("cases.quotePreview.fin.payerKH", "KH")}: ${formatNumber(khAmount)} ₫ • ${t("cases.quotePreview.fin.payerBH", "BH")}: ${formatNumber(bhAmount)} ₫`;
  }

  const receiptSettlements = activeSettlements.filter((s: any) => {
    const type = s.settlementType || s.settlement_type;
    return type === "RECEIPT";
  });

  const totalCollected = receiptSettlements.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0,
  );
  const remaining = Math.max(0, totalTargetRevenue - totalCollected);

  const parentItem: FinancialTreeItem = {
    id: "receivable_total",
    rowType: "PARENT_TARGET",
    direction: "REVENUE",
    title: t("cases.quotePreview.fin.totalReceivable", "Tổng phải thu vụ việc"),
    subTitle,
    iconType: "TARGET_REVENUE",
    targetAmount: totalTargetRevenue,
    amount: totalTargetRevenue,
    settledAmount: totalCollected,
    remainingAmount: remaining,
    percentOfTotal: 100,
  };

  const childItems: FinancialTreeItem[] = [];

  const outInvoices = activeLinkedInvoices.filter((inv: any) => {
    const linkType = inv.linkType || inv.direction;
    return linkType === "OUT";
  });

  outInvoices.forEach((inv: any) => {
    const invAmount = Number(inv.totalAmount || inv.invoice?.totalAmount || 0);
    const invNo = inv.invoiceNo || inv.invoice?.invoiceNo || "---";
    const buyerStr = `${inv.buyerName || inv.invoice?.buyerName || inv.partnerName || ""} ${inv.note || ""}`;
    const isBh =
      inv.payer === "BH" ||
      inv.isInsurance === true ||
      /bảo hiểm|bảo việt|pti|pvi|bic|mic|pjico|vbi|bhhk|liberty/i.test(
        buyerStr,
      );

    childItems.push({
      id: `inv-${inv.id || inv.invoiceId}`,
      rowType: "CHILD_ITEM",
      direction: "REVENUE",
      title: `${t("cases.financials.invoiceOut", "HĐ Đầu ra")}${invNo !== "---" ? ` #${invNo}` : ""}`,
      subTitle: inv.invoiceDate || inv.invoice?.invoiceDate,
      iconType: "INVOICE",
      amount: invAmount,
      percentOfTotal: calculatePercentage(invAmount, totalTargetRevenue),
      payer: isBh ? "BH" : "KH",
      date: inv.invoiceDate || inv.invoice?.invoiceDate,
      partnerName: inv.buyerName || inv.invoice?.buyerName || inv.partnerName,
      invoiceNo: invNo,
      isPending: Boolean(inv.isPending),
      sourceId: inv.id || inv.invoiceId,
      sourceType: "INVOICE",
    });
  });

  receiptSettlements.forEach((s: any) => {
    const sAmount = Number(s.amount || 0);
    const isCash = s.sourceChannel === "OFF_SYSTEM_MANUAL";

    childItems.push({
      id: `set-${s.id}`,
      rowType: "CHILD_ITEM",
      direction: "REVENUE",
      title: isCash
        ? t("cases.financials.channelCash", "Tiền mặt ngoài")
        : t("cases.financials.onSystem", "Sao kê / Hệ thống"),
      subTitle: s.transDate,
      iconType: isCash ? "CASH" : "BANK",
      amount: sAmount,
      percentOfTotal: calculatePercentage(sAmount, totalTargetRevenue),
      payer: s.payer || "KH",
      date: s.transDate,
      partnerName: s.partnerName || s.partner_name,
      note: s.note,
      isPending: Boolean(s.isPending),
      sourceId: s.id,
      sourceType: "SETTLEMENT",
    });
  });

  return [parentItem, ...childItems];
}
