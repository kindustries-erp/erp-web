import QRCode from "qrcode";
import {
  buildVietQrPayload,
  isValidAccountNumber,
} from "@/v2/core/transfer-qr-core";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

export function buildVoucherTransferContent(
  voucher: GarageCashflowVoucher | null,
  formData: Partial<CreateGarageCashflowVoucherDto>,
): string {
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
    return await QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "H",
    });
  } catch {
    return null;
  }
}
