import { AmortizationMethod } from "../types/loan.types";

export interface LoanPresetItem {
  id: string;
  name: string;
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  lenderName: string;
}

export const LOAN_PRESETS: LoanPresetItem[] = [
  {
    id: "mortgage-amortized",
    name: "Vay mua căn hộ / Nhà (Trả góp đều cố định)",
    principalAmount: 1_500_000_000,
    annualInterestRate: 8.0,
    tenorMonths: 180,
    amortizationMethod: AmortizationMethod.AMORTIZED,
    lenderName: "Ngân hàng TMCP Kỹ Thương (Techcombank)",
  },
  {
    id: "mortgage-declining",
    name: "Vay mua nhà / BĐS thế chấp (Dư nợ giảm dần)",
    principalAmount: 2_000_000_000,
    annualInterestRate: 8.5,
    tenorMonths: 240,
    amortizationMethod: AmortizationMethod.EQUAL_PRINCIPAL,
    lenderName: "Ngân hàng TMCP Ngoại thương (VCB)",
  },
  {
    id: "car-loan",
    name: "Vay mua ô tô (Thế chấp xe)",
    principalAmount: 500_000_000,
    annualInterestRate: 9.0,
    tenorMonths: 60,
    amortizationMethod: AmortizationMethod.AMORTIZED,
    lenderName: "Ngân hàng TMCP Quốc Tế (VIB)",
  },
  {
    id: "personal-unsecured",
    name: "Vay tín chấp tiêu dùng (Theo lương)",
    principalAmount: 100_000_000,
    annualInterestRate: 14.0,
    tenorMonths: 36,
    amortizationMethod: AmortizationMethod.AMORTIZED,
    lenderName: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)",
  },
  {
    id: "working-capital",
    name: "Vay vốn lưu động / Sản xuất kinh doanh",
    principalAmount: 1_000_000_000,
    annualInterestRate: 7.5,
    tenorMonths: 12,
    amortizationMethod: AmortizationMethod.BULLET,
    lenderName: "Ngân hàng TMCP Đầu tư & Phát triển (BIDV)",
  },
  {
    id: "project-grace",
    name: "Vay dự án BĐS (Ân hạn nợ gốc)",
    principalAmount: 2_000_000_000,
    annualInterestRate: 9.5,
    tenorMonths: 120,
    amortizationMethod: AmortizationMethod.GRACE_PERIOD,
    lenderName: "Ngân hàng TMCP Quân Đội (MB Bank)",
  },
  {
    id: "other-custom",
    name: "Khoản vay khác (Tùy chỉnh)",
    principalAmount: 200_000_000,
    annualInterestRate: 10.0,
    tenorMonths: 24,
    amortizationMethod: AmortizationMethod.AMORTIZED,
    lenderName: "",
  },
];

export interface LoanPresetOption {
  value: string;
  label: string;
}

export function getLoanPresetOptions(
  t: (key: string, fallback: string) => string,
): LoanPresetOption[] {
  return [
    {
      value: "mortgage-amortized",
      label: t(
        "v2.loans.presets.mortgageAmortized",
        "🏢 Vay mua căn hộ / Nhà (Trả góp đều cố định)",
      ),
    },
    {
      value: "mortgage-declining",
      label: t(
        "v2.loans.presets.mortgageDeclining",
        "🏠 Vay mua nhà / BĐS thế chấp (Dư nợ giảm dần)",
      ),
    },
    {
      value: "car-loan",
      label: t("v2.loans.presets.carLoan", "🚗 Vay mua ô tô (Thế chấp xe)"),
    },
    {
      value: "personal-unsecured",
      label: t(
        "v2.loans.presets.personalUnsecured",
        "💳 Vay tín chấp tiêu dùng (Theo lương)",
      ),
    },
    {
      value: "working-capital",
      label: t(
        "v2.loans.presets.workingCapital",
        "🏭 Vay vốn lưu động / Sản xuất kinh doanh",
      ),
    },
    {
      value: "project-grace",
      label: t(
        "v2.loans.presets.projectGrace",
        "🏗️ Vay dự án BĐS (Ân hạn nợ gốc)",
      ),
    },
    {
      value: "other-custom",
      label: t("v2.loans.presets.otherCustom", "✨ Khoản vay khác / Tùy chỉnh"),
    },
  ];
}

export function findLoanPresetById(id: string): LoanPresetItem | undefined {
  return LOAN_PRESETS.find((p) => p.id === id);
}
