import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export function useBankStatementFilters({
  type,
  tableId,
  t,
}: {
  type: "bank" | "cash";
  tableId: string;
  t: (key: string, options?: any) => string;
}) {
  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const { data: accountsData = [] } = useQuery<any[]>({
    queryKey: [type === "bank" ? "bank-accounts" : "cash-books"],
    queryFn: async () => {
      const data =
        type === "bank"
          ? await bankStatementApi.getBankAccounts()
          : await bankStatementApi.getCashBooks();
      return data as any[];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const filterConfig = useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: t("bankStatement.filters.branch", { defaultValue: "Chi nhánh" }),
        placeholder: t("bankStatement.filters.allBranches", {
          defaultValue: "Tất cả chi nhánh",
        }),
        options: branches.map((b) => ({ value: b.id, label: b.name })),
      },
    ];

    if (accountsData && accountsData.length > 0) {
      custom.push({
        key: type === "bank" ? "bankAccountId" : "cashBookId",
        label:
          type === "bank"
            ? t("bankStatement.filters.bank", { defaultValue: "Ngân hàng" })
            : t("bankStatement.filters.cashBook", { defaultValue: "Sổ quỹ" }),
        placeholder:
          type === "bank"
            ? t("bankStatement.filters.allBanks", {
                defaultValue: "Tất cả ngân hàng",
              })
            : t("bankStatement.filters.allCashBooks", {
                defaultValue: "Tất cả sổ quỹ",
              }),
        options: accountsData.map((item) => ({
          value: item.id,
          label:
            type === "bank"
              ? `${item.bankName} - ${item.accountNumber}`
              : item.name,
        })),
      });
    }

    if (tags && tags.length > 0) {
      custom.push({
        key: "tagIds",
        label: t("bankStatement.filters.tag", { defaultValue: "Thẻ nhãn" }),
        placeholder: t("bankStatement.filters.allTags", {
          defaultValue: "Tất cả thẻ nhãn",
        }),
        options: tags.map((tg: any) => ({
          value: tg.id,
          label: tg.name,
        })),
      });
    }

    return custom;
  }, [branches, accountsData, tags, type, t]);

  const filter = useFilterPanel({
    period: true,
    custom: filterConfig,
  });

  const tableState = useTableColumnState(tableId);

  const appliedFilters = useMemo(() => {
    const custom = filter.state.custom || {};
    return {
      startDate: filter.state.dateFrom || undefined,
      endDate: filter.state.dateTo || undefined,
      branchId: custom.branchId || undefined,
      bankAccountId:
        type === "bank" ? custom.bankAccountId || undefined : undefined,
      cashBookId: type === "cash" ? custom.cashBookId || undefined : undefined,
      tagIds: custom.tagIds
        ? (custom.tagIds as unknown as string[])
        : undefined,
    };
  }, [filter.state, type]);

  return {
    branches,
    accountsData,
    tags,
    filterConfig,
    filter,
    tableState,
    appliedFilters,
  };
}
