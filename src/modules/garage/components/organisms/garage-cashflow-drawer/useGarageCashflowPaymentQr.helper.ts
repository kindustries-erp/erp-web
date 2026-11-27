import {
  buildVietQrPayload,
  isValidAccountNumber,
  renderVietQrDataUrl,
  resolveBankLogoUrl,
  TransferQrMode,
  VIETQR_BANKS,
  type TransferQrAccountOption,
} from "@/v2/core/transfer-qr-core";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowQrFields,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

export function buildVoucherTransferContent(
  voucher: GarageCashflowVoucher | null,
  formData: Partial<CreateGarageCashflowVoucherDto>,
): string {
  const note = (formData.note ?? voucher?.note ?? "").trim();
  if (note) return note;
  const code = voucher?.voucherCode || formData.voucherCode || "";
  const plate =
    voucher?.licensePlate ||
    voucher?.case?.bienSoXe ||
    formData.licensePlate ||
    "";
  return code ? (plate ? `${code} ${plate}` : code).trim() : "";
}

export async function generateVietQrDataUrl(params: {
  bin: string | null;
  accountNumber: string;
  amount: number | null;
  content: string;
}): Promise<string | null> {
  const { bin, accountNumber, amount, content } = params;
  if (
    !bin ||
    !accountNumber.trim() ||
    !isValidAccountNumber(accountNumber.trim())
  ) {
    return null;
  }
  try {
    const payload = buildVietQrPayload({
      bin,
      accountNumber: accountNumber.trim(),
      amount: amount && amount > 0 ? amount : null,
      content: content.trim(),
    });
    return await renderVietQrDataUrl(payload);
  } catch {
    return null;
  }
}

/** Thông tin thanh toán đang hiệu lực để dựng QR (đã lưu, hoặc mặc định khi phiếu chưa lưu). */
export interface VoucherQrInfo {
  accountId: string | null;
  bin: string | null;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  content: string;
}

export function hasSavedQrInfo(saved: GarageCashflowQrFields): boolean {
  return Boolean(saved.qrBankBin || saved.qrAccountNumber);
}

/**
 * Ưu tiên thông tin đã lưu trên phiếu. Phiếu chưa lưu: phiếu thu dùng tài khoản công ty đầu tiên
 * (tên người nhận = tên công ty), phiếu chi để trống (không có QR).
 */
export function resolveVoucherQrInfo(params: {
  isReceipt: boolean;
  saved: GarageCashflowQrFields;
  defaultContent: string;
  companyAccounts: readonly TransferQrAccountOption[];
  companyName?: string | null;
}): VoucherQrInfo {
  const { isReceipt, saved, defaultContent, companyAccounts, companyName } =
    params;
  const content = saved.qrTransferContent ?? defaultContent;
  if (hasSavedQrInfo(saved)) {
    return {
      accountId: saved.qrCompanyAccountId ?? null,
      bin: saved.qrBankBin ?? null,
      bankCode: saved.qrBankCode ?? "",
      accountNumber: saved.qrAccountNumber ?? "",
      accountName: saved.qrAccountName ?? "",
      content,
    };
  }
  const first = isReceipt ? companyAccounts[0] : undefined;
  return {
    accountId: first?.id ?? null,
    bin: first?.bin ?? null,
    bankCode: first?.bankCode ?? "",
    accountNumber: first?.accountNumber ?? "",
    accountName: first ? companyName || first.accountName : "",
    content,
  };
}

/** Bỏ dấu cách, chấm, gạch người dùng hay gõ trong số tài khoản. */
export function normalizeAccountNumber(raw: string): string {
  return raw.replace(/[\s.-]/g, "");
}

/** Số tài khoản QR đã nhập nhưng sai định dạng (rỗng thì hợp lệ). */
export function isQrAccountNumberInvalid(value?: string | null): boolean {
  const v = (value ?? "").trim();
  return Boolean(v) && !isValidAccountNumber(v);
}

const QR_PATCH_KEYS: Record<keyof VoucherQrInfo, keyof GarageCashflowQrFields> =
  {
    accountId: "qrCompanyAccountId",
    bin: "qrBankBin",
    bankCode: "qrBankCode",
    accountNumber: "qrAccountNumber",
    accountName: "qrAccountName",
    content: "qrTransferContent",
  };

/** Chỉ đổi các field có trong patch (giữ nguyên chuỗi rỗng để ô hiển thị đúng). */
export function toQrPatchFields(
  patch: Partial<VoucherQrInfo>,
): GarageCashflowQrFields {
  const out: GarageCashflowQrFields = {};
  for (const [k, field] of Object.entries(QR_PATCH_KEYS) as [
    keyof VoucherQrInfo,
    keyof GarageCashflowQrFields,
  ][]) {
    if (k in patch) out[field] = patch[k] ?? null;
  }
  return out;
}

/** Field ngân hàng (không gồm nội dung) để xóa khi đổi loại phiếu mới. */
export const EMPTY_QR_BANK_FIELDS: GarageCashflowQrFields = {
  qrCompanyAccountId: null,
  qrBankBin: null,
  qrBankCode: null,
  qrAccountNumber: null,
  qrAccountName: null,
};

/** Chuyển thông tin hiệu lực sang field lưu trên phiếu. */
export function toQrFields(info: VoucherQrInfo): GarageCashflowQrFields {
  return {
    qrCompanyAccountId: info.accountId,
    qrBankBin: info.bin,
    qrBankCode: info.bankCode || null,
    qrAccountNumber: info.accountNumber || null,
    qrAccountName: info.accountName || null,
    qrTransferContent: info.content || null,
  };
}

export function formatQrBankHint(info: VoucherQrInfo): string | null {
  if (!info.bankCode && !info.accountNumber) return null;
  return `${info.bankCode || "BANK"} - ${info.accountNumber}`;
}

export type VoucherPrintQrTarget = Pick<
  TransferQrAccountOption,
  "bin" | "bankCode" | "accountNumber" | "accountName" | "logoUrl"
>;

/** Tải trước logo ngân hàng sang Data URL để iframe in hiển thị tức thì; lỗi trả về "" (rơi về text). */
async function preloadBankLogoDataUrl(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  if (typeof fetch !== "function" || typeof FileReader === "undefined") {
    return "";
  }
  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), 1500)
    : undefined;
  try {
    const res = await fetch(url, { signal: controller?.signal });
    if (!res.ok) return "";
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return "";
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Dựng QR để in từ phiếu đã lưu (số tiền = số tiền phiếu). */
export async function buildVoucherPrintQr(
  voucher: GarageCashflowVoucher,
  companyAccounts: readonly TransferQrAccountOption[],
  companyName?: string | null,
): Promise<{
  qrCodeDataUrl: string | null;
  qrBankHint: string | null;
  qrTarget?: VoucherPrintQrTarget | null;
  qrContent?: string;
  qrMode?: TransferQrMode;
}> {
  const isReceipt = (voucher.voucherType || "").toUpperCase() === "RECEIPT";
  const info = resolveVoucherQrInfo({
    isReceipt,
    saved: voucher,
    defaultContent: buildVoucherTransferContent(voucher, {}),
    companyAccounts,
    companyName,
  });
  const qrCodeDataUrl = await generateVietQrDataUrl({
    bin: info.bin,
    accountNumber: info.accountNumber,
    amount: Number(voucher.amount) || null,
    content: info.content,
  });
  if (!qrCodeDataUrl) {
    return { qrCodeDataUrl: null, qrBankHint: null };
  }
  const matchedAcc = companyAccounts.find((a) => a.id === info.accountId);
  const bankInfo = VIETQR_BANKS.find(
    (b) => b.bin === info.bin || b.code === info.bankCode,
  );
  const resolvedCode = bankInfo?.code || info.bankCode;
  const rawLogoUrl = resolvedCode
    ? resolveBankLogoUrl(resolvedCode, matchedAcc?.logoUrl ?? bankInfo?.logoUrl)
    : "";
  const preloadedLogo = await preloadBankLogoDataUrl(rawLogoUrl);
  const finalLogoUrl = preloadedLogo || rawLogoUrl;
  return {
    qrCodeDataUrl,
    qrBankHint: formatQrBankHint(info),
    qrTarget:
      info.bin && info.accountNumber
        ? {
            bin: info.bin,
            bankCode: info.bankCode,
            accountNumber: info.accountNumber,
            accountName: info.accountName,
            logoUrl: finalLogoUrl,
          }
        : null,
    qrContent: info.content,
    qrMode: isReceipt
      ? TransferQrMode.RECEIVE_FROM_CUSTOMER
      : TransferQrMode.PAY_TO_SUPPLIER,
  };
}
