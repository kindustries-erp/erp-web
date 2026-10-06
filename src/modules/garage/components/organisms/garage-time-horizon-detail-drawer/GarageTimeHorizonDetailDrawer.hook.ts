import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { garageDebtsAnalyticsApi } from "@/modules/garage/api/garageDebtsAnalyticsApi";
import type { TimeHorizonSubTab } from "@/modules/garage/components/molecules/time-horizon-header-banner";
import type { GarageTimeHorizonDetailDrawerProps } from "./GarageTimeHorizonDetailDrawer.type";

export function useGarageTimeHorizonDetailDrawer(
  props: GarageTimeHorizonDetailDrawerProps,
) {
  const { open, horizon, dateFrom, dateTo, branchId } = props;
  const { t } = useTranslation(["garage", "debts", "common"]);

  const [activeSubTab, setActiveSubTab] = useState<TimeHorizonSubTab>("cases");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("agingDays");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const query = useQuery({
    queryKey: [
      "garage-time-horizon-cases",
      horizon,
      dateFrom,
      dateTo,
      branchId,
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      horizon
        ? garageDebtsAnalyticsApi.getTimeHorizonCases(horizon, {
            date_from: dateFrom,
            date_to: dateTo,
            branch_id: branchId,
            page,
            pageSize,
            search: search || undefined,
            sortBy,
            sortOrder,
          })
        : null,
    enabled: Boolean(open && horizon),
    staleTime: 30000,
  });

  const data = query.data;

  return {
    t,
    activeSubTab,
    setActiveSubTab,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    summary: data?.summary,
    items: data?.items || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    topPartners: data?.summary?.topPartners || [],
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  };
}
