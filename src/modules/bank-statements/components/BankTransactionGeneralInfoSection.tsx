import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { MapPin } from "lucide-react";
import { CopyButton } from "@/shared/components/CopyButton";
import { formatGMT7 } from "@/shared/utils/format";

export interface BankTransactionGeneralInfoSectionProps {
  transaction: any | null;
  className?: string;
  defaultCollapsed?: boolean;
}

export const BankTransactionGeneralInfoSection = React.memo(
  function BankTransactionGeneralInfoSection({
    transaction,
    className = "space-y-3 text-sm",
    defaultCollapsed = false,
  }: BankTransactionGeneralInfoSectionProps) {
    const { t } = useTranslation();

    if (!transaction) return null;

    const partnerName = transaction.correspondentName?.trim() || "";

    const branchLabel =
      transaction.branch?.name ||
      transaction.branch?.branchName ||
      transaction.branchName ||
      transaction.branchId ||
      "—";

    const sourceAccountLabel =
      transaction.sourceType === "BANK"
        ? [
            transaction.bankAccount?.accountName,
            transaction.bankAccount?.accountNumber,
          ]
            .filter(Boolean)
            .join(" - ") ||
          transaction.bankAccount?.accountingAccountId ||
          "—"
        : transaction.cashBook?.name ||
          transaction.cashBook?.accountingAccountId ||
          "—";

    const isPosted = transaction.postingStatus === "POSTED";

    return (
      <DrawerSection
        title={t("bankStatement.generalInfo", {
          defaultValue: "THÔNG TIN CHUNG",
        })}
        collapsible={true}
        defaultCollapsed={defaultCollapsed}
      >
        <div className={className}>
          {/* Tên đối tác */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.partner", { defaultValue: "Đối tác" })}
            </div>
            {partnerName ? (
              <div className="flex items-start justify-between gap-1.5">
                <span className="font-medium text-foreground break-words text-sm">
                  {partnerName}
                </span>
                <CopyButton
                  value={partnerName}
                  tooltip={t("bankStatement.copyName", {
                    defaultValue: "Copy tên",
                  })}
                  copiedTooltip={t("bankStatement.copied", {
                    defaultValue: "Đã copy",
                  })}
                  toastMessage={t("bankStatement.copiedName", {
                    defaultValue: "Đã copy tên đối tác",
                  })}
                  toastId="bank-general-partner-name-copy"
                  className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                />
              </div>
            ) : (
              <div className="font-medium text-muted-foreground/60 text-sm">
                —
              </div>
            )}
          </div>

          {/* Chi nhánh */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.branch", { defaultValue: "Chi nhánh" })}
            </div>
            <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{branchLabel}</span>
            </div>
          </div>

          {/* Tài khoản nguồn */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.sourceAccount", {
                defaultValue: "Tài khoản nguồn",
              })}
            </div>
            <div className="font-medium break-all text-foreground text-sm">
              {sourceAccountLabel}
            </div>
          </div>

          {/* TK kế toán đối ứng */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.correspondentAccountingAccountId", {
                defaultValue: "TK kế toán đối ứng",
              })}
            </div>
            <div className="font-medium break-all text-foreground text-sm font-mono">
              {transaction.correspondentAccountingAccountId || "—"}
            </div>
          </div>

          {/* Ngày giao dịch */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.transDate", { defaultValue: "Ngày giao dịch" })}
            </div>
            <div className="font-medium text-foreground text-sm">
              {formatGMT7(transaction.transDate, "date") || "—"}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t("bankStatement.postingStatus", { defaultValue: "Trạng thái" })}
            </div>
            {isPosted ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t("bankStatement.statusPosted", {
                  defaultValue: "Đã hạch toán",
                })}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t("bankStatement.statusUnposted", {
                  defaultValue: "Chưa hạch toán",
                })}
              </span>
            )}
          </div>
        </div>
      </DrawerSection>
    );
  },
);
