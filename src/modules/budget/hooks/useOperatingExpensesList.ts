import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { budgetApi } from "../api/budgetApi";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useTranslation } from "react-i18next";

export type CostGroupFilter = "ALL" | "OPEX" | "COGS" | "COMMISSION";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useOperatingExpensesList() {
  const { t } = useTranslation("budget");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [costGroup, setCostGroupState] = useState<CostGroupFilter>("ALL");
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateField, setDateField] = useState<string>("documentDate");
  const [columnFilters, setColumnFiltersState] = useState<
    Record<string, string[]>
  >({});
  const [columnSearch, setColumnSearchState] = useState<Record<string, string>>(
    {},
  );

  // Cấu hình FilterPanel cho thanh trượt bên hông (Side Panel)
  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      status: {
        placeholder: t("colStatus", "Tất cả trạng thái"),
        options: [
          { value: "DRAFT", label: t("statusDraft", "Nháp") },
          { value: "CONFIRMED", label: t("statusConfirmed", "Đã xác nhận") },
          { value: "CANCELLED", label: t("statusCancelled", "Đã hủy") },
        ],
      },
      custom: [
        {
          key: "paymentStatus",
          label: t("colPaymentStatus", "Thanh toán"),
          placeholder: t("allPayment", "Tất cả thanh toán"),
          options: [
            { value: "UNPAID", label: t("paymentUnpaid", "Chưa thanh toán") },
            {
              value: "PARTIAL",
              label: t("paymentPartial", "Thanh toán 1 phần"),
            },
            { value: "PAID", label: t("paymentPaid", "Đã thanh toán") },
          ],
        },
        {
          key: "recurrenceType",
          label: t("colCycle", "Chu kỳ"),
          placeholder: t("allCycle", "Tất cả chu kỳ"),
          options: [
            { value: "ONE_TIME", label: t("cycleOneTime", "Một lần") },
            { value: "MONTHLY", label: t("cycleMonthly", "Hàng tháng") },
            { value: "QUARTERLY", label: t("cycleQuarterly", "Hàng quý") },
            { value: "YEARLY", label: t("cycleYearly", "Hàng năm") },
          ],
        },
      ],
    }),
    [t],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  // Hợp nhất query parameters giữa header filters và side panel filters
  const dateFrom = filter.state.dateFrom;
  const dateTo = filter.state.dateTo;
  const panelStatus = filter.state.status;
  const panelPaymentStatus = filter.state.custom?.paymentStatus;
  const panelRecurrenceType = filter.state.custom?.recurrenceType;

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "operating-expenses-list",
      page,
      pageSize,
      costGroup,
      sorts,
      dateFrom,
      dateTo,
      dateField,
      panelStatus,
      panelPaymentStatus,
      panelRecurrenceType,
      columnFilters,
      columnSearch,
    ],
    queryFn: () =>
      budgetApi.getList({
        page,
        pageSize,
        cost_group: costGroup !== "ALL" ? costGroup : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        status: panelStatus || undefined,
        paymentStatus: panelPaymentStatus || undefined,
        recurrenceType: panelRecurrenceType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        date_field: dateFrom || dateTo ? dateField : undefined,
        column_filters: Object.keys(columnFilters).length
          ? JSON.stringify(columnFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      }),
  });

  const setCostGroup = (val: CostGroupFilter) => {
    setCostGroupState(val);
    setPage(1);
  };

  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  };

  const setColumnFilter = (key: string, vals: string[]) => {
    setColumnFiltersState((prev) => {
      const next = { ...prev };
      if (!vals || vals.length === 0) {
        delete next[key];
      } else {
        next[key] = vals;
      }
      return next;
    });
    setPage(1);
  };

  const setColumnSearch = (key: string, val: string) => {
    setColumnSearchState((prev) => {
      const next = { ...prev };
      if (!val || val.trim().length === 0) {
        delete next[key];
      } else {
        next[key] = val;
      }
      return next;
    });
    setPage(1);
  };

  const setDateRange = (from?: string, to?: string) => {
    if (from || to) {
      filter.setDateFrom(from || "");
      filter.setDateTo(to || "");
    }
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    count += filter.activeFilterCount;
    return count;
  }, [columnFilters, columnSearch, filter.activeFilterCount]);

  const clearAllFilters = () => {
    setColumnFiltersState({});
    setColumnSearchState({});
    filter.resetAll();
    setCostGroupState("ALL");
    setPage(1);
  };

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    totalAmountSum: data?.meta?.totalAmountSum ?? 0,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    costGroup,
    setCostGroup,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    dateField,
    setDateField,
    setDateRange,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch,
    activeFilterCount,
    clearAllFilters,
    refetch,
    filterConfig,
    filter,
  };
}
