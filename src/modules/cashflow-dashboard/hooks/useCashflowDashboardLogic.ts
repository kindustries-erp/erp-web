import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useT } from "@/core/i18n";

export function useCashflowDashboardLogic() {
  const t = useT();
  const queryClient = useQueryClient();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const [partnerDrawerOpen, setPartnerDrawerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<{
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

  const filterConfig = useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: t("bankStatement.filters.branch", "Chi nhánh"),
        placeholder: t("bankStatement.filters.allBranches", "Tất cả chi nhánh"),
        options: branches.map((b: any) => ({ value: b.id, label: b.name })),
      },
      {
        key: "sourceType",
        label: t("cashflow.sourceType", "Nguồn tiền"),
        placeholder: t("common.all", "Tất cả"),
        options: [
          {
            value: "BANK",
            label: t("bankStatement.filters.bank", "Ngân hàng"),
          },
          {
            value: "CASH",
            label: t("bankStatement.filters.cashBook", "Sổ quỹ"),
          },
        ],
      },
      {
        key: "tagIds",
        label: t("bankStatement.filters.tag", "Danh mục (Tags)"),
        placeholder: t("bankStatement.filters.selectTag", "Chọn danh mục"),
        options: tags.map((tg: any) => ({ value: tg.id, label: tg.name })),
        multiple: true,
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches, tags, t]);

  const filter = useFilterPanel(filterConfig, () => {});

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

  const cashTrendLabels = data?.cashTrend?.map((item: any) => item.label) || [];
  const cashTrendIn = data?.cashTrend?.map((item: any) => item.cashIn) || [];
  const cashTrendOut = data?.cashTrend?.map((item: any) => item.cashOut) || [];

  const sourceLabels =
    data?.sourceBreakdown?.map((item: any) => item.label) || [];

  const hasCashflowPerm = useHasAnyPermission(
    [ErpResource.BANK_STATEMENTS, ErpResource.CASH_STATEMENTS],
    ErpAction.READ,
  );

  const canAccess = isAdminEmail || hasCashflowPerm;

  const handleRefresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["branches"] });
    queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
    queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    queryClient.invalidateQueries({ queryKey: ["cashBooks"] });
  }, [refetch, queryClient]);

  const handlePartnerClick = useCallback((account?: string, name?: string) => {
    setSelectedPartner({ account, name });
    setPartnerDrawerOpen(true);
  }, []);

  return {
    t,
    canAccess,
    filterConfig,
    filter,
    branches,
    bankAccounts,
    cashBooks,
    data,
    isLoading,
    isFetching,
    handleRefresh,
    cashTrendLabels,
    cashTrendIn,
    cashTrendOut,
    sourceLabels,
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    selectedPartner,
    handlePartnerClick,
  };
}
