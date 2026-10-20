import React from "react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
import { GARAGE_CASE_STATUS_TABS } from "../../../utils/garageCaseViewPresets";
import type { GarageCaseStatusTabsProps } from "./GarageCaseStatusTabs.type";

export const GarageCaseStatusTabs: React.FC<GarageCaseStatusTabsProps> = ({
  value,
  onChange,
  className,
}) => {
  const { t } = useTranslation("garage");

  return (
    <PillTabs
      className={className ?? "w-full sm:w-auto shrink-0"}
      size="sm"
      items={GARAGE_CASE_STATUS_TABS.map((tab) => ({
        value: tab.value,
        label: t(tab.labelKey, tab.defaultLabel),
      }))}
      value={value}
      onValueChange={onChange}
    />
  );
};
