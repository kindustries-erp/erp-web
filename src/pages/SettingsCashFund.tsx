import React, { useState, useMemo, useCallback } from "react";
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Badge } from "@/shared/components/ui/badge";
import {
  bankStatementApi,
  type ErpCashBook,
} from "@/modules/bank-statements/api/bankStatementApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { CashFundDrawer } from "@/modules/settings/components/CashFundDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { money } from "@/shared/utils/format";
import toast from "react-hot-toast";

export function ThietLapQuy() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ErpCashBook | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ErpCashBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const tableState = useTableColumnState("settings-cash-funds-table");

  React.useEffect(() => {
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

  const normalizedCashBooks = useMemo(() => {
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bankStatementApi.deleteCashBook(deleteTarget.id);
      refetch();
      toast.success("Xóa sổ quỹ thành công");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: normalizedCashBooks,
      }),
    [tableState, normalizedCashBooks],
  );

  const columns: DataTableColumn<ErpCashBook & { branchName?: string }>[] =
    useMemo(() => {
      return [
        // 1. STT (40px, 1-based, căn giữa)
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          minSize: 40,
          maxSize: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className:
            "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
          cell: (_, idx) => (
            <span className="w-full block text-center">{idx}</span>
          ),
        },

        // 2. Tên sổ quỹ
        {
          key: "name",
          header: headerFilter(
            "name",
            t("thietlap.columns.cashFundName", "Tên sổ quỹ"),
            {
              showBlankOption: true,
            },
          ),
          size: 280,
          minSize: 180,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.name || "—"}
              tooltip={true}
              enableCopy={true}
              textClassName="truncate text-xs font-semibold text-primary select-text"
            />
          ),
        },

        // 3. Chi nhánh
        {
          key: "branchName",
          header: headerFilter(
            "branchName",
            t("thietlap.columns.branch", "Chi nhánh"),
            {
              showBlankOption: true,
            },
          ),
          size: 200,
          minSize: 150,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.branchName || "—"}
              tooltip={true}
              textClassName="truncate text-xs text-foreground select-text"
            />
          ),
        },

        // 4. Tiền tệ
        {
          key: "currency",
          header: headerFilter(
            "currency",
            t("thietlap.columns.currency", "Tiền tệ"),
            {
              showBlankOption: true,
            },
          ),
          size: 110,
          minSize: 90,
          enableResizing: true,
          className: "text-center",
          cell: (a) => (
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {a.currency || "VND"}
            </span>
          ),
        },

        // 5. Số dư ban đầu
        {
          key: "openingBalance",
          header: headerFilter.amount(
            "openingBalance",
            t("thietlap.columns.openingBalance", "Số dư ban đầu"),
          ),
          size: 160,
          minSize: 130,
          enableResizing: true,
          className: "text-right",
          cell: (a) => (
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {money(a.openingBalance || 0)}
            </span>
          ),
        },

        // 6. Trạng thái
        {
          key: "isActive",
          header: headerFilter.client(
            "isActive",
            t("thietlap.columns.status", "Trạng thái"),
            {
              filterOptions: [
                { label: "Hoạt động", value: "true" },
                { label: "Ngưng hoạt động", value: "false" },
              ],
            },
          ),
          size: 130,
          minSize: 110,
          enableResizing: true,
          className: "text-center",
          cell: (a) => (
            <Badge
              variant="ghost"
              className={`border min-h-[18px] h-[18px] py-0 px-2 text-[10px] leading-none ${
                a.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {a.isActive ? "Hoạt động" : "Ngưng"}
            </Badge>
          ),
        },
      ];
    }, [headerFilter, t]);

  const rowActions = useCallback(
    (a: ErpCashBook) => [
      {
        groupLabel: t("common.actions", "Thao tác"),
        items: [
          {
            label: t("common.edit", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => {
              setEditingItem(a);
              setDrawerOpen(true);
            },
          },
          {
            label: t("common.delete", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: "danger" as const,
            onClick: () => setDeleteTarget(a),
          },
        ],
      },
    ],
    [t],
  );

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("thietlap.tabs.quy", "Sổ quỹ tiền mặt")}
        desc={t("thietlap.desc", "Quản lý danh sách sổ quỹ tiền mặt")}
        icon={<Wallet className="h-4 w-4" />}
        tableId="settings-cash-funds-table"
        items={paginatedItems}
        columns={columns}
        getRowKey={(a) => a.id}
        loading={isCashBooksLoading}
        emptyLabel={t("common.noData", "Chưa có dữ liệu.")}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={(p) => setPage(p)}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        activeFilterCount={tableState.activeFilterCount}
        onClearAllFilters={tableState.resetFilters}
        createActions={[
          {
            label: t("panel.createNew", "Tạo mới"),
            icon: <Plus className="w-4 h-4 text-emerald-600" />,
            onClick: handleCreate,
          },
        ]}
        onRefresh={() => refetch()}
        rowActions={rowActions}
      />

      <CashFundDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cashBook={editingItem}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete", "Xóa sổ quỹ")}
        message={`Bạn có chắc chắn muốn xóa sổ quỹ ${deleteTarget?.name}?`}
        loading={deleting}
      />
    </>
  );
}
