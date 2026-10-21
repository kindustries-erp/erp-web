import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, BookOpen, Link2 } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import type {
  BankTransactionDetailSubTabKey,
  BankTransactionDetailTabNavProps,
} from "./BankTransactionDetailDrawer.type";

export const BankTransactionDetailTabNav = React.memo(
  function BankTransactionDetailTabNav({
    subTab,
    onSubTabChange,
    accountingBadgeCount,
    linkedBadgeCount,
  }: BankTransactionDetailTabNavProps) {
    const { t } = useTranslation();

    const items = useMemo(
      () => [
        {
          value: "details" as const,
          label: t("bankStatement.subTabDetails", {
            defaultValue: "1. Chi tiết giao dịch",
          }),
          icon: FileText,
        },
        {
          value: "accounting" as const,
          label: t("bankStatement.subTabAccounting", {
            defaultValue: "2. Hạch toán kế toán",
          }),
          icon: BookOpen,
          badgeCount:
            accountingBadgeCount && accountingBadgeCount > 0
              ? accountingBadgeCount
              : undefined,
        },
        {
          value: "traceability" as const,
          label: t("bankStatement.subTabTraceability", {
            defaultValue: "3. Chứng từ liên kết",
          }),
          icon: Link2,
          badgeCount:
            linkedBadgeCount && linkedBadgeCount > 0
              ? linkedBadgeCount
              : undefined,
        },
      ],
      [t, accountingBadgeCount, linkedBadgeCount],
    );

    return (
      <div className="flex items-center justify-between gap-2.5 pt-0.5 pb-1 w-full shrink-0">
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
          <PillTabs<BankTransactionDetailSubTabKey>
            size="sm"
            value={subTab}
            onValueChange={onSubTabChange}
            items={items}
          />
        </div>
      </div>
    );
  },
);
