import * as React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { V2Badge, V2Icon, V2Image, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { TransferQrCompanyInfo } from "../../../transferQr.types";
import "../../../transferQr.locale";

export interface TransferQrPaymentCardHeaderProps {
  isReceive: boolean;
  companyInfo?: TransferQrCompanyInfo;
  displayAccountName: string;
}

export function TransferQrPaymentCardHeader({
  isReceive,
  companyInfo,
  displayAccountName,
}: TransferQrPaymentCardHeaderProps) {
  const { t } = useV2Translation();

  return (
    <>
      {/* Top Bar: Badge phân loại giao dịch (Nhận tiền vs Thanh toán) */}
      <div className="flex items-center justify-start pb-2.5 border-b border-slate-200">
        {isReceive ? (
          <V2Badge
            variant="success"
            size="xs"
            className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap"
          >
            <V2Icon
              icon={ArrowDownLeft}
              size={12}
              className="text-emerald-700 shrink-0"
            />
            <V2Text
              variant="caption"
              weight="bold"
              className="text-emerald-800 text-[10px]"
            >
              {t("v2.transferQr.card.badgeReceive")}
            </V2Text>
          </V2Badge>
        ) : (
          <V2Badge
            variant="warning"
            size="xs"
            className="bg-amber-100 text-amber-900 border-amber-300 gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wide shrink-0 whitespace-nowrap"
          >
            <V2Icon
              icon={ArrowUpRight}
              size={12}
              className="text-amber-800 shrink-0"
            />
            <V2Text
              variant="caption"
              weight="bold"
              className="text-amber-900 text-[10px]"
            >
              {t("v2.transferQr.card.badgePay")}
            </V2Text>
          </V2Badge>
        )}
      </div>

      {/* Thông tin công ty: CHỈ HIỂN THỊ khi là QR Nhận tiền (receiveFromCustomer) */}
      {isReceive && (
        <div className="flex items-center gap-2.5 pt-3 pb-2 min-w-0 border-b border-slate-100">
          {companyInfo?.logo && (
            <V2Image
              src={companyInfo.logo}
              alt="Logo"
              className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white p-0.5 border border-slate-200"
            />
          )}
          <div className="min-w-0 flex-1">
            <V2Text
              variant="body-sm"
              weight="bold"
              className="uppercase tracking-tight text-slate-900 line-clamp-2 leading-snug break-words"
            >
              {displayAccountName}
            </V2Text>
            {companyInfo?.taxCode && (
              <V2Text
                variant="caption"
                className="text-slate-600 font-mono font-medium mt-0.5 block"
              >
                {t("v2.transferQr.card.taxCode")}: {companyInfo.taxCode}
              </V2Text>
            )}
          </div>
        </div>
      )}
    </>
  );
}
