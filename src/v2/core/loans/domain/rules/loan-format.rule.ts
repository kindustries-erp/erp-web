import {
  AmortizationMethod,
  LoanStatus,
  PortfolioMonthlyPeriod,
} from "../types/loan.types";

export interface LoanMethodOption {
  value: AmortizationMethod;
  label: string;
}

export interface LoanStatusBadgeConfig {
  label: string;
  variant: "default" | "outline" | "destructive";
}

export function getLoanStatusConfig(
  status: LoanStatus,
  t: (key: string, fallback?: string) => string,
): LoanStatusBadgeConfig {
  const map: Record<LoanStatus, LoanStatusBadgeConfig> = {
    [LoanStatus.ACTIVE]: {
      label: t("v2.loans.status.ACTIVE", "Đang vay"),
      variant: "default",
    },
    [LoanStatus.DRAFT]: {
      label: t("v2.loans.status.DRAFT", "Dự thảo"),
      variant: "outline",
    },
    [LoanStatus.COMPLETED]: {
      label: t("v2.loans.status.COMPLETED", "Đã tất toán"),
      variant: "outline",
    },
    [LoanStatus.OVERDUE]: {
      label: t("v2.loans.status.OVERDUE", "Quá hạn"),
      variant: "destructive",
    },
  };
  return map[status] ?? { label: status, variant: "outline" };
}

/** Danh sách tùy chọn trạng thái khoản vay dùng cho filter bảng và filterGroup. */
export function getLoanStatusOptions(
  t: (key: string, fallback?: string) => string,
): Array<{ value: LoanStatus; label: string }> {
  return [
    {
      value: LoanStatus.ACTIVE,
      label: t("v2.loans.status.ACTIVE", "Đang vay"),
    },
    { value: LoanStatus.DRAFT, label: t("v2.loans.status.DRAFT", "Dự thảo") },
    {
      value: LoanStatus.COMPLETED,
      label: t("v2.loans.status.COMPLETED", "Đã tất toán"),
    },
    {
      value: LoanStatus.OVERDUE,
      label: t("v2.loans.status.OVERDUE", "Quá hạn"),
    },
  ];
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
      label: t(
        "v2.loans.methods.AMORTIZED",
        "Trả góp đều cố định (Gốc + Lãi bằng nhau) - Vay tín chấp, Mua nhà, Mua xe",
      ),
    },
    {
      value: AmortizationMethod.EQUAL_PRINCIPAL,
      label: t(
        "v2.loans.methods.EQUAL_PRINCIPAL",
        "Dư nợ giảm dần (Gốc chia đều, lãi giảm dần) - Vay thế chấp BĐS, Mua xe",
      ),
    },
    {
      value: AmortizationMethod.BULLET,
      label: t(
        "v2.loans.methods.BULLET",
        "Trả lãi hàng tháng, gốc trả cuối kỳ - Vay vốn kinh doanh, Vốn lưu động",
      ),
    },
    {
      value: AmortizationMethod.GRACE_PERIOD,
      label: t(
        "v2.loans.methods.GRACE_PERIOD",
        "Ân hạn gốc (Chỉ trả lãi giai đoạn đầu, gốc trả sau) - Vay dự án BĐS ưu đãi CĐT",
      ),
    },
    {
      value: AmortizationMethod.FLAT,
      label: t(
        "v2.loans.methods.FLAT",
        "Lãi cố định trên gốc ban đầu (Lãi phẳng) - Vay tiêu dùng công ty tài chính",
      ),
    },
    {
      value: AmortizationMethod.MATURITY_LUMP_SUM,
      label: t(
        "v2.loans.methods.MATURITY_LUMP_SUM",
        "Thanh toán 1 lần khi đáo hạn (Gốc + Lãi cuối kỳ) - Vay ngắn hạn đặc thù",
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
