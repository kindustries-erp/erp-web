import React, { useState, useMemo, useCallback } from "react";
import { GitBranch, Plus, Pencil, Trash2 } from "lucide-react";
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
  getBranchesApi,
  type Branch,
  deleteBranchApi,
} from "@/modules/branches/api/branchApi";
import { BranchFormDrawer } from "@/modules/branches/components/BranchFormDrawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import toast from "react-hot-toast";

export function SettingsBranch() {
  const { setCustomBreadcrumbs } = useAppStore();
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const tableState = useTableColumnState("settings-branch-table");

  React.useEffect(() => {
    setCustomBreadcrumbs([
      ["nav.sections.system"],
      ["thietlap.tabs.chi-nhanh"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  const {
    data: branches = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const filteredItems = useMemo(() => {
    return filterClientItems(branches, tableState);
  }, [branches, tableState]);

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
      await deleteBranchApi(deleteTarget.id);
      refetch();
      toast.success("Xóa chi nhánh thành công");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: branches,
      }),
    [tableState, branches],
  );

  const columns: DataTableColumn<Branch>[] = useMemo(() => {
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

      // 2. Mã chi nhánh
      {
        key: "code",
        header: headerFilter(
          "code",
          t("thietlap.columns.code", "Mã chi nhánh"),
          {
            showBlankOption: true,
          },
        ),
        size: 180,
        minSize: 140,
        enableResizing: true,
        cell: (b) => (
          <TableText
            text={b.code || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="font-mono text-xs font-semibold text-primary select-text"
          />
        ),
      },

      // 3. Tên chi nhánh
      {
        key: "name",
        header: headerFilter(
          "name",
          t("thietlap.columns.name", "Tên chi nhánh"),
          {
            showBlankOption: true,
          },
        ),
        size: 320,
        minSize: 220,
        enableResizing: true,
        cell: (b) => (
          <TableText
            text={b.name || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="truncate text-xs font-medium text-foreground select-text"
          />
        ),
      },

      // 4. Trạng thái
      {
        key: "is_active",
        header: headerFilter.client(
          "is_active",
          t("thietlap.columns.status", "Trạng thái"),
          {
            filterOptions: [
              { label: "Hoạt động", value: "true" },
              { label: "Ngưng hoạt động", value: "false" },
            ],
          },
        ),
        size: 140,
        minSize: 120,
        enableResizing: true,
        className: "text-center",
        cell: (b) => (
          <Badge
            variant="ghost"
            className={`border min-h-[18px] h-[18px] py-0 px-2 text-[10px] leading-none ${
              b.is_active
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {b.is_active ? "Hoạt động" : "Ngưng"}
          </Badge>
        ),
      },
    ];
  }, [headerFilter, t]);

  const rowActions = useCallback(
    (b: Branch) => [
      {
        groupLabel: t("common.actions", "Thao tác"),
        items: [
          {
            label: t("common.edit", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => {
              setEditingBranch(b);
              setDrawerOpen(true);
            },
          },
          {
            label: t("common.delete", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: "danger" as const,
            onClick: () => setDeleteTarget(b),
          },
        ],
      },
    ],
    [t],
  );

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("thietlap.tabs.chi-nhanh", "Chi nhánh")}
        desc={t("thietlap.desc", "Quản lý danh sách chi nhánh")}
        icon={<GitBranch className="h-4 w-4" />}
        tableId="settings-branch-table"
        items={paginatedItems}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={isLoading}
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
            onClick: () => {
              setEditingBranch(null);
              setDrawerOpen(true);
            },
          },
        ]}
        onRefresh={() => refetch()}
        rowActions={rowActions}
      />

      <BranchFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        branch={editingBranch}
        onSuccess={() => refetch()}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete", "Xóa chi nhánh")}
        message={`Bạn có chắc chắn muốn xóa chi nhánh ${deleteTarget?.code}?`}
        loading={deleting}
      />
    </>
  );
}
