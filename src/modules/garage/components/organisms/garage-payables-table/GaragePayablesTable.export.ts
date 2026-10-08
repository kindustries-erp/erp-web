import type { SupplierDebtItem } from "./GaragePayablesTable.type";

export function exportGaragePayablesCsv(
  items: SupplierDebtItem[],
  t: (key: string, fallback: string) => string,
) {
  if (!items || items.length === 0) return;

  const headers = [
    t("customers.columns.customerCode", "Mã KH"),
    t("customers.columns.customerName", "Khách hàng"),
    t("customers.columns.caseCount", "SL Phiếu DV"),
    t("payables.columns.costAmount", "Chi phí báo giá"),
    t("payables.columns.balanceAmount", "Còn phải chi"),
    t("payables.columns.aging0_30", "0-30 ngày"),
    t("payables.columns.aging31_60", "31-60 ngày"),
    t("payables.columns.aging61_90", "61-90 ngày"),
    t("payables.columns.agingOver90", ">90 ngày"),
    t("payables.columns.maxAgingDays", "Tuổi nợ (ngày)"),
  ];

  const rows: string[] = [headers.join(",")];

  for (const r of items) {
    const escapedName = (r.customerName || "").replace(/"/g, '""');
    rows.push(
      [
        `"${r.customerCode || ""}"`,
        `"${escapedName}"`,
        r.caseCount ?? 0,
        r.costAmount ?? r.psCo ?? 0,
        r.balanceAmount ?? r.ckCo ?? 0,
        r.aging0_30 ?? 0,
        r.aging31_60 ?? 0,
        r.aging61_90 ?? 0,
        r.agingOver90 ?? 0,
        r.maxAgingDays ?? r.agingDays ?? 0,
      ].join(","),
    );
  }

  const csvContent = "\uFEFF" + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `Chi_phi_phai_tra_khach_hang_garage_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 2000);
}
