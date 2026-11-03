import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Building2, TrendingUp } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { BankTransactionPartnerSubTab } from "@/modules/bank-statements/components/BankTransactionDetailTab/BankTransactionPartnerSubTab";
import { BankTransactionAnalyticsSubTab } from "@/modules/bank-statements/components/BankTransactionDetailTab/BankTransactionAnalyticsSubTab";
import type {
  BankTransactionPartnerSubTabKey,
  BankTransactionPartnerSectionProps,
} from "./BankTransactionDetailDrawer.type";

export const BankTransactionPartnerSection = React.memo(
  function BankTransactionPartnerSection({
    transaction,
    defaultSubTab = "partner",
    onSelectTransaction,
  }: BankTransactionPartnerSectionProps) {
    const { t } = useTranslation();
    const [subTab, setSubTab] =
      useState<BankTransactionPartnerSubTabKey>(defaultSubTab);

    const navItems = useMemo(
      () => [
        {
          value: "partner" as const,
          label: t("bankStatement.subTabPartnerList", {
            defaultValue: "1. Bảng kê đối tác",
          }),
          icon: Building2,
        },
        {
          value: "analytics" as const,
          label: t("bankStatement.subTabAnalytics", {
            defaultValue: "2. Biến động & Phân tích",
          }),
          icon: TrendingUp,
        },
      ],
      [t],
    );

    return (
      <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
        <div className="flex items-center justify-between gap-2.5 pt-0.5 pb-1 w-full shrink-0">
          <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
            <PillTabs<BankTransactionPartnerSubTabKey>
              size="sm"
              value={subTab}
              onValueChange={setSubTab}
              items={navItems}
            />
          </div>
        </div>

        {subTab === "partner" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            <BankTransactionPartnerSubTab
              transaction={transaction}
              onSelectTransaction={onSelectTransaction}
            />
          </div>
        )}

        {subTab === "analytics" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
            <BankTransactionAnalyticsSubTab transaction={transaction} />
          </div>
        )}
      </div>
    );
  },
);
