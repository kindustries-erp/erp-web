import React from "react";
import { Wallet, Plus } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";
import type { GarageCashflowTableProps } from "./GarageCashflowTable.type";

const STATUS_TABS = [
  { key: "all", labelKey: "cases.cashflow.tabs.all", defaultLabel: "Tất cả" },
  {
    key: "receipt",
    labelKey: "cases.cashflow.tabs.receipt",
    defaultLabel: "Thu tiền",
  },
  {
    key: "payment",
    labelKey: "cases.cashflow.tabs.payment",
    defaultLabel: "Chi tiền",
  },
  {
    key: "with_bank",
    labelKey: "cases.cashflow.tabs.withBank",
    defaultLabel: "Có sao kê",
  },
  {
    key: "no_bank",
    labelKey: "cases.cashflow.tabs.noBank",
    defaultLabel: "Chưa sao kê",
  },
];

export function GarageCashflowTable(props: GarageCashflowTableProps) {
  const {
    t,
    items,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    columns,
    summaryRow,
    rowActions,
    activeStatusTab,
    setActiveStatusTab,
    activeFilterCount,
    handleClearAllFilters,
    isLoading,
    refetch,
  } = useGarageCashflowTable(props);

  const viewTabsNode = (
    <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-muted/60 border border-border/50 text-xs">
      {STATUS_TABS.map((tab) => {
        const isActive = activeStatusTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveStatusTab(tab.key);
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {t(tab.labelKey, tab.defaultLabel)}
          </button>
        );
      })}
    </div>
  );

  return (
    <SpreadsheetPageTemplate
      title={t("cases.cashflow.title", "Sổ thu chi xưởng")}
      desc={t(
        "cases.cashflow.desc",
        "Quản lý dòng tiền phát sinh thực tế tại xưởng Garage & đối soát dịch vụ",
      )}
      icon={<Wallet className="w-5 h-5 text-slate-700" />}
      tableId="garage-cashflow-table"
      items={items}
      columns={columns}
      getRowKey={(item: any) => item.id}
      loading={isLoading}
      onRefresh={refetch}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
      summaryRow={summaryRow}
      createLabel={t("cases.cashflow.createButton", "+ Thêm thu / chi")}
      createIcon={<Plus className="w-4 h-4 mr-1.5" />}
      onCreate={props.onOpenCreate}
      rowActions={rowActions}
      customActionsNode={viewTabsNode}
      containerClassName="max-h-[calc(100vh-200px)]"
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={Math.ceil(total / pageSize) || 1}
      onPage={(p) => setPage(p)}
      onPageSize={(s) => {
        setPageSize(s);
        setPage(1);
      }}
    />
  );
}
