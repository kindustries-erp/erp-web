import React, { useState, useMemo, useCallback } from "react";
import { Layers, PlusCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { cn } from "@/shared/utils";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { DataTableColumn } from "@/shared/components/DataTable";

import { useAccountsList } from "@/modules/accounting/hooks/useAccountsList";
import { AccountDrawer } from "@/modules/accounting/components/AccountDrawer";
import {
  accountingApi,
  type ChartOfAccountItem,
} from "@/modules/accounting/api/accountingApi";

export function ChartOfAccountsPage() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const listHook = useAccountsList();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "view",
  );
  const [selectedAccount, setSelectedAccount] =
    useState<ChartOfAccountItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ChartOfAccountItem | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setSelectedAccount(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }, []);

  const openView = useCallback((item: ChartOfAccountItem) => {
    setSelectedAccount(item);
    setDrawerMode("view");
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((item: ChartOfAccountItem) => {
    setSelectedAccount(item);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedAccount(null);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return accountingApi.deleteChartOfAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      queryClient.invalidateQueries({
        queryKey: ["chart-of-accounts-all-dropdown"],
      });
      showToast({
        title: t(
          "accounts.toast.deleteSuccess",
          "Đã xóa tài khoản kế toán thành công",
        ),
        variant: "success",
      });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      showToast({
        title:
          err?.response?.data?.message ||
          err?.message ||
          t("accounts.toast.deleteError", "Không thể xóa tài khoản"),
        variant: "destructive",
      });
      setDeleteTarget(null);
    },
  });

  const handleDelete = useCallback(() => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);

  const getSortState = useCallback(
    (key: string): "asc" | "desc" | "none" => {
      if (listHook.sorts.includes(key)) return "asc";
      if (listHook.sorts.includes(`-${key}`)) return "desc";
      return "none";
    },
    [listHook.sorts],
  );

  const fetchAccountsColumnOptions = useCallback(
    async (params: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const filtersStr =
        Object.keys(listHook.columnFilters).length > 0
          ? JSON.stringify(listHook.columnFilters)
          : undefined;

      const res = await accountingApi.getColumnOptions(
        params.columnKey,
        params.search,
        params.pageParam || 1,
        20,
        filtersStr,
      );

      return {
        items: res.items.map((i: any) =>
          typeof i === "string"
            ? { value: i, label: i }
            : { value: i.value, label: i.label || i.value },
        ),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [listHook.columnFilters],
  );

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "ASSET":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "LIABILITY":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "EQUITY":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30";
      case "REVENUE":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "EXPENSE":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getTypeLabel = useCallback(
    (type: string) => {
      const upper = (type || "").toUpperCase();
      switch (upper) {
        case "ASSET":
          return t("accounts.ASSET", "Tài sản");
        case "LIABILITY":
          return t("accounts.LIABILITY", "Nợ phải trả");
        case "EQUITY":
          return t("accounts.EQUITY", "Vốn chủ sở hữu");
        case "REVENUE":
          return t("accounts.REVENUE", "Doanh thu");
        case "EXPENSE":
          return t("accounts.EXPENSE", "Chi phí");
        case "OTHER":
          return t("accounts.OTHER", "Khác");
        default:
          return upper;
      }
    },
    [t],
  );

  const accountTypeFilterOptions = useMemo(
    () => [
      { value: "ASSET", label: t("accounts.ASSET", "Tài sản") },
      { value: "LIABILITY", label: t("accounts.LIABILITY", "Nợ phải trả") },
      { value: "EQUITY", label: t("accounts.EQUITY", "Vốn chủ sở hữu") },
      { value: "REVENUE", label: t("accounts.REVENUE", "Doanh thu") },
      { value: "EXPENSE", label: t("accounts.EXPENSE", "Chi phí") },
      { value: "OTHER", label: t("accounts.OTHER", "Khác") },
    ],
    [t],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: "true", label: t("accounts.active", "Đang hoạt động") },
      { value: "false", label: t("accounts.inactive", "Ngừng hoạt động") },
    ],
    [t],
  );

  const columns: DataTableColumn<ChartOfAccountItem>[] = useMemo(
    () => [
      // Cột STT (#)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] tabular-nums text-muted-foreground select-none",
        cell: (_: ChartOfAccountItem, idx: number) => <span>{idx}</span>,
      },
      // Cột Mã TK (accountCode)
      {
        key: "accountCode",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title={t("accounts.code", "Mã TK")}
            columnKey="accountCode"
            queryKeyPrefix="coa-account-code-options"
            allFilters={listHook.columnFilters}
            sortState={getSortState("accountCode")}
            onSortChange={(s) => listHook.setSort("accountCode", s)}
            searchValue={listHook.columnSearch["accountCode"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("accountCode", v)}
            selectedFilters={listHook.columnFilters["accountCode"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("accountCode", v)}
            fetchOptions={fetchAccountsColumnOptions}
            isActive={Boolean(
              listHook.columnFilters["accountCode"]?.length ||
              listHook.columnSearch["accountCode"],
            )}
          />
        ),
        size: 160,
        enableResizing: true,
        cell: (row: ChartOfAccountItem) => {
          const code = row.accountCode || row.account_code || "";
          return (
            <div className="flex items-center gap-1.5 w-full min-w-0">
              <TableText
                className="flex-1 min-w-0 font-mono font-medium"
                text={code}
                enableCopy={true}
                tooltip={true}
                onDetailClick={(e) => {
                  e.stopPropagation();
                  openView(row);
                }}
              />
            </div>
          );
        },
      },
      // Cột Tên tài khoản (accountName)
      {
        key: "accountName",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title={t("accounts.name", "Tên tài khoản")}
            columnKey="accountName"
            queryKeyPrefix="coa-account-name-options"
            allFilters={listHook.columnFilters}
            sortState={getSortState("accountName")}
            onSortChange={(s) => listHook.setSort("accountName", s)}
            searchValue={listHook.columnSearch["accountName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("accountName", v)}
            selectedFilters={listHook.columnFilters["accountName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("accountName", v)}
            fetchOptions={fetchAccountsColumnOptions}
            isActive={Boolean(
              listHook.columnFilters["accountName"]?.length ||
              listHook.columnSearch["accountName"],
            )}
          />
        ),
        size: 280,
        enableResizing: true,
        cell: (row: ChartOfAccountItem) => {
          const name = row.accountName || row.account_name || "";
          const hasParent = Boolean(row.parentId || row.parent_account_id);
          return (
            <div
              className={cn(
                "w-full min-w-0 truncate select-text",
                hasParent
                  ? "pl-4 text-foreground/90 font-normal"
                  : "font-semibold text-foreground",
              )}
              title={name}
            >
              {hasParent && (
                <span className="text-muted-foreground mr-1">↳</span>
              )}
              {name}
            </div>
          );
        },
      },
      // Cột Loại tài khoản (accountType)
      {
        key: "accountType",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title={t("accounts.type", "Loại tài khoản")}
            columnKey="accountType"
            sortState={getSortState("accountType")}
            onSortChange={(s) => listHook.setSort("accountType", s)}
            searchValue=""
            onSearchChange={() => {}}
            filterOptions={accountTypeFilterOptions}
            selectedFilters={listHook.columnFilters["accountType"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("accountType", v)}
            isActive={Boolean(listHook.columnFilters["accountType"]?.length)}
          />
        ),
        size: 160,
        enableResizing: true,
        className: "text-center",
        cell: (row: ChartOfAccountItem) => {
          const type = (
            row.accountType ||
            row.account_type ||
            "OTHER"
          ).toUpperCase();
          return (
            <div className="w-full flex justify-center">
              <Badge
                variant="outline"
                className={cn(
                  "w-[110px] inline-flex items-center justify-center text-center font-medium truncate",
                  getTypeBadgeClass(type),
                )}
              >
                {getTypeLabel(type)}
              </Badge>
            </div>
          );
        },
      },
      // Cột Tài khoản mẹ (parentAccount)
      {
        key: "parentAccount",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title={t("accounts.parent", "Tài khoản mẹ")}
            columnKey="parentAccount"
            queryKeyPrefix="coa-parent-account-options"
            allFilters={listHook.columnFilters}
            sortState={getSortState("parentAccount")}
            onSortChange={(s) => listHook.setSort("parentAccount", s)}
            searchValue={listHook.columnSearch["parentAccount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("parentAccount", v)}
            selectedFilters={listHook.columnFilters["parentAccount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("parentAccount", v)}
            fetchOptions={fetchAccountsColumnOptions}
            showBlankOption={true}
            isActive={Boolean(
              listHook.columnFilters["parentAccount"]?.length ||
              listHook.columnSearch["parentAccount"],
            )}
          />
        ),
        size: 200,
        enableResizing: true,
        cell: (row: ChartOfAccountItem) => {
          const parent = row.parent;
          if (!parent) {
            return <span className="text-muted-foreground text-xs">—</span>;
          }
          const pCode = parent.accountCode || parent.account_code || "";
          const pName = parent.accountName || parent.account_name || "";
          return (
            <div
              className="w-full truncate text-xs text-muted-foreground"
              title={`${pCode} — ${pName}`}
            >
              <span className="font-mono font-medium text-foreground mr-1.5">
                {pCode}
              </span>
              <span>{pName}</span>
            </div>
          );
        },
      },
      // Cột Trạng thái (isActive)
      {
        key: "isActive",
        header: (
          <TableColumnHeaderFilter
            align="center"
            title={t("accounts.status", "Trạng thái")}
            columnKey="isActive"
            sortState={getSortState("isActive")}
            onSortChange={(s) => listHook.setSort("isActive", s)}
            searchValue=""
            onSearchChange={() => {}}
            filterOptions={statusFilterOptions}
            selectedFilters={listHook.columnFilters["isActive"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("isActive", v)}
            isActive={Boolean(listHook.columnFilters["isActive"]?.length)}
          />
        ),
        size: 140,
        enableResizing: true,
        className: "text-center",
        cell: (row: ChartOfAccountItem) => {
          const active = row.isActive !== false && row.is_active !== false;
          return (
            <div className="w-full flex justify-center">
              <Badge
                variant={active ? "default" : "secondary"}
                className="w-[120px] inline-flex items-center justify-center text-center truncate font-medium text-xs"
              >
                {active
                  ? t("accounts.active", "Đang hoạt động")
                  : t("accounts.inactive", "Ngừng hoạt động")}
              </Badge>
            </div>
          );
        },
      },
    ],
    [
      getSortState,
      listHook,
      accountTypeFilterOptions,
      statusFilterOptions,
      getTypeLabel,
      openView,
      t,
    ],
  );

  return (
    <>
      <SpreadsheetPageTemplate<ChartOfAccountItem>
        title={t("accounts.title", "Hệ thống tài khoản")}
        desc={t(
          "accounts.description",
          "Danh mục tài khoản kế toán và quản lý phân cấp tài khoản",
        )}
        icon={<Layers className="w-5 h-5 text-primary" />}
        tableId="chart-of-accounts-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={listHook.isLoading}
        error={listHook.error}
        emptyLabel={t("accounts.noData", "Không có dữ liệu tài khoản")}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => listHook.refetch()}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        createLabel={t("accounts.actions.create", "Thêm mới tài khoản")}
        createActions={[
          {
            groupLabel: t("accounts.title", "Tài khoản"),
            items: [
              {
                label: t("accounts.actions.create", "Thêm mới tài khoản"),
                icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
                onClick: openCreate,
              },
            ],
          },
        ]}
        rowActions={(row: ChartOfAccountItem) => [
          {
            groupLabel: "TRA CỨU",
            items: [
              {
                label: t("accounts.actions.viewDetail", "Chi tiết"),
                icon: <Eye className="w-4 h-4" />,
                onClick: () => openView(row),
              },
            ],
          },
          {
            groupLabel: "THAO TÁC",
            items: [
              {
                label: t("accounts.actions.edit", "Chỉnh sửa"),
                icon: <Pencil className="w-4 h-4" />,
                onClick: () => openEdit(row),
              },
              {
                label: t("accounts.actions.delete", "Xóa tài khoản"),
                icon: <Trash2 className="w-4 h-4 text-destructive" />,
                variant: "danger",
                onClick: () => setDeleteTarget(row),
              },
            ],
          },
        ]}
      />

      {/* Detail / Create / Edit Drawer */}
      <AccountDrawer
        open={drawerOpen}
        mode={drawerMode}
        account={selectedAccount}
        onClose={closeDrawer}
        onToggleEdit={() => setDrawerMode("edit")}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={t("accounts.confirm.deleteTitle", "Xác nhận xóa tài khoản")}
        message={
          deleteTarget
            ? t(
                "accounts.confirm.deleteMessage",
                'Bạn có chắc chắn muốn xóa tài khoản "{code} - {name}"? Thao tác này không thể hoàn tác.',
              )
                .replace(
                  "{code}",
                  deleteTarget.accountCode || deleteTarget.account_code || "",
                )
                .replace(
                  "{name}",
                  deleteTarget.accountName || deleteTarget.account_name || "",
                )
            : ""
        }
        confirmLabel={t("accounts.confirm.deleteConfirm", "Xóa tài khoản")}
        cancelLabel={t("accounts.confirm.deleteCancel", "Hủy bỏ")}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        danger
      />
    </>
  );
}
