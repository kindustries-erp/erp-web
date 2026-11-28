import type {
  GarageCashflowVoucher,
  CreateGarageCashflowVoucherDto,
  GarageCashflowQrFields,
  UpdateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";
import type {
  CashflowFormData,
  InitialCashflowData,
} from "./GarageCashflowDrawer.type";
import { getVoucherPartnerName } from "../../../utils/garageCashflowPartner";

export function buildInitialFormData(
  voucher: GarageCashflowVoucher | null,
  initialData?: InitialCashflowData,
): CashflowFormData {
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
      partnerName: getVoucherPartnerName(voucher),
      autoPartnerName: voucher.partnerName
        ? undefined
        : getVoucherPartnerName(voucher) || undefined,
      partnerPhone: voucher.partnerPhone || "",
      licensePlate: voucher.licensePlate || voucher.case?.bienSoXe || "",
      note: voucher.note || "",
      paymentMethod: voucher.paymentMethod || "",
      paymentContent: voucher.paymentContent || "",
      referenceNumber: voucher.referenceNumber || "",
      caseId: voucher.caseId || "",
      payerType: voucher.payerType || undefined,
      erpBankTransactionId: voucher.erpBankTransactionId || "",
      erpCashVoucherId: voucher.erpCashVoucherId || "",
      paymentStatus:
        voucher.paymentStatus ||
        ((voucher.voucherType || "").toUpperCase() === "PAYMENT"
          ? "PAID"
          : "PAID"),
      ...pickQrFields(voucher),
    };
  }

  const defaultVoucherType = initialData?.voucherType || "RECEIPT";

  return {
    voucherType: defaultVoucherType,
    voucherCode: "",
    transDate: initialData?.transDate || new Date().toISOString().slice(0, 10),
    amount: initialData?.amount || 0,
    partnerName: initialData?.partnerName || "",
    autoPartnerName:
      defaultVoucherType === "RECEIPT" ? initialData?.partnerName : undefined,
    partnerPhone: initialData?.partnerPhone || "",
    licensePlate: initialData?.licensePlate || "",
    note: initialData?.note || "",
    paymentMethod: initialData?.paymentMethod || "",
    paymentContent: initialData?.paymentContent || "",
    referenceNumber: "",
    caseId: initialData?.caseId || "",
    erpBankTransactionId: "",
    erpCashVoucherId: "",
    paymentStatus: defaultVoucherType === "PAYMENT" ? "PENDING" : "PAID",
  };
}

const QR_KEYS = [
  "qrCompanyAccountId",
  "qrBankBin",
  "qrBankCode",
  "qrAccountNumber",
  "qrAccountName",
  "qrTransferContent",
] as const satisfies ReadonlyArray<keyof GarageCashflowQrFields>;

/** Thông tin thanh toán QR: chỉ khóa có giá trị (kể cả null để xóa), chuỗi cắt khoảng trắng. */
export function pickQrFields(
  src: GarageCashflowQrFields,
): GarageCashflowQrFields {
  const out: GarageCashflowQrFields = {};
  for (const key of QR_KEYS) {
    const v = src[key];
    if (v === undefined) continue;
    out[key] = typeof v === "string" && v.trim() ? v.trim() : null;
  }
  return out;
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
    payerType: resolvePayerTypePayload(formData),
    erpBankTransactionId: formData.erpBankTransactionId?.trim() || undefined,
    erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
    ...pickQrFields(formData),
  };
}

/** Chỉ gửi payerType cho phiếu thu gắn phiếu dịch vụ; bỏ trống để API tự gán. */
function resolvePayerTypePayload(
  formData: Partial<CreateGarageCashflowVoucherDto>,
): "KH" | "BH" | undefined {
  const isReceipt =
    (formData.voucherType || "RECEIPT").toUpperCase() === "RECEIPT";
  if (!isReceipt || !formData.caseId?.trim()) return undefined;
  return formData.payerType === "KH" || formData.payerType === "BH"
    ? formData.payerType
    : undefined;
}

/** API giữ giá trị cũ khi nhận undefined, nên trường đã bị xóa phải gửi null. */
function editedText(
  value: string | undefined,
  stored: string | null | undefined,
): string | null | undefined {
  return value?.trim() || (stored ? null : undefined);
}

export function buildUpdatePayload(
  formData: Partial<CreateGarageCashflowVoucherDto>,
  stored?: GarageCashflowVoucher | null,
): UpdateGarageCashflowVoucherDto {
  return {
    voucherType: formData.voucherType
      ? (formData.voucherType.toUpperCase() as "RECEIPT" | "PAYMENT")
      : undefined,
    amount: Number(formData.amount) || 0,
    transDate: formData.transDate,
    partnerName: editedText(
      formData.partnerName,
      getVoucherPartnerName(stored ?? undefined),
    ),
    partnerPhone: formData.partnerPhone?.trim() || undefined,
    licensePlate: formData.licensePlate?.trim() || undefined,
    note: editedText(formData.note, stored?.note),
    paymentMethod: editedText(formData.paymentMethod, stored?.paymentMethod),
    paymentContent: editedText(formData.paymentContent, stored?.paymentContent),
    paymentStatus:
      formData.voucherType?.toUpperCase() === "PAYMENT"
        ? formData.paymentStatus || "PENDING"
        : formData.voucherType?.toUpperCase() === "RECEIPT"
          ? formData.paymentStatus || "PAID"
          : formData.paymentStatus,
    referenceNumber: formData.referenceNumber?.trim() || undefined,
    caseId: editedText(formData.caseId, stored?.caseId),
    payerType: resolvePayerTypePayload(formData),
    erpBankTransactionId: formData.erpBankTransactionId?.trim() || undefined,
    erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
    ...pickQrFields(formData),
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
