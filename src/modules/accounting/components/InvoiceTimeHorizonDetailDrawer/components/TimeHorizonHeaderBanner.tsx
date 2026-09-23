import React from "react";
import { ReceiptText, TrendingUp, RotateCcw } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { FinanceDirectionTabs } from "@/shared/components/FinanceDirectionTabs";

export interface TimeHorizonHeaderBannerProps {
  activeSubTab: "invoices" | "analytics";
  onSubTabChange: (val: "invoices" | "analytics") => void;
  direction: "IN" | "OUT";
  onDirectionChange: (dir: "IN" | "OUT") => void;
  totalInvoices: number;
  receivableCount?: number;
  payableCount?: number;
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
  receivableCount,
  payableCount,
  activeFilterCount,
  onResetFilters,
  t,
}: TimeHorizonHeaderBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 pb-1">
      {/* Bên trái: Sub-Tabs 1. Danh sách hóa đơn / 2. Biến động & Phân tích */}
      <div className="flex items-center gap-2">
        <PillTabs<"invoices" | "analytics">
          size="sm"
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
              value: "analytics",
              label: t(
                "debts:horizonDrawer.tabAnalytics",
                "2. Biến động & Phân tích",
              ),
              icon: TrendingUp,
            },
          ]}
        />
      </div>

      {/* Bên phải: Cụm nút chọn Phải thu / Phải trả + Xóa bộ lọc */}
      <div className="flex items-center gap-2 flex-wrap">
        <FinanceDirectionTabs
          value={direction}
          onChange={onDirectionChange}
          outLabel={t("debts:horizonDrawer.tabReceivablesShort", "Phải thu")}
          inLabel={t("debts:horizonDrawer.tabPayablesShort", "Phải trả")}
          outCount={receivableCount}
          inCount={payableCount}
          size="sm"
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
