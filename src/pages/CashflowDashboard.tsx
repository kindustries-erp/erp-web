import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { StandardTable } from "@/shared/components/StandardTable";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";

import { CategoryTransactionsDrawer } from "./components/CategoryTransactionsDrawer";

export function CashflowDashboard() {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: () => bankStatementApi.getBankAccounts(),
  });

  const { data: cashBooks = [] } = useQuery({
    queryKey: ["cashBooks"],
    queryFn: () => bankStatementApi.getCashBooks(),
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

  const filter = useFilterPanel(filterConfig, () => {});

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

  const barIn = "#10b981"; // Emerald 500
  const barOut = "#ef4444"; // Red 500

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

  const topTransactionsCols = [
    {
      key: "source",
      header: t("bankStatement.columns.sourceName"),
      cell: (row: any) => {
        if (row.sourceType === "BANK")
          return row.bankAccount?.bankName
            ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
            : "Bank";
        return row.cashBook?.name || "Cash";
      },
      size: 150,
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: t("bankStatement.columns.transDate"),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 150,
    },
    {
      key: "description",
      dataIndex: "description",
      header: t("bankStatement.columns.description"),
      size: 400,
      cell: (row: any) => (
        <div className="whitespace-normal break-words w-full">
          {row.description}
        </div>
      ),
    },
    {
      key: "thu",
      header: t("bankStatement.columns.thu"),
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-green-600 font-medium">+{money(credit)}</span>
          );
        return null;
      },
      size: 150,
    },
    {
      key: "chi",
      header: t("bankStatement.columns.chi"),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-red-600 font-medium">{money(debit)}</span>
          );
        return null;
      },
      size: 150,
    },
    {
      key: "tags",
      header: "Danh mục",
      cell: (row: any) => (
        <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
          <div className="w-max">
            <EntityTagSelector
              entityType="bank_transaction"
              entityId={row.id}
            />
          </div>
        </div>
      ),
      size: 200,
    },
    {
      key: "referenceNumber",
      dataIndex: "referenceNumber",
      header: t("bankStatement.columns.referenceNumber"),
      size: 150,
      valueType: "text" as const,
    },
  ];

  const topTransactionsInTotal = React.useMemo(() => {
    return (data?.topTransactionsIn || []).reduce(
      (acc: number, row: any) => acc + (parseFloat(row.creditAmount) || 0),
      0,
    );
  }, [data?.topTransactionsIn]);

  const topTransactionsOutTotal = React.useMemo(() => {
    return (data?.topTransactionsOut || []).reduce(
      (acc: number, row: any) => acc + (parseFloat(row.debitAmount) || 0),
      0,
    );
  }, [data?.topTransactionsOut]);

  const top20Transactions = React.useMemo(() => {
    const combined = [
      ...(data?.topTransactionsIn || []),
      ...(data?.topTransactionsOut || []),
    ];
    return combined
      .sort((a, b) => {
        const dateA = new Date(a.transDate || 0).getTime();
        const dateB = new Date(b.transDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 20);
  }, [data?.topTransactionsIn, data?.topTransactionsOut]);

  if (!isAdminEmail) {
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
      onRefresh={() => refetch()}
    >
      {/* Account Balances */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {bankAccounts.map((acc: any) => (
          <KpiCard
            compact
            key={acc.id}
            label={`${acc.bankName || acc.bankCode} - ${acc.accountNumber}`}
            value={money(acc.currentBalance || 0)}
          />
        ))}
        {cashBooks.map((book: any) => (
          <KpiCard
            compact
            key={book.id}
            label={book.name}
            value={money(book.currentBalance || 0)}
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
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {isLoading ? t("common.loading") : t("common.noData")}
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
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-[color:var(--muted-fg)]">
              {isLoading ? t("common.loading") : t("common.noData")}
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
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {isLoading ? t("common.loading") : t("common.noData")}
              </div>
            </div>
          </Panel>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Top 20 Giao dịch Nổi Bật
          </h3>
          <StandardTable
            items={top20Transactions}
            columns={topTransactionsCols}
            getRowKey={(row: any) => row.id}
            loading={isLoading}
            variant="spreadsheet"
            minWidth={1500}
            enableColumnResizing={true}
            containerClassName="max-h-[500px] overflow-auto"
            summaryRow={{
              description: (
                <span className="font-semibold text-right block"></span>
              ),
              thu: (
                <span className="text-green-600 font-semibold">
                  +{money(topTransactionsInTotal)}
                </span>
              ),
              chi: (
                <span className="text-red-600 font-semibold">
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
    </DashboardTemplate>
  );
}

// ── Helpers ──
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[6px] text-xs text-[color:var(--muted-fg)]">
      <div
        className="w-[10px] h-[10px] rounded-sm border border-[color:var(--border)]"
        style={{ background: color }}
      />
      {label}
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
