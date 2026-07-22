import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import { accountingApi } from "@/modules/accounting/api/accountingApi";

import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useAppStore } from "@/core/config/appStore";

export function ChartOfAccountsPage() {
  const t = useT();
  const { setCustomBreadcrumbs } = useAppStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortArray, setSortArray] = useState<string[]>(["accountCode"]);

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.catalogAccounts"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const filterConfig = useMemo(() => ({ search: true }), []);
  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const {
    data: pagedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["chart-of-accounts", page, pageSize, filter.state.search],
    queryFn: () =>
      accountingApi.getChartOfAccounts({
        page,
        pageSize,
        search: filter.state.search,
      }),
  });

  const chartOfAccounts = pagedData?.items || [];
  const totalItems = pagedData?.total || 0;
  const totalPagesCount = pagedData?.totalPages || 1;

  const filteredData = chartOfAccounts;

  const columns = useMemo(
    () => [
      {
        key: "accountCode",
        dataIndex: "accountCode",
        header: t("accounts.code"),
        width: 150,
      },
      {
        key: "accountName",
        header: t("accounts.name"),
        width: 400,
        cell: (row: any) => (
          <span className={row.parentId ? "pl-4" : "font-semibold"}>
            {row.accountName}
          </span>
        ),
      },
      {
        key: "accountType",
        header: t("accounts.type"),
        width: 150,
        cell: (row: any) => {
          const types: Record<string, string> = {
            ASSET: t("accounts.asset"),
            LIABILITY: t("accounts.liability"),
            EQUITY: t("accounts.equity"),
            REVENUE: t("accounts.revenue"),
            EXPENSE: t("accounts.expense"),
          };
          return types[row.accountType] || row.accountType;
        },
      },
    ],
    [t],
  );

  return (
    <SpreadsheetPageTemplate
      title={t("accounts.title")}
      icon={<Layers className="w-5 h-5 text-gray-500 mr-2" />}
      tableId="chart-of-accounts-table"
      items={filteredData || []}
      columns={columns}
      getRowKey={(row: any) => row.id}
      loading={isLoading}
      page={page}
      pageSize={pageSize}
      total={totalItems}
      totalPages={totalPagesCount}
      onPage={setPage}
      onPageSize={setPageSize}
      onRefresh={refetch}
      filterConfig={filterConfig}
      filter={filter}
      sortArray={sortArray}
      onSort={(key: string) => setSortArray([key])}
    />
  );
}
