import React from "react";
import {
  ReceiptText,
  Building2,
  TrendingUp,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import type { TimeHorizonSubTab } from "../types";

export interface TimeHorizonHeaderBannerProps {
  activeSubTab: TimeHorizonSubTab;
  onSubTabChange: (val: TimeHorizonSubTab) => void;
  direction: "IN" | "OUT";
  onDirectionChange: (dir: "IN" | "OUT") => void;
  totalInvoices: number;
  topPartnersCount?: number;
  activeFilterCount: number;
  onResetFilters: () => void;
  t: (key: string, fallback?: any) => string;
}

export function TimeHorizonHeaderBanner({
  activeSubTab,
  onSubTabChange,
  direction,
  onDirectionChange,
  totalInvoices,
  topPartnersCount = 0,
  activeFilterCount,
  onResetFilters,
  t,
}: TimeHorizonHeaderBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 pb-1">
      {/* Bên trái: Sub-Tabs 1. Danh sách hóa đơn / 2. Top đối tác chi phối / 3. Biến động & Phân tích */}
      <div className="flex items-center gap-2">
        <PillTabs<TimeHorizonSubTab>
          size="sm"
          variant="pill"
          value={activeSubTab}
          onValueChange={onSubTabChange}
          items={[
            {
              value: "invoices",
              label: t(
                "debts:horizonDrawer.tabInvoices",
                "1. Danh sách hóa đơn",
              ),
              icon: ReceiptText,
              badgeCount: totalInvoices > 0 ? totalInvoices : undefined,
            },
            {
              value: "top_partners",
              label: t(
                "debts:horizonDrawer.tabTopPartners",
                "2. Top đối tác chi phối",
              ),
              icon: Building2,
              badgeCount: topPartnersCount > 0 ? topPartnersCount : undefined,
            },
            {
              value: "analytics",
              label: t(
                "debts:horizonDrawer.tabAnalytics",
                "3. Biến động & Phân tích",
              ),
              icon: TrendingUp,
            },
          ]}
        />
      </div>

      {/* Bên phải: Cụm nút chọn Phải thu / Phải trả (PillTabs variant button-group) + Xóa bộ lọc */}
      <div className="flex items-center gap-2 flex-wrap">
        <PillTabs<"OUT" | "IN">
          size="sm"
          variant="button-group"
          value={direction}
          onValueChange={onDirectionChange}
          items={[
            {
              value: "OUT",
              label: t("debts:horizonDrawer.tabReceivablesShort", "Phải thu"),
              icon: ArrowUpRight,
            },
            {
              value: "IN",
              label: t("debts:horizonDrawer.tabPayablesShort", "Phải trả"),
              icon: ArrowDownLeft,
            },
          ]}
        />

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="h-7 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-md border border-destructive/20 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>
              {t("common:clearFilters", "Xóa bộ lọc")} ({activeFilterCount})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
