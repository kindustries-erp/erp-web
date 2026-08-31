import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Landmark, Receipt, DollarSign, ListChecks } from "lucide-react";
import { type DrawerTopTabItem } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { FilterButton } from "@/shared/components/FilterPanel";
import { money } from "@/shared/utils/format";
import { SelectedBankTransactionsTable } from "../components/SelectedBankTransactionsTable";
import { AllBankTransactionsTable } from "../components/AllBankTransactionsTable";
import { ComingSoonTabContent } from "../components/ComingSoonTabContent";
import { OffSystemManualSection } from "../components/OffSystemManualSection";

interface UseVoucherNetoffTabsProps {
  logic: any;
  invoiceDirection?: "IN" | "OUT";
}

export function useVoucherNetoffTabs({
  logic,
  invoiceDirection,
}: UseVoucherNetoffTabsProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  // Drawer Tabs cho Hóa đơn ERP (Tab 1: Sao kê, Tab 2: Sổ quỹ)
  const invoiceDrawerTabs: DrawerTopTabItem[] = useMemo(() => {
    return [
      {
        key: "bank_statement",
        label: t("tabBankStatement", "1. Sao kê"),
        icon: <Landmark className="w-3.5 h-3.5" />,
        badgeCount:
          logic.selectedIds.length > 0 ? logic.selectedIds.length : undefined,
        content: (
          <div className="space-y-3 pb-2">
            {/* BẢNG GIAO DỊCH ĐÃ CHỌN */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  <span>{t("selectedVouchers", "Giao dịch đã chọn")}</span>
                  {logic.selectedIds.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                    >
                      {logic.selectedIds.length} {t("selected", "giao dịch")}
                    </Badge>
                  )}
                  {logic.selectedIds.length > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-auto">
                      • {money(logic.totalCurrentNetOff)}
                    </span>
                  )}
                </div>
              }
              titleExtra={
                logic.selectedIds.length > 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={logic.handleUnselectAll}
                    className="h-5 text-[10px] px-1.5 py-0 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-normal cursor-pointer"
                  >
                    {t("unselectAll", "Bỏ chọn tất cả")}
                  </Button>
                ) : undefined
              }
              collapsible={true}
              defaultCollapsed={false}
              className="p-3 mb-0 shrink-0 border border-slate-200/80 dark:border-slate-800"
              bodyClassName="p-0"
            >
              <SelectedBankTransactionsTable
                items={logic.selectedVouchersList}
                netOffAmounts={logic.netOffAmounts}
                maxAmounts={logic.maxAmounts}
                invoiceDirection={invoiceDirection}
                onAmountChange={logic.handleAmountChange}
                onRemove={logic.handleUnselectItem}
                onViewDetail={(id) => logic.setDetailTxnId(id)}
              />
            </DrawerSection>

            {/* BẢNG TẤT CẢ GIAO DỊCH SAO KÊ */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <Landmark className="w-4 h-4 text-muted-foreground" />
                  <span>{t("vouchersList", "Danh sách giao dịch sao kê")}</span>
                  {logic.data?.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({logic.data.total} {t("records", "giao dịch")})
                    </span>
                  )}
                </div>
              }
              titleExtra={
                <div className="flex items-center gap-2">
                  {logic.tableState.activeFilterCount +
                    (logic.dateFrom || logic.dateTo ? 1 : 0) >
                    0 && (
                    <FilterButton
                      activeCount={
                        logic.tableState.activeFilterCount +
                        (logic.dateFrom || logic.dateTo ? 1 : 0)
                      }
                      onClick={() => {}}
                      onClear={() => {
                        logic.tableState.resetFilters();
                        logic.setDateFrom("");
                        logic.setDateTo("");
                        logic.setPage(1);
                      }}
                    />
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="p-3 mb-0 border border-slate-200/80 dark:border-slate-800"
              bodyClassName="p-0"
            >
              <AllBankTransactionsTable
                vouchers={logic.vouchers}
                isLoading={logic.isLoading}
                selectedIds={logic.selectedIds}
                page={logic.page}
                pageSize={logic.pageSize}
                total={logic.data?.total || 0}
                totalPages={logic.data?.totalPages || 0}
                dateFrom={logic.dateFrom}
                dateTo={logic.dateTo}
                tableState={logic.tableState}
                setPage={logic.setPage}
                setPageSize={logic.setPageSize}
                onToggleRow={logic.handleToggleRow}
                onViewDetail={(id) => logic.setDetailTxnId(id)}
              />
            </DrawerSection>
          </div>
        ),
      },
      {
        key: "cash_book",
        label: t("tabCashBook", "2. Sổ quỹ"),
        icon: <Receipt className="w-3.5 h-3.5" />,
        content: (
          <div className="h-[calc(100vh-280px)] min-h-[380px] flex flex-col justify-center">
            <ComingSoonTabContent
              title={t("comingSoonCashBookTitle", "Sổ quỹ tiền mặt")}
              description={t(
                "comingSoonCashBookDesc",
                "Tính năng đối soát sổ quỹ tiền mặt đang được phát triển.",
              )}
              badge={t("comingSoonBadge", "Sắp ra mắt")}
            />
          </div>
        ),
      },
    ];
  }, [t, logic, invoiceDirection]);

  // Drawer Tabs cho Garage / Generic Tabs Mode
  const garageDrawerTabs: DrawerTopTabItem[] = useMemo(() => {
    return [
      {
        key: "ON_SYSTEM",
        label: t("erpTab", "1. Cấn trừ Sao kê / Sổ quỹ ERP"),
        icon: <Landmark className="w-3.5 h-3.5" />,
        badgeCount:
          logic.selectedIds.length > 0 ? logic.selectedIds.length : undefined,
        content: (
          <div className="space-y-3 pb-2">
            {/* BẢNG GIAO DỊCH ĐÃ CHỌN */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  <span>{t("selectedVouchers", "Giao dịch đã chọn")}</span>
                  {logic.selectedIds.length > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-1">
                      • {money(logic.totalCurrentNetOff)}
                    </span>
                  )}
                </div>
              }
              titleExtra={
                logic.selectedIds.length > 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={logic.handleUnselectAll}
                    className="h-5 text-[10px] px-1.5 py-0 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-normal cursor-pointer"
                  >
                    {t("unselectAll", "Bỏ chọn tất cả")}
                  </Button>
                ) : undefined
              }
              collapsible={true}
              defaultCollapsed={false}
              className="p-3 mb-0 shrink-0 border border-slate-200/80 dark:border-slate-800"
              bodyClassName="p-0"
            >
              <SelectedBankTransactionsTable
                items={logic.selectedVouchersList}
                netOffAmounts={logic.netOffAmounts}
                maxAmounts={logic.maxAmounts}
                invoiceDirection={invoiceDirection}
                onAmountChange={logic.handleAmountChange}
                onRemove={logic.handleUnselectItem}
                onViewDetail={(id) => logic.setDetailTxnId(id)}
              />
            </DrawerSection>

            {/* BẢNG TẤT CẢ GIAO DỊCH SAO KÊ */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <Landmark className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {t(
                      "allVouchersList",
                      "Danh sách giao dịch sao kê & sổ quỹ",
                    )}
                  </span>
                  {logic.data?.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({logic.data.total} {t("records", "giao dịch")})
                    </span>
                  )}
                </div>
              }
              titleExtra={
                <div className="flex items-center gap-2">
                  {logic.tableState.activeFilterCount +
                    (logic.dateFrom || logic.dateTo ? 1 : 0) >
                    0 && (
                    <FilterButton
                      activeCount={
                        logic.tableState.activeFilterCount +
                        (logic.dateFrom || logic.dateTo ? 1 : 0)
                      }
                      onClick={() => {}}
                      onClear={() => {
                        logic.tableState.resetFilters();
                        logic.setDateFrom("");
                        logic.setDateTo("");
                        logic.setPage(1);
                      }}
                    />
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="p-3 mb-0 border border-slate-200/80 dark:border-slate-800"
              bodyClassName="p-0"
            >
              <AllBankTransactionsTable
                vouchers={logic.vouchers}
                isLoading={logic.isLoading}
                selectedIds={logic.selectedIds}
                page={logic.page}
                pageSize={logic.pageSize}
                total={logic.data?.total || 0}
                totalPages={logic.data?.totalPages || 0}
                dateFrom={logic.dateFrom}
                dateTo={logic.dateTo}
                tableState={logic.tableState}
                setPage={logic.setPage}
                setPageSize={logic.setPageSize}
                onToggleRow={logic.handleToggleRow}
                onViewDetail={(id) => logic.setDetailTxnId(id)}
              />
            </DrawerSection>
          </div>
        ),
      },
      {
        key: "OFF_SYSTEM_MANUAL",
        label: t("manualTab", "2. Ghi nhận Dòng tiền Ngoài sổ sách"),
        icon: <DollarSign className="w-3.5 h-3.5" />,
        badgeCount: logic.manualAmount > 0 ? 1 : undefined,
        content: (
          <div className="space-y-3 pb-2">
            <OffSystemManualSection
              settlementType={logic.settlementType}
              currentRemaining={logic.currentRemaining}
              manualAmount={logic.manualAmount}
              setManualAmount={logic.setManualAmount}
              manualDate={logic.manualDate}
              setManualDate={logic.setManualDate}
              manualCategory={logic.manualCategory}
              setManualCategory={logic.setManualCategory}
              manualPartner={logic.manualPartner}
              setManualPartner={logic.setManualPartner}
              manualNote={logic.manualNote}
              setManualNote={logic.setManualNote}
            />
          </div>
        ),
      },
    ];
  }, [t, logic, invoiceDirection]);

  return {
    invoiceDrawerTabs,
    garageDrawerTabs,
  };
}
