import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton, Skeleton } from "@/shared/components/Skeleton";
// import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { money } from "@/shared/utils/format";
import { StandardTable } from "@/shared/components/StandardTable";
// import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";

import { CategoryTransactionsDrawer } from "./components/CategoryTransactionsDrawer";
import { PartnerTransactionsDrawer } from "./components/PartnerTransactionsDrawer";

export function CashflowDashboard() {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  const [partnerDrawerOpen, setPartnerDrawerOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] = React.useState<{
    account?: string;
    name?: string;
  } | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: branches.map((b: any) => ({ value: b.id, label: b.name })),
      },
      {
        key: "sourceType",
        label: "Nguồn tiền",
        placeholder: "Tất cả",
        options: [
          { value: "BANK", label: "Ngân hàng" },
          { value: "CASH", label: "Sổ quỹ" },
        ],
      },
      {
        key: "tagIds",
        label: "Danh mục (Tags)",
        placeholder: "Chọn danh mục",
        options: tags.map((t) => ({ value: t.id, label: t.name })),
        multiple: true,
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches, tags]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const filter = useFilterPanel(filterConfig, () => {
    setPage(1);
  });

  const queryClient = useQueryClient();

  const tableState = useTableColumnState("cashflow-dashboard-partners");

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
    setPage(1);
  };

  const fetchColumnOptions = React.useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      return bankStatementApi.getColumnOptions(
        columnKey,
        search,
        pageParam,
        50,
        filtersStr,
        (filter.state.custom.sourceType as any) || undefined,
      );
    },
    [filter.state.custom.sourceType],
  );

  const { data: bankAccounts = [] } = useQuery({
    queryKey: [
      "bankAccounts",
      filter.state.custom.branchId,
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () =>
      bankStatementApi.getBankAccounts(
        filter.state.custom.branchId as string,
        filter.state.dateFrom,
        filter.state.dateTo,
      ),
  });

  const { data: cashBooks = [] } = useQuery({
    queryKey: [
      "cashBooks",
      filter.state.custom.branchId,
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () =>
      bankStatementApi.getCashBooks(
        filter.state.custom.branchId as string,
        filter.state.dateFrom,
        filter.state.dateTo,
      ),
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
      filter.state.custom.sourceType,
      filter.state.custom.tagIds,
    ],
    queryFn: () =>
      bankStatementApi.getDashboardStats({
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
        sourceType: (filter.state.custom.sourceType as any) || undefined,
        tagIds:
          (filter.state.custom.tagIds as unknown as string[]) || undefined,
      }),
  });

  const {
    data: partnerStats,
    // isLoading: isPartnerLoading,
    isFetching: isPartnerFetching,
    refetch: refetchPartner,
  } = useQuery({
    queryKey: [
      "partner-stats",
      page,
      pageSize,
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
      filter.state.custom.sourceType,
      filter.state.custom.tagIds,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      bankStatementApi.getPartnerStats({
        page,
        pageSize,
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
        sourceType: (filter.state.custom.sourceType as any) || undefined,
        tagIds:
          (filter.state.custom.tagIds as unknown as string[]) || undefined,
        column_filters: tableState.columnFilters
          ? JSON.stringify(tableState.columnFilters)
          : undefined,
        column_search: tableState.columnSearch
          ? JSON.stringify(tableState.columnSearch)
          : undefined,
        sortBy: tableState.sorts?.[0]
          ? tableState.sorts[0].replace(/^-/, "")
          : undefined,
        sortOrder: tableState.sorts?.[0]
          ? tableState.sorts[0].startsWith("-")
            ? "DESC"
            : "ASC"
          : undefined,
      }),
  });

  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  const cashTrendLabels = data?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = data?.cashTrend?.map((t: any) => t.cashIn) || [];
  const cashTrendOut = data?.cashTrend?.map((t: any) => t.cashOut) || [];

  const sourceLabels = data?.sourceBreakdown?.map((t: any) => t.label) || [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sourceIn = data?.sourceBreakdown?.map((t: any) => t.cashIn) || [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sourceOut = data?.sourceBreakdown?.map((t: any) => t.cashOut) || [];

  const defaultColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const handleCategoryClick = (item: any) => {
    if (item.id) {
      setSelectedTag({ id: item.id, label: item.label });
      setDrawerOpen(true);
    }
  };

  const donutItems = (data?.categoryBreakdown || []).map(
    (c: any, i: number) => ({
      id: c.tagId,
      label: c.label || t("common.other"),
      value: c.amount,
      color: c.color || defaultColors[i % defaultColors.length],
    }),
  );

  const renderHeaderFilter = (key: string, title: string) => (
    <TableColumnHeaderFilter
      title={title}
      align="center"
      sortState={getSortState(key)}
      onSortChange={(state) => handleSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => handleSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => handleFilterChange(key, vals)}
      columnKey={key}
      allFilters={tableState.columnFilters}
      fetchOptions={fetchColumnOptions}
      queryKeyPrefix="cashflow-dashboard-partner-options"
    />
  );

  const partnerCols = [
    {
      key: "correspondentAccount",
      header: renderHeaderFilter("correspondentAccount", "Tài khoản đối ứng"),
      cell: (row: any) => {
        if (!row.correspondentAccount) return "Khác";
        return (
          <Button
            variant="link"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedPartner({
                account: row.correspondentAccount,
                name: row.correspondentName,
              });
              setPartnerDrawerOpen(true);
            }}
            className="font-medium text-primary hover:underline p-0 h-auto"
          >
            {row.correspondentAccount}
          </Button>
        );
      },
      size: 200,
    },
    {
      key: "correspondentName",
      header: renderHeaderFilter("correspondentName", "Tên đối ứng"),
      cell: (row: any) => row.correspondentName || "Khác",
      size: 300,
    },
    {
      key: "totalCredit",
      header: renderHeaderFilter("totalCredit", "Tổng thu"),
      cell: (row: any) => {
        if (row.totalCredit > 0)
          return (
            <span className="text-emerald-600 font-medium">
              +{money(row.totalCredit)}
            </span>
          );
        return null;
      },
      size: 150,
      className: "text-right",
      headerClassName: "text-center",
    },
    {
      key: "totalDebit",
      header: renderHeaderFilter("totalDebit", "Tổng chi"),
      cell: (row: any) => {
        if (row.totalDebit > 0)
          return (
            <span className="text-[#ea580c] font-medium">
              {money(row.totalDebit)}
            </span>
          );
        return null;
      },
      size: 150,
      className: "text-right",
      headerClassName: "text-center",
    },
  ];

  const topTransactionsInTotal = React.useMemo(() => {
    return (partnerStats?.items || []).reduce(
      (acc: number, row: any) => acc + (parseFloat(row.totalCredit) || 0),
      0,
    );
  }, [partnerStats?.items]);

  const topTransactionsOutTotal = React.useMemo(() => {
    return (partnerStats?.items || []).reduce(
      (acc: number, row: any) => acc + (parseFloat(row.totalDebit) || 0),
      0,
    );
  }, [partnerStats?.items]);

  const hasCashflowPerm = useHasAnyPermission(
    [
      "bank_statements",
      "cash_statements",
      "payment_vouchers",
      "erp_cashflow_vouchers",
      "bank_accounts",
      "cash_books",
    ],
    "read",
  );

  const canView = hasCashflowPerm || isAdminEmail;

  if (!canView) {
    return <ComingSoon />;
  }

  return (
    <DashboardTemplate
      title={t("dashboard.title")}
      desc={t("dashboard.desc")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={() => {
        refetch();
        refetchPartner();
        queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
        queryClient.invalidateQueries({ queryKey: ["cashBooks"] });
      }}
    >
      {/* Account Balances */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {bankAccounts.map((acc: any) => (
          <AccountBalanceCard
            key={acc.id}
            loading={isFetching}
            label={`${acc.bankName || acc.bankCode} - ${acc.accountNumber}`}
            openingBalance={acc.openingBalance}
            totalCredit={acc.totalCredit}
            totalDebit={acc.totalDebit}
            currentBalance={acc.currentBalance}
          />
        ))}
        {cashBooks.map((book: any) => (
          <AccountBalanceCard
            key={book.id}
            loading={isFetching}
            label={book.name}
            openingBalance={book.openingBalance}
            totalCredit={book.totalCredit}
            totalDebit={book.totalDebit}
            currentBalance={book.currentBalance}
          />
        ))}
      </div>

      {/* Panels row */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3">
        <Panel title={t("dashboard.cashTrend")} extra={<PanelMore />}>
          <div className="relative h-[210px]">
            {!isLoading && cashTrendLabels.length > 0 ? (
              <BarChart
                labels={cashTrendLabels}
                yCallback={(v) => money(Number(v))}
                datasets={[
                  {
                    data: cashTrendIn,
                    color: barIn,
                    label: t("dashboard.cashIn"),
                  },
                  {
                    data: cashTrendOut,
                    color: barOut,
                    label: t("dashboard.cashOut"),
                  },
                ]}
              />
            ) : isLoading ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-[10px]">
            <LegendItem color={barIn} label={t("dashboard.cashIn")} />
            <LegendItem color={barOut} label={t("dashboard.cashOut")} />
          </div>
        </Panel>

        <Panel title={t("dashboard.expenseByCategory")}>
          {!isLoading && donutItems.length > 0 ? (
            <>
              <div className="relative h-[160px] mb-2 shrink-0">
                <DonutChart
                  items={donutItems}
                  onClick={handleCategoryClick}
                  valueFormatter={(v) => money(v)}
                />
              </div>
              <div className="max-h-[160px] overflow-y-auto pr-1">
                <DonutLegend
                  items={donutItems}
                  onClick={handleCategoryClick}
                  valueFormatter={(v) => money(v)}
                />
              </div>
            </>
          ) : isLoading ? (
            <div className="h-[200px]">
              <ChartSkeleton type="donut" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-[color:var(--muted-fg)]">
              {t("common.noData")}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 min-[900px]:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {sourceLabels.length > 0 ? (
          sourceLabels.map((label: string, idx: number) => {
            const trendData = data?.sourceBreakdown?.[idx]?.trend || [];
            const labels = trendData.map((t: any) => t.label) || [""];
            const inData = trendData.map((t: any) => t.cashIn) || [0];
            const outData = trendData.map((t: any) => t.cashOut) || [0];
            return (
              <Panel key={label} title={label} extra={<PanelMore />}>
                <div className="relative h-[210px]">
                  <BarChart
                    labels={labels}
                    yCallback={(v) => money(Number(v))}
                    datasets={[
                      {
                        data: inData,
                        color: barIn,
                        label: t("dashboard.cashIn"),
                      },
                      {
                        data: outData,
                        color: barOut,
                        label: t("dashboard.cashOut"),
                      },
                    ]}
                  />
                </div>
                <div className="flex gap-4 mt-[10px]">
                  <LegendItem color={barIn} label={t("dashboard.cashIn")} />
                  <LegendItem color={barOut} label={t("dashboard.cashOut")} />
                </div>
              </Panel>
            );
          })
        ) : (
          <Panel title="Dòng tiền theo Nguồn" extra={<PanelMore />}>
            <div className="relative h-[210px]">
              {isLoading ? (
                <ChartSkeleton type="bar" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Tình hình giao dịch theo đối tác
          </h3>
          <StandardTable
            items={partnerStats?.items || []}
            columns={partnerCols}
            getRowKey={(row: any) => row.id}
            loading={isPartnerFetching}
            variant="spreadsheet"
            minWidth={800}
            enableColumnResizing={true}
            containerClassName=""
            page={page}
            pageSize={pageSize}
            total={partnerStats?.total || 0}
            totalPages={partnerStats?.totalPages || 0}
            onPage={setPage}
            onPageSize={setPageSize}
            summaryRow={{
              correspondentName: (
                <span className="font-semibold text-right block"></span>
              ),
              totalCredit: (
                <span className="text-emerald-600 font-semibold">
                  +{money(topTransactionsInTotal)}
                </span>
              ),
              totalDebit: (
                <span className="text-[#ea580c] font-semibold">
                  {money(topTransactionsOutTotal)}
                </span>
              ),
            }}
          />
        </div>
      </div>
      <CategoryTransactionsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tagId={selectedTag?.id}
        tagLabel={selectedTag?.label}
        filterState={filter.state}
      />
      <PartnerTransactionsDrawer
        open={partnerDrawerOpen}
        onClose={() => setPartnerDrawerOpen(false)}
        correspondentAccount={selectedPartner?.account}
        correspondentName={selectedPartner?.name}
        globalStartDate={filter.state.dateFrom || undefined}
        globalEndDate={filter.state.dateTo || undefined}
        globalBranchId={filter.state.custom.branchId as string | undefined}
      />
    </DashboardTemplate>
  );
}

// ── Helpers ──
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center text-xs">
      <div
        className="w-3 h-3 rounded-[3px] mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-[color:var(--muted-fg)]">{label}</span>
    </div>
  );
}

function AccountBalanceCard({
  label,
  openingBalance = 0,
  totalCredit = 0,
  totalDebit = 0,
  currentBalance = 0,
  loading,
}: {
  label: string;
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  loading?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-3 max-[480px]:p-2 flex flex-col justify-between">
      <div className="text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 text-[10px] truncate">
        {label}
      </div>

      {loading ? (
        <div className="space-y-2 mb-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-5 w-full rounded mt-2" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-[12px] mb-1">
            <span className="text-[color:var(--muted-fg)]">Đầu kỳ:</span>
            <span className="font-medium text-foreground">
              {money(openingBalance)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[12px] mb-1">
            <span className="text-[color:var(--muted-fg)]">Thu trong kỳ:</span>
            <span className="font-medium text-emerald-600">
              +{money(totalCredit)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[12px] mb-2">
            <span className="text-[color:var(--muted-fg)]">Chi trong kỳ:</span>
            <span className="font-medium text-[#ea580c]">
              -{money(totalDebit)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-2 mt-auto">
            <span className="text-[10px] font-semibold text-[color:var(--muted-fg)] uppercase">
              Cuối kỳ:
            </span>
            <span className="font-bold text-[16px] text-foreground">
              {money(currentBalance)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Icons ──
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IconTrendUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-green-600"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IconTrendDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-red-600"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
