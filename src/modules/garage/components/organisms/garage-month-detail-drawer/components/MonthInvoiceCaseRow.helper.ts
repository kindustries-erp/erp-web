import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import type {
  MonthInvoiceCaseRow,
  MonthInvoiceCasesTotals,
} from "./MonthInvoiceCaseRow.type";

/**
 * Làm phẳng các nhóm đối tượng hóa đơn thành danh sách từng phiếu dịch vụ theo từng xe
 */
export function flattenReceivablesGroupsToCases(
  groups: MonthlyReceivablesGroupItem[],
  totalBilled = 0,
  debtType: "receivables" | "payables" = "receivables",
): MonthInvoiceCaseRow[] {
  if (!Array.isArray(groups) || groups.length === 0) {
    return [];
  }

  const isPayable = debtType === "payables";
  const rows: MonthInvoiceCaseRow[] = [];

  for (const group of groups) {
    const rawInvoiceNos = group.invoiceNos as unknown;
    const groupInvoiceNos: string[] = Array.isArray(rawInvoiceNos)
      ? (rawInvoiceNos as string[])
      : rawInvoiceNos &&
          typeof (rawInvoiceNos as any)[Symbol.iterator] === "function"
        ? Array.from(rawInvoiceNos as Iterable<string>)
        : [];

    if (Array.isArray(group.cases) && group.cases.length > 0) {
      for (const c of group.cases) {
        const caseCost = Number(c.cost) || 0;
        const casePaidCost = Number(c.paidCost) || 0;
        const caseRemainingCost =
          Number(c.remainingCost) || Math.max(0, caseCost - casePaidCost);

        const revBilled = Number(c.amount) || 0;
        const revPaid = Number(c.paid) || 0;
        const revRemaining =
          Number(c.remaining) || Math.max(0, revBilled - revPaid);

        const billed = isPayable ? caseCost : revBilled;
        const paid = isPayable ? casePaidCost : revPaid;
        const remaining = isPayable ? caseRemainingCost : revRemaining;
        const shareRate =
          totalBilled > 0 ? (billed / totalBilled) * 100 : group.shareRate || 0;

        const effectiveInvoiceNo: string | undefined =
          c.invoiceNo || groupInvoiceNos[0] || undefined;
        const hasInvoice = Boolean(group.hasInvoice || effectiveInvoiceNo);

        rows.push({
          id: `${c.id || c.soChungTu}_${group.payerType || "KH"}`,
          caseId: c.id || c.soChungTu,
          soChungTu: c.soChungTu || "",
          bienSoXe: c.bienSoXe || "",
          khachHangName:
            c.khachHangName ||
            group.customerName ||
            group.buyerName ||
            group.title ||
            "Khách lẻ",
          khachHangCode: c.khachHangCode || group.taxCode || null,
          partnerTitle: group.title || group.buyerName || "—",
          taxCode: group.taxCode || null,
          payerType: group.payerType || "KH",
          partnerCategory: group.partnerCategory,
          invoiceCategory: group.invoiceCategory,
          hasInvoice,
          invoiceNo: effectiveInvoiceNo,
          invoiceNos: c.invoiceNo ? [c.invoiceNo] : groupInvoiceNos,
          hasVat: Boolean(group.hasVat || (c.vatAmount && c.vatAmount > 0)),
          vatAmount: Number(c.vatAmount) || 0,
          vatWarning: Boolean(c.vatWarning ?? group.vatWarning),
          billed,
          paid,
          remaining,
          cost: caseCost,
          paidCost: casePaidCost,
          remainingCost: caseRemainingCost,
          shareRate,
          debtType,
          parentGroup: group,
        });
      }
    } else if (group.billed > 0 || group.caseCount > 0) {
      // Fallback an toàn nếu group không có mảng cases con
      const grpCost = Number(group.cost) || 0;
      const grpPaidCost = Number(group.paidCost) || 0;
      const grpRemainingCost =
        Number(group.remainingCost) || Math.max(0, grpCost - grpPaidCost);

      const billed = isPayable ? grpCost : group.billed;
      const paid = isPayable ? grpPaidCost : group.paid;
      const remaining = isPayable ? grpRemainingCost : group.remaining;

      rows.push({
        id: `${group.key}_${group.payerType || "KH"}`,
        caseId: group.key,
        soChungTu: group.title,
        bienSoXe: "",
        khachHangName: group.customerName || group.buyerName || group.title,
        khachHangCode: group.taxCode || null,
        partnerTitle: group.title,
        taxCode: group.taxCode || null,
        payerType: group.payerType || "KH",
        partnerCategory: group.partnerCategory,
        invoiceCategory: group.invoiceCategory,
        hasInvoice: group.hasInvoice,
        invoiceNo: (groupInvoiceNos[0] as string | undefined) || undefined,
        invoiceNos: groupInvoiceNos,
        hasVat: group.hasVat,
        vatAmount: group.vatAmount || 0,
        vatWarning: group.vatWarning,
        billed,
        paid,
        remaining,
        cost: grpCost,
        paidCost: grpPaidCost,
        remainingCost: grpRemainingCost,
        shareRate: group.shareRate || 0,
        debtType,
        parentGroup: group,
      });
    }
  }

  return rows;
}

/**
 * Tính toán tổng hợp cho dòng chân bảng (summary row)
 */
export function calculateCasesTotals(
  rows: MonthInvoiceCaseRow[],
): MonthInvoiceCasesTotals {
  const uniquePlates = new Set<string>();

  const totals = rows.reduce(
    (acc, row) => {
      acc.billed += row.billed;
      acc.paid += row.paid;
      acc.remaining += row.remaining;
      if (row.bienSoXe && row.bienSoXe.trim() !== "" && row.bienSoXe !== "—") {
        uniquePlates.add(row.bienSoXe.trim().toUpperCase());
      }
      return acc;
    },
    {
      billed: 0,
      paid: 0,
      remaining: 0,
      caseCount: rows.length,
      vehicleCount: 0,
    },
  );

  totals.vehicleCount = uniquePlates.size;
  return totals;
}
