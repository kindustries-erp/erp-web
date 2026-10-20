import type {
  PartnerMonthMetrics,
  PayerCategoryMetrics,
} from "./GaragePartnerMonthDetailDrawer.type";

export function parseMonth(monthStr?: string) {
  if (!monthStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return {
      monthKey: `${y}-${m}`,
      monthLabel: `Tháng ${m}/${y}`,
      dateFrom: `${y}-${m}-01`,
      dateTo: `${y}-${m}-31`,
    };
  }
  let y = "";
  let m = "";
  if (monthStr.includes("-")) {
    const parts = monthStr.split("-");
    y = parts[0];
    m = parts[1].padStart(2, "0");
  } else if (monthStr.includes("/")) {
    const parts = monthStr.split("/");
    m = parts[0].padStart(2, "0");
    y = parts[1];
  }
  const lastDay = new Date(Number(y), Number(m), 0).getDate();
  return {
    monthKey: `${y}-${m}`,
    monthLabel: `Tháng ${m}/${y}`,
    dateFrom: `${y}-${m}-01`,
    dateTo: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function extractCaseFinancials(c: any, isPayable: boolean) {
  if (isPayable) {
    const billed = Number(c.tongChiPhi || c.cost || c.chiPhiBaoGia || 0);
    const paid = Number(c.chiPhiDaChi || c.paidCost || 0);
    const remaining = Math.max(0, billed - paid);
    return { billed, paid, remaining, rev: billed, vat: 0 };
  }
  const rev = Number(c.doanhThu || c.revenue || 0);
  const vat = Number(c.thueVat || c.vatAmount || 0);
  const billed =
    Number(c.tienCoThue || c.tongTienThanhToan) ||
    (rev + vat > 0 ? rev + vat : 0);
  const paid = Number(c.daThanhToan || c.tienDaThu || 0);
  const remaining = Math.max(0, billed - paid);
  return { billed, paid, remaining, rev, vat };
}

function emptyPayer(): PayerCategoryMetrics {
  return {
    billed: 0,
    paid: 0,
    remaining: 0,
    rate: 0,
    caseCount: 0,
    withInvoiceAmount: 0,
    noInvoiceAmount: 0,
    vatWithoutInvoiceAmount: 0,
  };
}

export function calculatePartnerMonthMetrics(
  cases: any[],
  debtType: "receivables" | "payables",
): PartnerMonthMetrics {
  const isPayable = debtType === "payables";
  let totalBilled = 0;
  let totalPaid = 0;
  let revenue = 0;
  let vatAmount = 0;
  let vatNoInvCount = 0;
  let totalVatNoInvoice = 0;

  const customer = emptyPayer();
  const insurance = emptyPayer();

  cases.forEach((c) => {
    const { billed, paid, remaining, rev, vat } = extractCaseFinancials(
      c,
      isPayable,
    );
    totalBilled += billed;
    totalPaid += paid;
    revenue += rev;
    vatAmount += vat;

    const hasInvoice = Boolean(c.daXuatHoaDon || c.invoiceNo || c.invoiceId);
    const hasVatNoInvoice = vat > 0 && !hasInvoice;
    if (hasVatNoInvoice) {
      vatNoInvCount += 1;
      totalVatNoInvoice += vat;
    }

    const insBilled = Number(c.tienBaoHiemDuyet || 0);
    if (!isPayable && insBilled > 0) {
      insurance.caseCount += 1;
      insurance.billed += insBilled;
      const insPaid = Math.min(paid, insBilled);
      insurance.paid += insPaid;
      insurance.remaining += Math.max(0, insBilled - insPaid);
      if (hasInvoice) insurance.withInvoiceAmount += insBilled;
      else insurance.noInvoiceAmount += insBilled;
      if (hasVatNoInvoice) insurance.vatWithoutInvoiceAmount += vat;

      const custBilled = Math.max(0, billed - insBilled);
      customer.caseCount += 1;
      customer.billed += custBilled;
      const custPaid = Math.max(0, paid - insPaid);
      customer.paid += custPaid;
      customer.remaining += Math.max(0, custBilled - custPaid);
      if (hasInvoice) customer.withInvoiceAmount += custBilled;
      else customer.noInvoiceAmount += custBilled;
    } else {
      customer.caseCount += 1;
      customer.billed += billed;
      customer.paid += paid;
      customer.remaining += remaining;
      if (hasInvoice) customer.withInvoiceAmount += billed;
      else customer.noInvoiceAmount += billed;
      if (hasVatNoInvoice) customer.vatWithoutInvoiceAmount += vat;
    }
  });

  customer.rate =
    customer.billed > 0 ? (customer.paid / customer.billed) * 100 : 0;
  insurance.rate =
    insurance.billed > 0 ? (insurance.paid / insurance.billed) * 100 : 0;
  const totalRemaining = Math.max(0, totalBilled - totalPaid);
  const rate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  return {
    totalBilled,
    totalPaid,
    totalRemaining,
    rate,
    caseCount: cases.length,
    revenue,
    vatAmount,
    customer,
    insurance,
    vatWarning: {
      hasWarning: vatNoInvCount > 0,
      totalVatWithoutInvoice: totalVatNoInvoice,
      casesCount: vatNoInvCount,
    },
  };
}

export { calculatePartnerClassificationRows } from "./PartnerMonthClassification.helper";
