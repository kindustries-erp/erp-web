import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { garageCashflowApi } from "../../../api/garageCashflowApi";
import type {
  GarageCashflowVoucher,
  UpdateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useGarageCashflowTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const queryKey = [
    "garage-cashflow-list",
    page,
    pageSize,
    sorts,
    columnFilters,
    columnSearch,
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      garageCashflowApi.getList({
        page,
        pageSize,
        sorts: sorts && sorts.length > 0 ? sorts.join(",") : undefined,
        column_filters: Object.keys(columnFilters).length
          ? JSON.stringify(columnFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      }),
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

  const getColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    pageSize: reqPageSize = 20,
  }: {
    columnKey: string;
    search?: string;
    pageParam?: number;
    pageSize?: number;
  }) => {
    const filtersWithoutCurrent = { ...columnFilters };
    delete filtersWithoutCurrent[columnKey];
    const res = await garageCashflowApi.getOptions(
      columnKey,
      search || "",
      pageParam || 1,
      reqPageSize,
      Object.keys(filtersWithoutCurrent).length
        ? JSON.stringify(filtersWithoutCurrent)
        : undefined,
    );
    return {
      items: res.items.map((i: string) => ({ label: i, value: i })),
      total: res.total,
      next: (pageParam || 1) < res.totalPages ? (pageParam || 1) + 1 : null,
    };
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
    activeFilterCount,
    clearAllFilters,
    refetch,
    getColumnOptions,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
