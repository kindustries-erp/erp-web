import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  V2TabBarVariant,
  type V2TabItemData,
} from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";

export interface DebtDetailTypeSwitchProps {
  value: "receivables" | "payables";
  onChange: (val: "receivables" | "payables") => void;
  className?: string;
}

export const DebtDetailTypeSwitch: React.FC<DebtDetailTypeSwitchProps> = ({
  value,
  onChange,
  className,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  const tabs = useMemo<V2TabItemData[]>(
    () => [
      {
        key: "receivables",
        label: t("partners.tabReceivables", "Phải thu"),
        icon: <ArrowDownLeft className="w-3.5 h-3.5" />,
      },
      {
        key: "payables",
        label: t("partners.tabPayables", "Phải trả"),
        icon: <ArrowUpRight className="w-3.5 h-3.5" />,
      },
    ],
    [t],
  );

  return (
    <div className={className}>
      <V2TabBar
        variant={V2TabBarVariant.BUTTON_GROUP}
        tabs={tabs}
        activeTabKey={value}
        onTabChange={(key) => onChange(key as "receivables" | "payables")}
        ariaLabel={t("partners.tabDebtType", "Loại công nợ")}
      />
    </div>
  );
};

export const DebtRemainingCasesSwitch = DebtDetailTypeSwitch;
