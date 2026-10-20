import React, { useState, useMemo, useCallback } from "react";
import { Landmark, Plus, Pencil, Trash2 } from "lucide-react";
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
  type ErpBankAccount,
} from "@/modules/bank-statements/api/bankStatementApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { BankAccountDrawer } from "@/modules/settings/components/BankAccountDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { money } from "@/shared/utils/format";
import toast from "react-hot-toast";

export function ThietLapNganHang() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ErpBankAccount | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ErpBankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const tableState = useTableColumnState("settings-bank-accounts-table");

  React.useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["nav.items.cashflow"],
      ["thietlap.tabs.ngan-hang"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
    refetch,
  } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => bankStatementApi.getBankAccounts(),
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

  const normalizedAccounts = useMemo(() => {
    return accounts.map((a: any) => ({
      ...a,
      branchName:
        a.branch?.name || (a.branchId ? branchMap.get(a.branchId) : "") || "",
    }));
  }, [accounts, branchMap]);

  const filteredItems = useMemo(() => {
    return filterClientItems(normalizedAccounts, tableState);
  }, [normalizedAccounts, tableState]);

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
      await bankStatementApi.deleteBankAccount(deleteTarget.id);
      refetch();
      toast.success("Xóa tài khoản thành công");
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
        items: normalizedAccounts,
      }),
    [tableState, normalizedAccounts],
  );

  const columns: DataTableColumn<ErpBankAccount & { branchName?: string }>[] =
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

        // 2. Mã NH
        {
          key: "bankCode",
          header: headerFilter(
            "bankCode",
            t("thietlap.columns.bankCode", "Mã NH"),
            {
              showBlankOption: true,
            },
          ),
          size: 110,
          minSize: 90,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.bankCode || "—"}
              tooltip={true}
              enableCopy={true}
              textClassName="font-mono text-xs font-semibold text-primary select-text"
            />
          ),
        },

        // 3. Tên ngân hàng
        {
          key: "bankName",
          header: headerFilter(
            "bankName",
            t("thietlap.columns.bankName", "Tên ngân hàng"),
            {
              showBlankOption: true,
            },
          ),
          size: 220,
          minSize: 160,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.bankName || "—"}
              tooltip={true}
              enableCopy={true}
              textClassName="truncate text-xs font-medium text-foreground select-text"
            />
          ),
        },

        // 4. Số tài khoản
        {
          key: "accountNumber",
          header: headerFilter(
            "accountNumber",
            t("thietlap.columns.accountNumber", "Số tài khoản"),
            {
              showBlankOption: true,
            },
          ),
          size: 160,
          minSize: 130,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.accountNumber || "—"}
              tooltip={true}
              enableCopy={true}
              textClassName="font-mono text-xs font-semibold text-foreground select-text"
            />
          ),
        },

        // 5. Tên tài khoản
        {
          key: "accountName",
          header: headerFilter(
            "accountName",
            t("thietlap.columns.accountName", "Tên tài khoản"),
            {
              showBlankOption: true,
            },
          ),
          size: 220,
          minSize: 160,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.accountName || "—"}
              tooltip={true}
              enableCopy={true}
              textClassName="truncate text-xs text-muted-foreground select-text"
            />
          ),
        },

        // 6. Chi nhánh
        {
          key: "branchName",
          header: headerFilter(
            "branchName",
            t("thietlap.columns.branch", "Chi nhánh"),
            {
              showBlankOption: true,
            },
          ),
          size: 180,
          minSize: 140,
          enableResizing: true,
          cell: (a) => (
            <TableText
              text={a.branchName || "—"}
              tooltip={true}
              textClassName="truncate text-xs text-foreground select-text"
            />
          ),
        },

        // 7. Số dư ban đầu
        {
          key: "openingBalance",
          header: headerFilter.amount(
            "openingBalance",
            t("thietlap.columns.openingBalance", "Số dư ban đầu"),
          ),
          size: 150,
          minSize: 120,
          enableResizing: true,
          className: "text-right",
          cell: (a) => (
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {money(a.openingBalance || 0)}
            </span>
          ),
        },

        // 8. Trạng thái
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
    (a: ErpBankAccount) => [
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
        title={t("thietlap.tabs.ngan-hang", "Tài khoản ngân hàng")}
        desc={t("thietlap.desc", "Quản lý danh sách tài khoản ngân hàng")}
        icon={<Landmark className="h-4 w-4" />}
        tableId="settings-bank-accounts-table"
        items={paginatedItems}
        columns={columns}
        getRowKey={(a) => a.id}
        loading={isAccountsLoading}
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

      <BankAccountDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bankAccount={editingItem}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete", "Xóa tài khoản")}
        message={`Bạn có chắc chắn muốn xóa tài khoản ${deleteTarget?.accountNumber}?`}
        loading={deleting}
      />
    </>
  );
}
