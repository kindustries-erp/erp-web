import { readVietnameseCurrency } from "@/shared/utils/format";
import type {
  GarageCashflowPrintData,
  GarageCashflowPrintSource,
} from "./GarageCashflowPrintTemplate.type";

export function buildGarageCashflowPrintReason(
  source: GarageCashflowPrintSource,
): string {
  const base = (source.paymentContent || source.note || "")
    .trim()
    .replace(/^\d+\.\s*/, "");
  const plate = (source.licensePlate || source.case?.bienSoXe || "").trim();
  if (!base) return plate ? `Biển số: ${plate}` : "";
  if (!plate) return base;
  return `${base} - Biển số: ${plate}`;
}

export function buildGarageCashflowPrintData(
  source: GarageCashflowPrintSource,
  qrOptions?: {
    qrCodeDataUrl?: string | null;
    qrBankHint?: string | null;
    qrTarget?: GarageCashflowPrintData["qrTarget"];
    qrContent?: string;
    qrMode?: GarageCashflowPrintData["qrMode"];
  },
): GarageCashflowPrintData {
  const amount = Number(source.amount) || 0;
  return {
    variant: source.voucherType,
    voucherCode: source.voucherCode,
    transDate: source.transDate,
    partyName: source.partnerName || source.case?.khachHangName || "",
    partyAddress: "",
    reason: buildGarageCashflowPrintReason(source),
    amount,
    amountInWords: readVietnameseCurrency(amount),
    note: source.note || "",
    qrCodeDataUrl: qrOptions?.qrCodeDataUrl,
    qrBankHint: qrOptions?.qrBankHint,
    qrTarget: qrOptions?.qrTarget,
    qrContent: qrOptions?.qrContent,
    qrMode: qrOptions?.qrMode,
  };
}
