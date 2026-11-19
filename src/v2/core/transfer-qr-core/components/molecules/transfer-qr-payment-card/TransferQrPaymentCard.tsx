import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Check, Copy, QrCode } from "lucide-react";
import { VIETQR_BANKS } from "../../../domain/constants/vietQrBanks";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../transferQr.locale";
import {
  TransferQrMode,
  type TransferQrCompanyInfo,
  type TransferQrAccountOption,
} from "../../../transferQr.types";

export interface TransferQrPaymentCardProps {
  qrDataUrl: string;
  companyInfo?: TransferQrCompanyInfo;
  target: Pick<
    TransferQrAccountOption,
    "bin" | "bankCode" | "accountNumber" | "accountName"
  > | null;
  amount?: number | null;
  content?: string;
  mode?: TransferQrMode;
  cardRef?: React.Ref<HTMLDivElement>;
}

export function TransferQrPaymentCard({
  qrDataUrl,
  companyInfo,
  target,
  amount,
  content,
  mode = TransferQrMode.PAY_TO_SUPPLIER,
  cardRef,
}: TransferQrPaymentCardProps) {
  const { t } = useV2Translation();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const isReceive = mode === TransferQrMode.RECEIVE_FROM_CUSTOMER;

  const bankInfo = React.useMemo(() => {
    if (!target) return null;
    return VIETQR_BANKS.find(
      (b) => b.bin === target.bin || b.code === target.bankCode,
    );
  }, [target]);

  const handleCopy = (field: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const formattedAmount =
    amount != null && amount > 0
      ? `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`
      : t("v2.transferQr.card.amountFree");

  const displayAccountName = isReceive
    ? companyInfo?.companyName || target?.accountName || "CÔNG TY"
    : target?.accountName || "-";

  return (
    <div
      ref={cardRef}
      className="w-full max-w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg text-slate-900 select-none"
    >
      {/* Top Bar: Badge phân loại giao dịch (Nhận tiền vs Thanh toán) + VietQR Napas */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        {isReceive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold tracking-wide border border-emerald-300 shrink-0 whitespace-nowrap">
            <ArrowDownLeft className="h-3 w-3 text-emerald-700 shrink-0" />
            <span>{t("v2.transferQr.card.badgeReceive")}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[10px] font-bold tracking-wide border border-amber-300 shrink-0 whitespace-nowrap">
            <ArrowUpRight className="h-3 w-3 text-amber-800 shrink-0" />
            <span>{t("v2.transferQr.card.badgePay")}</span>
          </span>
        )}
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[9px] font-black tracking-wider text-slate-700 border border-slate-200 shrink-0 whitespace-nowrap">
          {t("v2.transferQr.card.brand")}
        </span>
      </div>

      {/* Thông tin công ty: CHỈ HIỂN THỊ khi là QR Nhận tiền (receiveFromCustomer) */}
      {isReceive && (
        <div className="flex items-center gap-2.5 pt-3 pb-2 min-w-0 border-b border-slate-100">
          {companyInfo?.logo && (
            <img
              src={companyInfo.logo}
              alt="Logo"
              className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white p-0.5 border border-slate-200"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-tight text-slate-900 line-clamp-2 leading-snug break-words">
              {displayAccountName}
            </h4>
            {companyInfo?.taxCode && (
              <p className="text-[11px] text-slate-600 font-mono font-medium mt-0.5">
                {t("v2.transferQr.card.taxCode")}: {companyInfo.taxCode}
              </p>
            )}
          </div>
        </div>
      )}

      {/* QR Code Canvas */}
      <div className="my-3 flex flex-col items-center">
        <div className="relative rounded-xl bg-white p-2.5 shadow-sm border border-slate-200">
          <img
            src={qrDataUrl}
            alt="VietQR"
            className="h-44 w-44 object-contain"
          />
        </div>
        <p className="mt-1.5 text-center text-[11px] font-semibold text-slate-600">
          {bankInfo
            ? `${bankInfo.shortName} (${bankInfo.code})`
            : target?.bankCode || "NAPAS 247"}
        </p>
      </div>

      {/* Details Box */}
      <div className="space-y-1.5 rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-200">
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-slate-500 shrink-0">
            {isReceive
              ? t("v2.transferQr.card.accountName")
              : t("v2.transferQr.card.recipientSupplier")}
            :
          </span>
          <span className="font-bold text-slate-900 uppercase truncate">
            {displayAccountName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <span className="text-slate-500 shrink-0">
            {t("v2.transferQr.card.accountNumber")}:
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
            <span>{target?.accountNumber || "-"}</span>
            {target?.accountNumber && (
              <button
                type="button"
                onClick={() => handleCopy("account", target.accountNumber)}
                className="inline-flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-700"
                title={t("v2.transferQr.card.copy")}
              >
                {copiedField === "account" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-1">
          <span className="text-slate-500 shrink-0">
            {t("v2.transferQr.card.amount")}:
          </span>
          <span className="font-bold text-emerald-700 truncate">
            {formattedAmount}
          </span>
        </div>

        {content && (
          <div className="flex items-start justify-between gap-1 pt-1 border-t border-slate-200">
            <span className="text-slate-500 shrink-0">
              {t("v2.transferQr.card.content")}:
            </span>
            <div className="flex items-center gap-1 max-w-[190px]">
              <span className="font-mono text-[11px] text-slate-800 truncate">
                {content}
              </span>
              <button
                type="button"
                onClick={() => handleCopy("content", content)}
                className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-700"
                title={t("v2.transferQr.card.copy")}
              >
                {copiedField === "content" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-slate-500">
        <QrCode className="h-3 w-3 text-emerald-600 shrink-0" />
        <span className="truncate">
          {isReceive
            ? t("v2.transferQr.card.scanHintReceive")
            : t("v2.transferQr.card.scanHintPay")}
        </span>
      </div>
    </div>
  );
}
