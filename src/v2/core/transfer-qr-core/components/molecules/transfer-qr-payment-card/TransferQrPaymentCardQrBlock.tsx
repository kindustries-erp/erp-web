import * as React from "react";
import { V2Image, V2Text } from "@/v2/shared/components/atoms";
import type { VietQrBank } from "../../../domain/constants/vietQrBanks";
import {
  VIETQR_HORIZONTAL_LOGO,
  NAPAS_247_LOGO,
} from "../../../assets/vietQrBrandAssets";

export interface TransferQrPaymentCardQrBlockProps {
  qrDataUrl: string;
  centerLogoSrc: string;
  onCenterLogoError: () => void;
  bankLogoUrl: string | null;
  imgFailed: boolean;
  onBankLogoError: () => void;
  bankInfo?: VietQrBank | null;
  targetBankCode?: string;
  compact?: boolean;
}

export function TransferQrPaymentCardQrBlock({
  qrDataUrl,
  centerLogoSrc,
  onCenterLogoError,
  bankLogoUrl,
  imgFailed,
  onBankLogoError,
  bankInfo,
  targetBankCode,
  compact = false,
}: TransferQrPaymentCardQrBlockProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center shrink-0"
          : "my-3 flex flex-col items-center"
      }
    >
      {/* Logo VietQR thương hiệu phía trên QR */}
      <div className="mb-1.5 flex items-center justify-center">
        <V2Image
          src={VIETQR_HORIZONTAL_LOGO}
          alt="VietQR"
          className={
            compact ? "h-5 w-auto object-contain" : "h-6 w-auto object-contain"
          }
        />
      </div>

      {/* Khung QR code kèm Logo ở tâm */}
      <div className="relative rounded-xl bg-white p-2 shadow-sm border border-slate-200">
        <V2Image
          src={qrDataUrl}
          alt="VietQR"
          className={
            compact ? "h-28 w-28 object-contain" : "h-44 w-44 object-contain"
          }
        />
        <div
          className={
            compact
              ? "absolute inset-0 m-auto flex h-7 w-7 items-center justify-center rounded-md bg-white p-0.5 shadow-sm border border-slate-100"
              : "absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white p-0.5 shadow-sm border border-slate-100"
          }
        >
          <V2Image
            src={centerLogoSrc}
            alt="Center Logo"
            className="h-full w-full object-contain rounded"
            crossOrigin="anonymous"
            onError={onCenterLogoError}
          />
        </div>
      </div>

      {/* Chân QR: Napas 247 | Logo Ngân hàng */}
      <div className="mt-2.5 flex items-center justify-center gap-2.5">
        <V2Image
          src={NAPAS_247_LOGO}
          alt="Napas 247"
          className="h-3.5 w-auto max-w-[70px] object-contain"
        />
        <div className="h-3.5 w-px bg-slate-300" />
        <div className="flex items-center gap-1.5">
          {bankLogoUrl && !imgFailed ? (
            <V2Image
              src={bankLogoUrl}
              alt={bankInfo?.shortName || "Bank Logo"}
              className="h-4.5 w-auto max-w-[64px] object-contain"
              crossOrigin="anonymous"
              onError={onBankLogoError}
              loading="eager"
            />
          ) : (
            <V2Text
              variant="caption"
              weight="semibold"
              className="text-center text-slate-600 block text-xs"
            >
              {bankInfo
                ? `${bankInfo.shortName} (${bankInfo.code})`
                : targetBankCode || "NAPAS 247"}
            </V2Text>
          )}
        </div>
      </div>
    </div>
  );
}
