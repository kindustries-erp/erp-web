import React from "react";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";

export interface BankTransactionPartnerEmptyStateProps {
  className?: string;
}

export const BankTransactionPartnerEmptyState = React.memo(
  function BankTransactionPartnerEmptyState({
    className,
  }: BankTransactionPartnerEmptyStateProps) {
    const { t } = useTranslation();

    return (
      <div
        className={`flex flex-col items-center justify-center p-8 text-center bg-surface/50 rounded-xl border border-border/70 gap-3 ${
          className || ""
        }`}
      >
        <Building2 className="w-8 h-8 text-muted-foreground/60" />
        <div className="text-sm font-medium text-foreground">
          {t("bankStatement.noPartnerInfo", {
            defaultValue: "Không có thông tin đối tác",
          })}
        </div>
        <p className="text-xs text-muted-foreground max-w-sm">
          {t("bankStatement.noPartnerInfoDesc", {
            defaultValue:
              "Giao dịch này chưa có tên hoặc số tài khoản đối tác để tra cứu lịch sử giao dịch liên quan.",
          })}
        </p>
      </div>
    );
  },
);
