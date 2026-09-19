import { useTranslation } from "react-i18next";
import { Landmark, Receipt, Sparkles, CheckCircle2 } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { ComingSoonTabContent } from "../VoucherNetoffSelectionModal/components/ComingSoonTabContent";
import { ErpInvoiceUnifiedSettlementTable } from "./components/ErpInvoiceUnifiedSettlementTable";
import { useErpInvoiceSettlement } from "./context/ErpInvoiceSettlementContext";
import {
  type ErpInvoiceSettlementTabProps,
  type SettlementSubTabKey,
  type SettlementTableViewPreset,
} from "./types";

export function ErpInvoiceSettlementTab(props?: ErpInvoiceSettlementTabProps) {
  void props;
  const { t } = useTranslation(["erpInvoices", "common"]);
  const ctx = useErpInvoiceSettlement();

  const viewPresetItems: {
    key: SettlementTableViewPreset;
    label: string;
    icon: any;
    count: number;
  }[] = [
    {
      key: "all",
      label: t("presetAll", "Tất cả"),
      icon: Landmark,
      count: ctx.totalVouchers,
    },
    {
      key: "suggestions",
      label: t("presetSuggestions", "Gợi ý khớp"),
      icon: Sparkles,
      count: ctx.filteredSuggestions.length,
    },
    {
      key: "selected",
      label: t("presetSelected", "Đang chọn"),
      icon: CheckCircle2,
      count: ctx.selectedIds.length,
    },
    {
      key: "linked",
      label: t("presetLinked", "Đã cấn trừ"),
      icon: Receipt,
      count: ctx.activeVouchers.length,
    },
  ];

  return (
    <div className="space-y-3 pb-2">
      {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + QUICK VIEW PRESETS ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        {/* Bên trái: Sub-Tabs 1. Sao kê / 2. Sổ quỹ */}
        <div className="flex items-center gap-2">
          <PillTabs
            size="sm"
            value={ctx.activeSubTab}
            onValueChange={(val) =>
              ctx.setActiveSubTab(val as SettlementSubTabKey)
            }
            items={[
              {
                value: "bank_statement",
                label: t("tabBankStatement", "1. Sao kê"),
                icon: Landmark,
                badgeCount:
                  ctx.selectedIds.length > 0
                    ? ctx.selectedIds.length
                    : undefined,
              },
              {
                value: "cash_book",
                label: t("tabCashBook", "2. Sổ quỹ"),
                icon: Receipt,
              },
            ]}
          />
        </div>

        {/* Bên phải: Quick View Preset Pills khi ở tab Sao kê */}
        {ctx.activeSubTab === "bank_statement" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-0.5">
              {viewPresetItems.map((preset) => {
                const isActive = ctx.viewPreset === preset.key;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => ctx.setViewPreset(preset.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap",
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{preset.label}</span>
                    {preset.count > 0 && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
                          isActive
                            ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {preset.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions bên phải */}
            {ctx.selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {money(ctx.totalCurrentNetOff)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={ctx.handleUnselectAll}
                  className="h-6 text-[11px] px-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                >
                  {t("unselect", "Bỏ chọn")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 2. NỘI DUNG CHÍNH (DRAWER SECTION TABLE) ─── */}
      {ctx.activeSubTab === "bank_statement" ? (
        <ErpInvoiceUnifiedSettlementTable />
      ) : (
        <div className="h-[calc(100vh-320px)] min-h-[380px] flex-1 flex flex-col min-h-0 w-full">
          <ComingSoonTabContent
            title={t("comingSoonCashBookTitle", "Sổ quỹ tiền mặt")}
            description={t(
              "comingSoonCashBookDesc",
              "Tính năng đối soát sổ quỹ tiền mặt đang được phát triển.",
            )}
            badge={t("comingSoonBadge", "Sắp ra mắt")}
            className="flex-1 h-full w-full"
          />
        </div>
      )}

      {/* Detail drawer popup */}
      {ctx.detailTxnId && (
        <BankTransactionDetailDrawer
          transactionId={ctx.detailTxnId}
          isOpen={!!ctx.detailTxnId}
          onClose={() => ctx.setDetailTxnId(null)}
        />
      )}
    </div>
  );
}
