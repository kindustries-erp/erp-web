import type { LoanSchedulePeriod } from "../../../domain/types/loan.types";

export function exportAmortizationScheduleCsv(
  schedule: LoanSchedulePeriod[],
  headers: string[],
) {
  const rows = schedule.map((p) => [
    p.periodNumber,
    p.dueDate,
    Math.round(p.beginningBalance),
    Math.round(p.principalDue),
    Math.round(p.interestDue),
    Math.round(p.totalPaymentDue),
    Math.round(p.endingBalance),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `bang-tinh-khoan-vay-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
