import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useAppStore } from "@/core/config/appStore";

export function ChartOfAccountsPage() {
  const t = useT();
  const { currentBranchId, setCustomBreadcrumbs } = useAppStore();

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

  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const filterConfig = useMemo(() => {
    return {
      search: true,
      custom: [
        {
          key: "branchId",
          label: t("common.branch"),
          placeholder: t("common.allBranches"),
          options: branches.map((b) => ({ value: b.id, label: b.name })),
          defaultValue: currentBranchId,
        },
      ],
    };
  }, [branches, t, currentBranchId]);

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const {
    data: chartOfAccounts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: () => accountingApi.getChartOfAccounts({}),
  });

  // Filter local results if backend doesn't support search yet, or rely on backend
  const filteredData = useMemo(() => {
    if (!chartOfAccounts) return [];
    if (!filter.state.search) return chartOfAccounts;
    const s = filter.state.search.toLowerCase();
    return chartOfAccounts.filter(
      (a: any) =>
        a.accountCode?.toLowerCase().includes(s) ||
        a.accountName?.toLowerCase().includes(s),
    );
  }, [chartOfAccounts, filter.state.search]);

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
      total={filteredData?.length || 0}
      totalPages={Math.ceil((filteredData?.length || 0) / pageSize) || 1}
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
