import React from "react";
import { BarChart3, CreditCard, Ban } from "lucide-react";

export interface ExclusionOptionDef {
  key: "excludeFromReports" | "excludeFromDebt";
  icon: React.ReactNode;
  labelKey: string;
  labelDefault: string;
  descKey: string;
  descDefault: string;
  activeBorder: string;
}

export const EXCLUSION_OPTIONS: ExclusionOptionDef[] = [
  {
    key: "excludeFromReports",
    icon: (
      <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 shrink-0">
        <Ban className="w-3 h-3" />
        <BarChart3 className="w-3 h-3" />
      </span>
    ),
    labelKey: "cases.drawer.excludeFromReports",
    labelDefault: "Không tính vào báo cáo",
    descKey: "cases.drawer.excludeFromReportsDesc",
    descDefault: "Loại trừ khỏi Báo cáo P&L, Checkpoint & Doanh thu Garage",
    activeBorder: "border-amber-600 dark:border-amber-400",
  },
  {
    key: "excludeFromDebt",
    icon: (
      <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 shrink-0">
        <Ban className="w-3 h-3" />
        <CreditCard className="w-3 h-3" />
      </span>
    ),
    labelKey: "cases.drawer.excludeFromDebt",
    labelDefault: "Không theo dõi công nợ",
    descKey: "cases.drawer.excludeFromDebtDesc",
    descDefault: "Loại trừ khỏi Sổ theo dõi công nợ khách hàng Garage",
    activeBorder: "border-rose-600 dark:border-rose-400",
  },
];

export function getExclusionTooltipContent(
  hasAnyExclusion: boolean,
  excludeFromReports: boolean,
  excludeFromDebt: boolean,
  defaultLabel: string,
): string {
  if (!hasAnyExclusion) return defaultLabel;
  return [
    excludeFromReports && "Loại trừ khỏi báo cáo P&L",
    excludeFromDebt && "Loại trừ khỏi công nợ",
  ]
    .filter(Boolean)
    .join(", ");
}
