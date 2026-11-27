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
  /** Hàng dài (chủ tài khoản, nội dung) xếp nhãn trên, giá trị xuống dòng dưới; không cắt chữ. */
  stacked?: boolean;
}

export function TransferQrPaymentCardDetails({
  isReceive,
  displayAccountName,
  accountNumber = "-",
  formattedAmount,
  content,
  stacked = false,
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
    <div className="space-y-1.5 rounded-xl bg-muted p-2.5 text-xs border border-border">
      <div
        className={
          stacked
            ? "flex flex-col gap-0.5"
            : "flex items-baseline justify-between gap-1"
        }
      >
        <V2Text variant="caption" className="text-muted-foreground shrink-0">
          {isReceive
            ? t("v2.transferQr.card.accountName")
            : t("v2.transferQr.card.recipientSupplier")}
          :
        </V2Text>
        <V2Text
          variant="body-sm"
          weight="bold"
          className={
            stacked
              ? "text-foreground uppercase break-words"
              : "text-foreground uppercase truncate"
          }
        >
          {displayAccountName}
        </V2Text>
      </div>

      <div className="flex items-center justify-between gap-1">
        <V2Text variant="caption" className="text-muted-foreground shrink-0">
          {t("v2.transferQr.card.accountNumber")}:
        </V2Text>
        <div className="flex items-center gap-1 font-mono font-bold text-foreground">
          <V2Text variant="numeric" weight="bold" className="text-foreground">
            {accountNumber}
          </V2Text>
          {accountNumber !== "-" && (
            <V2Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleCopy("account", accountNumber)}
              className="h-4 w-4 text-muted-foreground hover:text-muted-foreground p-0 print:hidden"
              title={t("v2.transferQr.card.copy")}
            >
              {copiedField === "account" ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </V2Button>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1">
        <V2Text variant="caption" className="text-muted-foreground shrink-0">
          {t("v2.transferQr.card.amount")}:
        </V2Text>
        {formattedAmount && (
          <V2Text
            variant="currency"
            weight="bold"
            className="text-success truncate"
          >
            {formattedAmount}
          </V2Text>
        )}
      </div>

      {content && (
        <div
          className={
            stacked
              ? "flex flex-col gap-0.5 pt-1 border-t border-border"
              : "flex items-start justify-between gap-1 pt-1 border-t border-border"
          }
        >
          <V2Text variant="caption" className="text-muted-foreground shrink-0">
            {t("v2.transferQr.card.content")}:
          </V2Text>
          <div
            className={
              stacked
                ? "flex items-start gap-1 min-w-0"
                : "flex items-center gap-1 max-w-[190px]"
            }
          >
            <V2Text
              variant="caption"
              className={
                stacked
                  ? "font-mono text-foreground break-all"
                  : "font-mono text-foreground truncate"
              }
            >
              {content}
            </V2Text>
            <V2Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleCopy("content", content)}
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-muted-foreground p-0 print:hidden"
              title={t("v2.transferQr.card.copy")}
            >
              {copiedField === "content" ? (
                <Check className="h-3 w-3 text-success" />
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
