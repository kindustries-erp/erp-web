import React from "react";
import { useTranslation } from "react-i18next";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface CustomerDetailDebtSwitchProps {
  value: "receivables" | "payables";
  onChange: (val: "receivables" | "payables") => void;
  className?: string;
}

export const CustomerDetailDebtSwitch: React.FC<
  CustomerDetailDebtSwitchProps
> = ({ value, onChange, className }) => {
  const { t } = useTranslation(["garage", "common"]);

  const items: PillTabItem<"receivables" | "payables">[] = [
    {
      value: "receivables",
      label: t("partners.tabReceivables", "Phải thu"),
      icon: ArrowDownLeft,
    },
    {
      value: "payables",
      label: t("partners.tabPayables", "Phải trả"),
      icon: ArrowUpRight,
    },
  ];

  return (
    <PillTabs<"receivables" | "payables">
      size="sm"
      variant="button-group"
      value={value}
      onValueChange={onChange}
      items={items}
      className={className}
    />
  );
};
