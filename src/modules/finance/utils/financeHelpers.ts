import { ChartOfAccount } from "@/modules/accounting/api/catalogApi";
import type { PaymentVoucher } from "@/modules/finance/api/financeApi";
import type {
  BankVoucherForm,
  CashVoucherForm,
} from "@/modules/finance/types/voucherForm";

export const TODAY = new Date().toISOString().split("T")[0];

export function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function voucherNoFromToday(sequence: number, prefix?: string) {
  const today = todayIsoDate();
  const yymmdd = `${today.slice(2, 4)}${today.slice(5, 7)}${today.slice(8, 10)}`;
  const no = `${yymmdd}-${String(sequence).padStart(3, "0")}`;
  return prefix ? `${prefix}-${no}` : no;
}

// ── Period helpers ────────────────────────────────────────────────────────────

export function initPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function periodFirstDay(p: string) {
  return `${p}-01`;
}

export function periodLastDay(p: string) {
  if (!p) return "";
  const [y, m] = p.split("-").map(Number);
  return `${p}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
}

export function monthFirstDay(date: string) {
  if (!date) return "";
  return `${date.slice(0, 7)}-01`;
}

export function initDateFrom() {
  return periodFirstDay(initPeriod());
}

export function initDateTo() {
  return periodLastDay(initPeriod());
}

// Month options: last 24 months descending
export const PERIOD_OPTS: { value: string; label: string }[] = (() => {
  const today = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      value: val,
      label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
    };
  });
})();

// ── Chart helpers ─────────────────────────────────────────────────────────────

export function buildSixMonths(endDate: string) {
  const target = endDate || TODAY;
  const [y, m] = target.slice(0, 7).split("-").map(Number);
  return Array.from({ length: 6 }, (_, idx) => {
    let mi = m - (5 - idx);
    let yi = y;
    while (mi <= 0) {
      mi += 12;
      yi--;
    }
    while (mi > 12) {
      mi -= 12;
      yi++;
    }
    const mStr = String(mi).padStart(2, "0");
    const lastDay = new Date(yi, mi, 0).getDate();
    return {
      fiscalPeriod: `${yi}-${mStr}`,
      from: `${yi}-${mStr}-01`,
      to: `${yi}-${mStr}-${String(lastDay).padStart(2, "0")}`,
      label: `T${mi}`,
    };
  });
}

export function previousDate(date: string) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function parseAmountFilter(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : undefined;
}

export function parseMoneyInput(value: string) {
  const cleaned = value.replace(/\s/g, "").replace(/[^0-9.,]/g, "");
  const lastSeparator = Math.max(
    cleaned.lastIndexOf("."),
    cleaned.lastIndexOf(","),
  );
  const decimalLength =
    lastSeparator >= 0 ? cleaned.length - lastSeparator - 1 : 0;
  const hasDecimal =
    lastSeparator >= 0 && decimalLength > 0 && decimalLength <= 2;

  const normalized = hasDecimal
    ? `${cleaned.slice(0, lastSeparator).replace(/[.,]/g, "")}.${cleaned
        .slice(lastSeparator + 1)
        .replace(/[.,]/g, "")}`
    : cleaned.replace(/[.,]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoneyInput(value: string | number) {
  const n = typeof value === "number" ? value : parseMoneyInput(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function unformatMoneyInput(value: string) {
  return String(parseMoneyInput(value) || "");
}

const DIGITS_VI = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readThreeDigits(num: number, full: boolean) {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;
  const parts: string[] = [];

  if (hundred > 0 || full) {
    parts.push(`${DIGITS_VI[hundred]} trăm`);
  }
  if (ten > 1) {
    parts.push(`${DIGITS_VI[ten]} mươi`);
    if (unit === 1) parts.push("mốt");
    else if (unit === 5) parts.push("lăm");
    else if (unit > 0) parts.push(DIGITS_VI[unit]);
  } else if (ten === 1) {
    parts.push("mười");
    if (unit === 5) parts.push("lăm");
    else if (unit > 0) parts.push(DIGITS_VI[unit]);
  } else if (unit > 0) {
    if (hundred > 0 || full) parts.push("lẻ");
    parts.push(unit === 5 && (hundred > 0 || full) ? "năm" : DIGITS_VI[unit]);
  }

  return parts.join(" ");
}

export function moneyToVietnameseWords(value: string | number) {
  const amount = parseMoneyInput(String(value));
  if (!amount) return "";

  const integer = Math.floor(amount);
  const decimalText = String(Math.round((amount - integer) * 100)).padStart(
    2,
    "0",
  );
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  const groups: number[] = [];
  let n = integer;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (!group) continue;
    const full = i < groups.length - 1 && group < 100;
    words.push(readThreeDigits(group, full), units[i]);
  }

  let result = words.join(" ").replace(/\s+/g, " ").trim() || "không";
  if (decimalText !== "00") {
    result += ` phẩy ${decimalText
      .split("")
      .map((d) => DIGITS_VI[Number(d)])
      .join(" ")}`;
  }

  return `${result.charAt(0).toUpperCase()}${result.slice(1)} đồng`;
}

// ── Donut helpers ─────────────────────────────────────────────────────────────

export const DONUT_COLORS = [
  "#378add",
  "#1a1a1a",
  "#1d9e75",
  "#ef9f27",
  "#b4b2a9",
  "#e05c3a",
];

export const DONUT_EMPTY = [
  { label: "Chưa có dữ liệu", value: 100, color: DONUT_COLORS[4] },
];

export function buildDonutItems(
  byAccount: Record<string, number>,
  coa: ChartOfAccount[],
) {
  const total = Object.values(byAccount).reduce((s, v) => s + v, 0);
  if (!total) return DONUT_EMPTY;

  const sorted = Object.entries(byAccount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  let rem = 100;
  const items = sorted
    .map(([acctId, sum], i) => {
      const pct =
        i === sorted.length - 1 ? rem : Math.round((sum / total) * 100);
      rem -= pct;
      const acct = coa.find((c) => c.id === acctId);
      return {
        label: acct?.account_name ?? `TK-${acctId.slice(0, 6)}`,
        value: Math.max(pct, 0),
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      };
    })
    .filter((it) => it.value > 0);

  return items.length ? items : DONUT_EMPTY;
}

export function emptyForm(
  vtype: "CASH_RECEIPT" | "CASH_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT",
): CashVoucherForm {
  return {
    voucher_no: "",
    voucher_type: vtype,
    document_date: TODAY,
    posting_date: TODAY,
    cash_fund_id: "",
    counterparty_source: "EXTERNAL",
    counterparty_id: "",
    employee_id: "",
    counterparty_name_snapshot: "",
    counterparty_tax_code_snapshot: "",
    counterparty_address_snapshot: "",
    counterparty_phone_snapshot: "",
    counterparty_identity_no_snapshot: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
    amount_in_words: "",
    description: "",
    cancel_reason: "",
    cash_bank_tag_preset_id: "",
    related_documents: [],
  };
}

export function buildForm(v: PaymentVoucher): CashVoucherForm {
  const employeeId =
    typeof v.employee_id === "object" && v.employee_id !== null
      ? (v.employee_id.id ?? "")
      : (v.employee_id ?? "");
  return {
    voucher_no: v.voucher_no,
    voucher_type: v.voucher_type as
      | "CASH_RECEIPT"
      | "CASH_PAYMENT"
      | "CUSTOMER_ADVANCE_RECEIPT",
    document_date: v.document_date,
    posting_date: v.posting_date,
    cash_fund_id: v.cash_fund_id ?? "",
    counterparty_source: v.counterparty_source ?? "EXTERNAL",
    counterparty_id: v.counterparty_id ?? "",
    employee_id: employeeId,
    counterparty_name_snapshot: v.counterparty_name_snapshot,
    counterparty_tax_code_snapshot: v.counterparty_tax_code_snapshot ?? "",
    counterparty_address_snapshot: v.counterparty_address_snapshot ?? "",
    counterparty_phone_snapshot: v.counterparty_phone_snapshot ?? "",
    counterparty_identity_no_snapshot:
      v.counterparty_identity_no_snapshot ?? "",
    debit_account_id: v.debit_account_id,
    credit_account_id: v.credit_account_id,
    amount: formatMoneyInput(v.amount),
    amount_in_words: v.amount_in_words ?? "",
    description: v.description,
    cancel_reason: v.cancel_reason ?? "",
    cash_bank_tag_preset_id: v.cash_bank_tag_preset_id ?? "",
    related_documents: v.related_documents ?? [],
  };
}

export function emptyBankForm(
  vtype: "BANK_RECEIPT" | "BANK_PAYMENT" | "CUSTOMER_ADVANCE_RECEIPT",
): BankVoucherForm {
  return {
    voucher_no: "",
    voucher_type: vtype,
    document_date: TODAY,
    posting_date: TODAY,
    company_bank_account_id: "",
    counterparty_source: "EXTERNAL",
    counterparty_id: "",
    employee_id: "",
    counterparty_name_snapshot: "",
    counterparty_tax_code_snapshot: "",
    counterparty_address_snapshot: "",
    counterparty_phone_snapshot: "",
    counterparty_identity_no_snapshot: "",
    beneficiary_bank_account_id: "",
    debit_account_id: "",
    credit_account_id: "",
    amount: "",
    amount_in_words: "",
    description: "",
    cancel_reason: "",
    cash_bank_tag_preset_id: "",
    related_documents: [],
  };
}

export function buildBankForm(v: PaymentVoucher): BankVoucherForm {
  const employeeId =
    typeof v.employee_id === "object" && v.employee_id !== null
      ? (v.employee_id.id ?? "")
      : (v.employee_id ?? "");
  return {
    voucher_no: v.voucher_no,
    voucher_type: v.voucher_type as
      | "BANK_RECEIPT"
      | "BANK_PAYMENT"
      | "CUSTOMER_ADVANCE_RECEIPT",
    document_date: v.document_date,
    posting_date: v.posting_date,
    company_bank_account_id: v.company_bank_account_id ?? "",
    counterparty_source: v.counterparty_source ?? "EXTERNAL",
    counterparty_id: v.counterparty_id ?? "",
    employee_id: employeeId,
    counterparty_name_snapshot: v.counterparty_name_snapshot,
    counterparty_tax_code_snapshot: v.counterparty_tax_code_snapshot ?? "",
    counterparty_address_snapshot: v.counterparty_address_snapshot ?? "",
    counterparty_phone_snapshot: v.counterparty_phone_snapshot ?? "",
    counterparty_identity_no_snapshot:
      v.counterparty_identity_no_snapshot ?? "",
    beneficiary_bank_account_id: v.beneficiary_bank_account_id ?? "",
    debit_account_id: v.debit_account_id,
    credit_account_id: v.credit_account_id,
    amount: formatMoneyInput(v.amount),
    amount_in_words: v.amount_in_words ?? "",
    description: v.description,
    cancel_reason: v.cancel_reason ?? "",
    cash_bank_tag_preset_id: v.cash_bank_tag_preset_id ?? "",
    related_documents: v.related_documents ?? [],
  };
}
