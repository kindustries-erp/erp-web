import * as React from "react";
import { Check, Copy } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../transferQr.locale";

export interface TransferQrPaymentCardDetailsProps {
  isReceive: boolean;
  displayAccountName: string;
  accountNumber?: string;
  formattedAmount: string;
  content?: string;
}

export function TransferQrPaymentCardDetails({
  isReceive,
  displayAccountName,
  accountNumber = "-",
  formattedAmount,
  content,
}: TransferQrPaymentCardDetailsProps) {
  const { t } = useV2Translation();
  const [copiedField, setCopiedField] = React.useState<
    "account" | "content" | null
  >(null);

  const handleCopy = async (field: "account" | "content", text?: string) => {
    if (!text || text === "-") return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Bỏ qua lỗi copy trên môi trường test/insecure
    }
  };

  return (
    <div className="space-y-1.5 rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-200">
      <div className="flex items-baseline justify-between gap-1">
        <V2Text variant="caption" className="text-slate-500 shrink-0">
          {isReceive
            ? t("v2.transferQr.card.accountName")
            : t("v2.transferQr.card.recipientSupplier")}
          :
        </V2Text>
        <V2Text
          variant="body-sm"
          weight="bold"
          className="text-slate-900 uppercase truncate"
        >
          {displayAccountName}
        </V2Text>
      </div>

      <div className="flex items-center justify-between gap-1">
        <V2Text variant="caption" className="text-slate-500 shrink-0">
          {t("v2.transferQr.card.accountNumber")}:
        </V2Text>
        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
          <V2Text variant="numeric" weight="bold" className="text-slate-900">
            {accountNumber}
          </V2Text>
          {accountNumber !== "-" && (
            <V2Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleCopy("account", accountNumber)}
              className="h-4 w-4 text-slate-400 hover:text-slate-700 p-0"
              title={t("v2.transferQr.card.copy")}
            >
              {copiedField === "account" ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </V2Button>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1">
        <V2Text variant="caption" className="text-slate-500 shrink-0">
          {t("v2.transferQr.card.amount")}:
        </V2Text>
        {formattedAmount && (
          <V2Text
            variant="currency"
            weight="bold"
            className="text-emerald-700 truncate"
          >
            {formattedAmount}
          </V2Text>
        )}
      </div>

      {content && (
        <div className="flex items-start justify-between gap-1 pt-1 border-t border-slate-200">
          <V2Text variant="caption" className="text-slate-500 shrink-0">
            {t("v2.transferQr.card.content")}:
          </V2Text>
          <div className="flex items-center gap-1 max-w-[190px]">
            <V2Text
              variant="caption"
              className="font-mono text-slate-800 truncate"
            >
              {content}
            </V2Text>
            <V2Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleCopy("content", content)}
              className="h-3.5 w-3.5 shrink-0 text-slate-400 hover:text-slate-700 p-0"
              title={t("v2.transferQr.card.copy")}
            >
              {copiedField === "content" ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </V2Button>
          </div>
        </div>
      )}
    </div>
  );
}
