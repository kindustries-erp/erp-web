import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  garageCashflowApi,
  type GarageCashflowVoucher,
  type UpdateGarageCashflowVoucherDto,
} from "../api/garageCashflowApi";
import { toast } from "react-hot-toast";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useGarageCashflowList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const setDateRange = (from?: string, to?: string) => {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  };

  const queryClient = useQueryClient();
  const queryKey = [
    "garage-cashflow-list",
    page,
    pageSize,
    sorts,
    columnFilters,
    columnSearch,
    dateFrom,
    dateTo,
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const combinedFilters = { ...columnFilters };
      if (dateFrom || dateTo) {
        combinedFilters["created_at"] = [`${dateFrom || ""}..${dateTo || ""}`];
      }
      return garageCashflowApi.getList({
        page,
        pageSize,
        sorts,
        column_filters: Object.keys(combinedFilters).length
          ? JSON.stringify(combinedFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: garageCashflowApi.create,
    onSuccess: () => {
      toast.success("Tạo phiếu thu/chi thành công");
      queryClient.invalidateQueries({ queryKey: ["garage-cashflow-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGarageCashflowVoucherDto;
    }) => garageCashflowApi.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật phiếu thu/chi thành công");
      queryClient.invalidateQueries({ queryKey: ["garage-cashflow-list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: garageCashflowApi.delete,
    onSuccess: () => {
      toast.success("Xóa phiếu thu/chi thành công");
      queryClient.invalidateQueries({ queryKey: ["garage-cashflow-list"] });
    },
  });

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
    setColumnFilters((prev) => ({ ...prev, [key]: vals }));
    setPage(1);
  };

  const setColumnSearchVal = (key: string, val: string) => {
    setColumnSearch((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    return count;
  }, [columnFilters, columnSearch]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setColumnSearch({});
    setPage(1);
  };

  return {
    data: (data?.data ?? []) as GarageCashflowVoucher[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchVal,
    dateFrom,
    dateTo,
    setDateRange,
    activeFilterCount,
    clearAllFilters,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
