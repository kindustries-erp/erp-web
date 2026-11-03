import { useMemo } from "react";
import { DrawerSection } from "@/v2/shared/components";
import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type {
  BankTheme,
  BankVoucherPreviewProps,
} from "./BankVoucherPreview.type";

function resolveBankTheme(
  bankCode?: string | null,
  bankName?: string | null,
): BankTheme {
  const normalized = `${bankCode || ""} ${bankName || ""}`.toUpperCase();

  if (normalized.includes("BIDV")) {
    return {
      code: "BIDV",
      bankLabel: "BIDV",
      paperTone: "from-emerald-950/20 via-background to-teal-950/10",
      titleColor: "text-emerald-700 dark:text-emerald-400",
      accentBorder: "border-emerald-500/30",
      accentBox: "bg-emerald-950/20",
      stripe: "from-emerald-600 to-teal-600",
    };
  }

  if (normalized.includes("TCB") || normalized.includes("TECHCOMBANK")) {
    return {
      code: "TCB",
      bankLabel: "TECHCOMBANK",
      paperTone: "from-rose-950/20 via-background to-red-950/10",
      titleColor: "text-rose-700 dark:text-rose-400",
      accentBorder: "border-rose-500/30",
      accentBox: "bg-rose-950/20",
      stripe: "from-rose-600 to-red-600",
    };
  }

  return {
    code: "DEFAULT",
    bankLabel: bankName || "Ngân hàng",
    paperTone: "from-surface via-background to-surface/60",
    titleColor: "text-foreground",
    accentBorder: "border-border",
    accentBox: "bg-surface/50",
    stripe: "from-primary to-primary/60",
  };
}

export function BankVoucherPreview({
  transaction,
  t: propT,
}: BankVoucherPreviewProps) {
  const { t: hookT } = useV2Translation();
  const t = propT || hookT;

  const isReceipt = Number(transaction.creditAmount || 0) > 0;
  const amount = isReceipt
    ? Number(transaction.creditAmount || 0)
    : Number(transaction.debitAmount || 0);
  const theme = useMemo(
    () =>
      resolveBankTheme(
        transaction.bankAccount?.bankCode,
        transaction.bankAccount?.bankName,
      ),
    [transaction.bankAccount],
  );

  const docTypeLabel = isReceipt
    ? t("v2.bankStatements.bankDetail.voucher.creditNotice")
    : t("v2.bankStatements.bankDetail.voucher.paymentOrder");

  const sourceAccount =
    [transaction.bankAccount?.bankName, transaction.bankAccount?.accountNumber]
      .filter(Boolean)
      .join(" - ") ||
    transaction.cashBook?.name ||
    "—";

  const counterpart =
    [
      transaction.correspondentName,
      transaction.correspondentAccount,
      transaction.correspondentBank,
    ]
      .filter(Boolean)
      .join(" · ") || "—";

  const dateStr = formatDateTimeParts(transaction.transDate)?.date ?? "—";

  return (
    <DrawerSection
      title={t("v2.bankStatements.bankDetail.voucher.previewTitle")}
    >
      <div
        className={`mx-auto rounded-2xl border ${theme.accentBorder} bg-gradient-to-br ${theme.paperTone} p-5 shadow-sm`}
      >
        <div
          className={`h-1.5 w-full rounded-full bg-gradient-to-r ${theme.stripe}`}
        />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div
            className={`text-xl font-extrabold tracking-wide ${theme.titleColor}`}
          >
            {theme.bankLabel}
          </div>
          <div className="text-right">
            <div
              className={`text-sm font-bold uppercase tracking-wider ${theme.titleColor}`}
            >
              {docTypeLabel}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("v2.bankStatements.bankDetail.voucher.date")}: {dateStr}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("v2.bankStatements.bankDetail.voucher.sourceAccount")}
              </span>
              <div className="mt-1 text-sm font-medium text-foreground">
                {sourceAccount}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("v2.bankStatements.bankDetail.voucher.partner")}
              </span>
              <div className="mt-1 text-sm font-medium text-foreground">
                {counterpart}
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-border/50 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("v2.bankStatements.bankDetail.voucher.description")}
            </span>
            <div className="mt-1 text-xs text-foreground/90">
              {transaction.description || "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border/70 bg-card p-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("v2.bankStatements.bankDetail.voucher.totalAmount")}
            </span>
            <div
              className={`mt-1 font-mono text-2xl font-black ${isReceipt ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {isReceipt
                ? `+${formatAmount(amount)}`
                : `-${formatAmount(amount)}`}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {t("v2.bankStatements.bankDetail.voucher.reference")}:{" "}
            {transaction.referenceNumber || "—"}
          </div>
        </div>
      </div>
    </DrawerSection>
  );
}
