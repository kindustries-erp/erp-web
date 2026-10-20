import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { filterClientItems } from "@/shared/components/DataTable";
import {
  bankStatementApi,
  type ErpCashBook,
} from "@/modules/bank-statements/api/bankStatementApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import toast from "react-hot-toast";

export interface NormalizedCashBook extends ErpCashBook {
  branchName?: string;
}

export function useCashFundLogic() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ErpCashBook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ErpCashBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const tableState = useTableColumnState("settings-cash-funds-table");

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.cashflow"],
      ["thietlap.tabs.quy"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const {
    data: cashBooks = [],
    isLoading: isCashBooksLoading,
    refetch,
  } = useQuery({
    queryKey: ["cash-books"],
    queryFn: () => bankStatementApi.getCashBooks(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [branches]);

  const normalizedCashBooks = useMemo<NormalizedCashBook[]>(() => {
    return cashBooks.map((a: any) => ({
      ...a,
      branchName:
        a.branch?.name || (a.branchId ? branchMap.get(a.branchId) : "") || "",
    }));
  }, [cashBooks, branchMap]);

  const filteredItems = useMemo(() => {
    return filterClientItems(normalizedCashBooks, tableState);
  }, [normalizedCashBooks, tableState]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Tính subtotal của trang hiện tại và toàn bộ danh sách đã filter
  const pageSubtotalOpeningBalance = useMemo(() => {
    return paginatedItems.reduce(
      (acc, curr) => acc + (Number(curr.openingBalance) || 0),
      0,
    );
  }, [paginatedItems]);

  const totalOpeningBalance = useMemo(() => {
    return filteredItems.reduce(
      (acc, curr) => acc + (Number(curr.openingBalance) || 0),
      0,
    );
  }, [filteredItems]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bankStatementApi.deleteCashBook(deleteTarget.id);
      refetch();
      toast.success(
        t("settings.deleteCashFundSuccess", "Xóa sổ quỹ thành công"),
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((item: ErpCashBook) => {
    setEditingItem(item);
    setDrawerOpen(true);
  }, []);

  return {
    t,
    tableState,
    normalizedCashBooks,
    paginatedItems,
    isCashBooksLoading,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    refetch,
    drawerOpen,
    setDrawerOpen,
    editingItem,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDelete,
    handleCreate,
    handleEdit,
    pageSubtotalOpeningBalance,
    totalOpeningBalance,
  };
}
