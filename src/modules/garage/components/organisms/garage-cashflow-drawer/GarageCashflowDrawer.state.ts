import type {
  GarageCashflowVoucher,
  CreateGarageCashflowVoucherDto,
  UpdateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";

export function buildInitialFormData(
  voucher: GarageCashflowVoucher | null,
): Partial<CreateGarageCashflowVoucherDto> {
  if (voucher) {
    return {
      voucherType: (voucher.voucherType || "").toUpperCase() as
        | "RECEIPT"
        | "PAYMENT",
      voucherCode: voucher.voucherCode || "",
      transDate: voucher.transDate
        ? voucher.transDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      amount: Number(voucher.amount) || 0,
      partnerName: voucher.partnerName || voucher.case?.khachHangName || "",
      partnerPhone: voucher.partnerPhone || "",
      licensePlate: voucher.licensePlate || voucher.case?.bienSoXe || "",
      note: voucher.note || "",
      paymentMethod: voucher.paymentMethod || "",
      paymentContent: voucher.paymentContent || "",
      referenceNumber: voucher.referenceNumber || "",
      caseId: voucher.caseId || "",
      erpBankTransactionId: voucher.erpBankTransactionId || "",
      erpCashVoucherId: voucher.erpCashVoucherId || "",
      paymentStatus:
        voucher.paymentStatus ||
        ((voucher.voucherType || "").toUpperCase() === "PAYMENT"
          ? "PAID"
          : "PAID"),
    };
  }

  return {
    voucherType: "RECEIPT",
    transDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentStatus: "PAID",
  };
}

export function buildCreatePayload(
  formData: Partial<CreateGarageCashflowVoucherDto>,
): CreateGarageCashflowVoucherDto {
  return {
    voucherType: (formData.voucherType || "RECEIPT").toUpperCase() as
      | "RECEIPT"
      | "PAYMENT",
    amount: Number(formData.amount) || 0,
    transDate: formData.transDate,
    partnerName: formData.partnerName?.trim() || undefined,
    partnerPhone: formData.partnerPhone?.trim() || undefined,
    licensePlate: formData.licensePlate?.trim() || undefined,
    note: formData.note?.trim() || undefined,
    paymentMethod: formData.paymentMethod || undefined,
    paymentContent: formData.paymentContent?.trim() || undefined,
    paymentStatus:
      (formData.voucherType || "RECEIPT").toUpperCase() === "PAYMENT"
        ? formData.paymentStatus || "PENDING"
        : formData.paymentStatus || "PAID",
    referenceNumber: formData.referenceNumber?.trim() || undefined,
    caseId: formData.caseId?.trim() || undefined,
    erpBankTransactionId: formData.erpBankTransactionId?.trim() || undefined,
    erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
  };
}

export function buildUpdatePayload(
  formData: Partial<CreateGarageCashflowVoucherDto>,
): UpdateGarageCashflowVoucherDto {
  return {
    voucherType: formData.voucherType
      ? (formData.voucherType.toUpperCase() as "RECEIPT" | "PAYMENT")
      : undefined,
    amount: Number(formData.amount) || 0,
    transDate: formData.transDate,
    partnerName: formData.partnerName?.trim() || undefined,
    partnerPhone: formData.partnerPhone?.trim() || undefined,
    licensePlate: formData.licensePlate?.trim() || undefined,
    note: formData.note?.trim() || undefined,
    paymentMethod: formData.paymentMethod || undefined,
    paymentContent: formData.paymentContent?.trim() || undefined,
    paymentStatus:
      formData.voucherType?.toUpperCase() === "PAYMENT"
        ? formData.paymentStatus || "PENDING"
        : formData.voucherType?.toUpperCase() === "RECEIPT"
          ? formData.paymentStatus || "PAID"
          : formData.paymentStatus,
    referenceNumber: formData.referenceNumber?.trim() || undefined,
    caseId: formData.caseId?.trim() || undefined,
    erpBankTransactionId: formData.erpBankTransactionId?.trim() || undefined,
    erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
  };
}

const FIELD_LABELS: Record<string, string> = {
  amount: "Số tiền",
  voucherType: "Loại phiếu",
  transDate: "Ngày giao dịch",
  paymentMethod: "Phương thức thanh toán",
  paymentContent: "Nội dung thanh toán",
  paymentStatus: "Trạng thái thanh toán",
  partnerName: "Tên đối tác",
  partnerPhone: "Số điện thoại",
  licensePlate: "Biển số xe",
  note: "Ghi chú",
  caseId: "Vụ việc dịch vụ",
};

export function computeAuditDiffs(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  t: (key: string, fallback?: string) => string,
) {
  if (!before || !after) return [];
  const diffs: Array<{
    field: string;
    fieldLabel: string;
    oldVal: string;
    newVal: string;
  }> = [];

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const bVal = before[key];
    const aVal = after[key];
    if (
      bVal !== undefined &&
      aVal !== undefined &&
      String(bVal) !== String(aVal)
    ) {
      const formatVal = (v: unknown) => {
        if (key === "amount" && typeof v === "number") {
          return `${Number(v).toLocaleString("vi-VN")} đ`;
        }
        if (key === "paymentStatus") {
          if (v === "PENDING") return "Dự chi";
          if (v === "APPROVED") return "Đã duyệt";
          if (v === "PAID") return "Đã thanh toán";
          if (v === "EXPECTED") return "Dự thu";
        }
        return String(v || "—");
      };
      diffs.push({
        field: key,
        fieldLabel: t(`garage:fields.${key}`, label),
        oldVal: formatVal(bVal),
        newVal: formatVal(aVal),
      });
    }
  }
  return diffs;
}
