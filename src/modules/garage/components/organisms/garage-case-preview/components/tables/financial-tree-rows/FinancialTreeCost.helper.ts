import type { TFunction } from "i18next";
import { calculatePercentage } from "./FinancialTreeReceivables.helper";
import type { FinancialTreeItem } from "./FinancialTree.type";

export function buildCostTreeItems(
  totalCostAmount: number,
  activeSettlements: any[] = [],
  activeLinkedInvoices: any[] = [],
  t: TFunction,
): FinancialTreeItem[] {
  const paymentSettlements = activeSettlements.filter((s: any) => {
    const type = s.settlementType || s.settlement_type;
    return type === "PAYMENT";
  });

  const totalPaid = paymentSettlements.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0,
  );
  const remaining = Math.max(0, totalCostAmount - totalPaid);

  const parentItem: FinancialTreeItem = {
    id: "cost_total",
    rowType: "PARENT_TARGET",
    direction: "COST",
    title: t(
      "cases.financials.totalCostTitle",
      "Tổng chi phí vụ việc (Giá vốn & Nhân công)",
    ),
    iconType: "TARGET_COST",
    targetAmount: totalCostAmount,
    amount: totalCostAmount,
    settledAmount: totalPaid,
    remainingAmount: remaining,
    percentOfTotal: 100,
  };

  const childItems: FinancialTreeItem[] = [];

  // 1. Hóa đơn đầu vào (IN)
  const inInvoices = activeLinkedInvoices.filter((inv: any) => {
    const linkType = inv.linkType || inv.direction;
    return linkType === "IN";
  });

  inInvoices.forEach((inv: any) => {
    const invAmount = Number(inv.totalAmount || inv.invoice?.totalAmount || 0);
    const invNo = inv.invoiceNo || inv.invoice?.invoiceNo || "---";

    childItems.push({
      id: `inv-${inv.id || inv.invoiceId}`,
      rowType: "CHILD_ITEM",
      direction: "COST",
      title: `${t("cases.financials.invoiceIn", "HĐ Đầu vào")}${invNo !== "---" ? ` #${invNo}` : ""}`,
      subTitle: inv.invoiceDate || inv.invoice?.invoiceDate,
      iconType: "INVOICE",
      amount: invAmount,
      percentOfTotal: calculatePercentage(invAmount, totalCostAmount),
      date: inv.invoiceDate || inv.invoice?.invoiceDate,
      partnerName: inv.sellerName || inv.invoice?.sellerName || inv.partnerName,
      invoiceNo: invNo,
      isPending: Boolean(inv.isPending),
      sourceId: inv.id || inv.invoiceId,
      sourceType: "INVOICE",
    });
  });

  // 2. Các khoản chi tiền (Tiền mặt ngoài / Sao kê)
  paymentSettlements.forEach((s: any) => {
    const sAmount = Number(s.amount || 0);
    const isCash = s.sourceChannel === "OFF_SYSTEM_MANUAL";

    childItems.push({
      id: `set-${s.id}`,
      rowType: "CHILD_ITEM",
      direction: "COST",
      title: isCash
        ? t("cases.financials.channelCash", "Tiền mặt ngoài")
        : t("cases.financials.onSystem", "Sao kê / Hệ thống"),
      subTitle: s.transDate,
      iconType: isCash ? "CASH" : "BANK",
      amount: sAmount,
      percentOfTotal: calculatePercentage(sAmount, totalCostAmount),
      payer: "GARAGE",
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
