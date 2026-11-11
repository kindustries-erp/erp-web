import {
  AmortizationMethod,
  PortfolioMonthlyPeriod,
} from "../types/loan.types";

export interface LoanMethodOption {
  value: AmortizationMethod;
  label: string;
}

/**
 * Định dạng số tiền sang chuẩn VNĐ (ví dụ: 500.000.000 ₫)
 */
export function formatVndCurrency(val: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(val || 0))} ₫`;
}

/**
 * Định dạng rút gọn kèm đơn vị đọc dễ hiểu (tỷ / triệu) dưới ô nhập liệu
 */
export function formatVndHelper(val: number): string {
  const num = Number(val) || 0;
  if (num <= 0) return "0 ₫";
  const formatted = formatVndCurrency(num);
  if (num >= 1_000_000_000) {
    const billions = (num / 1_000_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    });
    return `${formatted} (${billions} tỷ)`;
  }
  if (num >= 1_000_000) {
    const millions = (num / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 2,
    });
    return `${formatted} (${millions} triệu)`;
  }
  return formatted;
}

/**
 * Danh sách tùy chọn phương thức trả nợ dùng cho V2Combobox
 */
export function getAmortizationMethodOptions(
  t: (key: string, fallback: string) => string,
): LoanMethodOption[] {
  return [
    {
      value: AmortizationMethod.AMORTIZED,
      label: t("v2.loans.methods.AMORTIZED", "Niên kim (Gốc + Lãi đều)"),
    },
    {
      value: AmortizationMethod.EQUAL_PRINCIPAL,
      label: t("v2.loans.methods.EQUAL_PRINCIPAL", "Dư nợ giảm dần (Gốc đều)"),
    },
    {
      value: AmortizationMethod.BULLET,
      label: t(
        "v2.loans.methods.BULLET",
        "Cuối kỳ (Trả lãi định kỳ, gốc cuối kỳ)",
      ),
    },
    {
      value: AmortizationMethod.FLAT,
      label: t(
        "v2.loans.methods.FLAT",
        "Lãi phẳng (Tính theo dư nợ gốc ban đầu)",
      ),
    },
  ];
}

/**
 * Xuất bảng lịch trả nợ danh mục gộp ra tệp CSV UTF-8 có BOM
 */
export function exportPortfolioScheduleCsv(
  schedule: PortfolioMonthlyPeriod[],
  headers: string[],
): void {
  const rows = schedule.map((p) => [
    p.monthKey,
    p.paymentDate,
    Math.round(p.principalDue),
    Math.round(p.interestDue),
    Math.round(p.totalPayment),
    Math.round(p.remainingPrincipal),
    p.loansCount,
  ]);
  const csv =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csv));
  link.setAttribute("download", `lich-tra-no-danh-muc-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
