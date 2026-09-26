import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  accountingApi,
  type ChartOfAccountItem,
} from "@/modules/accounting/api/accountingApi";
import type { ComboboxOption } from "@/shared/components/Combobox";

export function useCoaComboboxLogic(filterActiveOnly: boolean = true) {
  const { data, isLoading } = useQuery({
    queryKey: ["chart-of-accounts-combobox", filterActiveOnly],
    queryFn: async () => {
      const res = await accountingApi.getChartOfAccounts({
        isActive: filterActiveOnly ? true : undefined,
      });
      const list: ChartOfAccountItem[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      return list;
    },
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo<ComboboxOption[]>(() => {
    if (!data) return [];
    return data
      .filter((acc) => !acc.is_deleted && !acc.isDeleted)
      .map((acc) => {
        const code = acc.accountCode || acc.account_code || "";
        const name = acc.accountName || acc.account_name || "";
        return {
          value: acc.id,
          label: `${code} - ${name}`,
          code: code,
          subLabel: name,
          searchText: `${code} ${name}`.toLowerCase(),
        };
      })
      .sort((a, b) => (a.code || "").localeCompare(b.code || ""));
  }, [data]);

  return {
    options,
    isLoading,
  };
}
