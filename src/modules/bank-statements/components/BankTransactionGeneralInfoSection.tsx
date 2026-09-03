import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Building2, MapPin, CreditCard, Calendar } from "lucide-react";
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
              <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-sm">
                <div className="flex items-start gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span className="break-words">{partnerName}</span>
                </div>
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
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
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
            <div className="flex items-start gap-1.5 font-medium break-all text-foreground text-sm">
              <CreditCard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{sourceAccountLabel}</span>
            </div>
          </div>

          {/* Ngày giao dịch */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("bankStatement.transDate", { defaultValue: "Ngày giao dịch" })}
            </div>
            <div className="flex items-start gap-1.5 font-medium text-foreground text-sm">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{formatGMT7(transaction.transDate, "date") || "—"}</span>
            </div>
          </div>
        </div>
      </DrawerSection>
    );
  },
);
