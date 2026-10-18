import type { PartnerClassificationRow } from "./GaragePartnerMonthDetailDrawer.type";
import { extractCaseFinancials } from "./GaragePartnerMonthDetailDrawer.helper";

export function calculatePartnerClassificationRows(
  cases: any[],
  debtType: "receivables" | "payables",
  totalBilled: number,
): PartnerClassificationRow[] {
  const isPayable = debtType === "payables";
  const defs = [
    { key: "SUA_CHUA_CHUNG", name: "Sửa chữa chung" },
    { key: "KY_GUI_NOI_BO", name: "Ký gửi / Nội bộ" },
    { key: "OJ_NGOAI", name: "OJ Ngoài" },
    { key: "OTHER", name: "Khác / Chưa phân loại" },
  ];

  const map: Record<string, PartnerClassificationRow> = {};
  defs.forEach((d) => {
    map[d.key] = {
      key: d.key,
      name: d.name,
      caseCount: 0,
      billed: 0,
      paid: 0,
      remaining: 0,
      remainingWithInvoice: 0,
      remainingNoInvoice: 0,
      rate: 0,
      shareRate: 0,
    };
  });

  cases.forEach((c) => {
    const cls = String(c.classification || c.loaiNghiepVu || "").toUpperCase();
    let groupKey = "OTHER";
    if (cls.includes("SUA_CHUA") || cls === "SCC") groupKey = "SUA_CHUA_CHUNG";
    else if (cls.includes("KY_GUI") || cls.includes("NOI_BO"))
      groupKey = "KY_GUI_NOI_BO";
    else if (cls.includes("OJ")) groupKey = "OJ_NGOAI";

    const { billed, paid, remaining } = extractCaseFinancials(c, isPayable);
    const hasInvoice = Boolean(c.daXuatHoaDon || c.invoiceNo || c.invoiceId);

    const target = map[groupKey];
    target.caseCount += 1;
    target.billed += billed;
    target.paid += paid;
    target.remaining += remaining;
    if (hasInvoice) target.remainingWithInvoice += remaining;
    else target.remainingNoInvoice += remaining;
  });

  return Object.values(map)
    .filter((r) => r.caseCount > 0 || r.billed > 0)
    .map((r) => ({
      ...r,
      rate: r.billed > 0 ? (r.paid / r.billed) * 100 : 0,
      shareRate: totalBilled > 0 ? (r.billed / totalBilled) * 100 : 0,
    }));
}
