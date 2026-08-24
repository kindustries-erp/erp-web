import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useGarageOpexList } from "../hooks/useGarageOpexList";
import { GarageOpexDrawer } from "../components/GarageOpexDrawer";
import { garageOpexApi, type GarageOpexItem } from "../api/garageOpexApi";
import toast from "react-hot-toast";
import { ReceiptText, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

const CATEGORY_COLORS: Record<string, string> = {
  NHAN_SU:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  THUE_MAT_BANG:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
  DIEN_NUOC:
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50",
  VAT_TU_TIEU_HAO:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  BAO_TRI:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
  KHAU_HAO:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
  HOA_HONG_TRUC_TIEP:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
  CHI_PHI_TRUC_TIEP_KHAC:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
  HOA_HONG_SALE:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  HOA_HONG_DV:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50",
  KHAC: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
};

const getCostGroupInfo = (
  categoryKey: string,
  t: (key: string, fallback: string) => string,
): { label: string; badgeClass: string } => {
  if (
    categoryKey === "HOA_HONG_TRUC_TIEP" ||
    categoryKey === "CHI_PHI_TRUC_TIEP_KHAC"
  ) {
    return {
      label: t("opex.costGroups.COGS", "Giá vốn (COGS)"),
      badgeClass:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
    };
  }
  if (categoryKey.startsWith("HOA_HONG_")) {
    return {
      label: t("opex.costGroups.COMMISSION", "Hoa hồng"),
      badgeClass:
        "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700",
    };
  }
  return {
    label: t("opex.costGroups.OPEX", "CP Vận hành (OPEX)"),
    badgeClass:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
  };
};

export function GarageOpex() {
  const { t } = useTranslation("garage");
  const listHook = useGarageOpexList();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [isCreate, setIsCreate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GarageOpexItem | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GarageOpexItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDetail = (item: GarageOpexItem, mode: "view" | "edit" = "view") => {
    setSelectedItem(item);
    setIsCreate(false);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const openCreate = () => {
    setSelectedItem(null);
    setIsCreate(true);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleDuplicate = (item: GarageOpexItem) => {
    setSelectedItem(item);
    setIsCreate(true);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleDelete = (item: GarageOpexItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await garageOpexApi.delete(itemToDelete.id);
      toast.success(t("opex.deleteSuccess", "Đã xóa chi phí vận hành"));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      listHook.refetch();
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa chi phí");
    } finally {
      setDeleting(false);
    }
  };

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (listHook.sorts.includes(key)) return "asc";
    if (listHook.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const columns: DataTableColumn<GarageOpexItem>[] = useMemo(
    () => [
      // 1. STT: Bắt đầu từ 1, căn giữa tuyệt đối
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_: GarageOpexItem, idx: number) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      // 2. Kỳ báo cáo (MM/YYYY) với DateRangeColumnSlot
      {
        key: "period",
        header: (
          <TableColumnHeaderFilter
            title={t("opex.columns.period", "Kỳ báo cáo")}
            columnKey="period"
            sortState={getSortState("period")}
            onSortChange={(s) => listHook.setSort("period", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(listHook.dateFrom || listHook.dateTo)}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.dateFrom || ""}
                dateTo={listHook.dateTo || ""}
                onChange={(from, to) => {
                  listHook.setDateRange(from, to);
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 140,
        enableResizing: true,
        className: "text-center",
        cell: (row: GarageOpexItem) => (
          <span className="font-mono text-xs font-medium px-2 py-0.5 bg-muted rounded border border-border/50">
            {row.period}
          </span>
        ),
      },
      // 3. Nhóm chi phí (Cost Group / Phân loại)
      {
        key: "costGroup",
        header: (
          <span className="w-full block text-center font-medium">
            {t("opex.columns.costGroup", "Nhóm chi phí")}
          </span>
        ),
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row: GarageOpexItem) => {
          const groupInfo = getCostGroupInfo(row.categoryKey, t);
          return (
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 font-semibold ${groupInfo.badgeClass}`}
            >
              {groupInfo.label}
            </Badge>
          );
        },
      },
      // 4. Loại chi phí chi tiết (Category Badge)
      {
        key: "categoryKey",
        header: (
          <TableColumnHeaderFilter
            title={t("opex.columns.categoryKey", "Loại chi phí")}
            columnKey="categoryKey"
            queryKeyPrefix="garage-opex-cat-options"
            allFilters={listHook.columnFilters}
            searchValue=""
            onSearchChange={() => {}}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageOpexApi.getColumnOptions({
                column: "categoryKey",
                search,
                page: pageParam,
                pageSize: 20,
                filtersStr,
              });
              return {
                items: res.data.map((it: string) => ({
                  label: t(`opex.categories.${it}`, it),
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("categoryKey")}
            onSortChange={(s) => listHook.setSort("categoryKey", s)}
            selectedFilters={listHook.columnFilters["categoryKey"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("categoryKey", v)}
            isActive={Boolean(listHook.columnFilters["categoryKey"]?.length)}
            enableSelectAllMatching={true}
            align="center"
          />
        ),
        size: 200,
        enableResizing: true,
        cell: (row: GarageOpexItem) => {
          const colorClass =
            CATEGORY_COLORS[row.categoryKey] || CATEGORY_COLORS.KHAC;
          return (
            <Badge
              variant="outline"
              className={`text-xs px-2 py-0.5 font-medium truncate max-w-full ${colorClass}`}
            >
              {t(`opex.categories.${row.categoryKey}`, row.categoryKey)}
            </Badge>
          );
        },
      },
      // 5. Nội dung / Diễn giải
      {
        key: "categoryName",
        header: (
          <TableColumnHeaderFilter
            title={t("opex.columns.categoryName", "Nội dung / Diễn giải")}
            columnKey="categoryName"
            queryKeyPrefix="garage-opex-name-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageOpexApi.getColumnOptions({
                column: "categoryName",
                search,
                page: pageParam,
                pageSize: 20,
                filtersStr,
              });
              return {
                items: res.data.map((it: string) => ({
                  label: it,
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("categoryName")}
            onSortChange={(s) => listHook.setSort("categoryName", s)}
            searchValue={listHook.columnSearch["categoryName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("categoryName", v)}
            selectedFilters={listHook.columnFilters["categoryName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("categoryName", v)}
            isActive={Boolean(
              listHook.columnFilters["categoryName"]?.length ||
              listHook.columnSearch["categoryName"],
            )}
            enableSelectAllMatching={true}
            align="left"
          />
        ),
        size: 280,
        enableResizing: true,
        cell: (row: GarageOpexItem) => (
          <TableText
            text={row.categoryName}
            tooltip={true}
            onDetailClick={() => openDetail(row, "view")}
            className="font-medium text-foreground cursor-pointer hover:underline"
          />
        ),
      },
      // 6. Số tiền (VND)
      {
        key: "amount",
        header: (
          <TableColumnHeaderFilter
            title={t("opex.columns.amount", "Số tiền")}
            columnKey="amount"
            sortState={getSortState("amount")}
            onSortChange={(s) => listHook.setSort("amount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            align="right"
          />
        ),
        size: 160,
        enableResizing: true,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row: GarageOpexItem) => (
          <span className="tabular-nums font-semibold text-foreground">
            {row.amount.toLocaleString("vi-VN")} đ
          </span>
        ),
      },
      // 7. Ghi chú
      {
        key: "note",
        header: (
          <TableColumnHeaderFilter
            title={t("opex.columns.note", "Ghi chú")}
            columnKey="note"
            sortState={getSortState("note")}
            onSortChange={(s) => listHook.setSort("note", s)}
            searchValue={listHook.columnSearch["note"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("note", v)}
            selectedFilters={[]}
            onFilterChange={() => {}}
            isActive={Boolean(listHook.columnSearch["note"])}
            align="left"
          />
        ),
        size: 240,
        enableResizing: true,
        cell: (row: GarageOpexItem) => (
          <TableText
            text={row.note || "—"}
            tooltip={true}
            className="text-muted-foreground text-xs"
          />
        ),
      },
    ],
    [
      listHook.sorts,
      listHook.columnFilters,
      listHook.columnSearch,
      listHook.dateFrom,
      listHook.dateTo,
      listHook.page,
      listHook.pageSize,
      t,
    ],
  );

  // Row Actions
  const getRowActions = (row: GarageOpexItem): ActionDropdownItem[] => [
    {
      groupLabel: t("common.actions", "THAO TÁC"),
      items: [
        {
          label: t("opex.actions.viewDetail", "Xem chi tiết"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => openDetail(row, "view"),
        },
        {
          label: t("opex.actions.editExpense", "Chỉnh sửa"),
          icon: <Pencil className="w-4 h-4" />,
          onClick: () => openDetail(row, "edit"),
        },
        {
          label: t("opex.actions.duplicateExpense", "Nhân đôi"),
          icon: <Copy className="w-4 h-4" />,
          onClick: () => handleDuplicate(row),
        },
        {
          label: t("opex.actions.deleteExpense", "Xóa"),
          icon: <Trash2 className="w-4 h-4 text-destructive" />,
          variant: "danger",
          onClick: () => handleDelete(row),
        },
      ],
    },
  ];

  const totalAmountSum = useMemo(() => {
    return listHook.data.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [listHook.data]);

  return (
    <>
      <SpreadsheetPageTemplate<GarageOpexItem>
        title={t("opex.pageTitle", "Chi phí vận hành")}
        desc={t(
          "opex.pageDesc",
          "Quản lý các khoản chi phí vận hành hàng tháng tại xưởng Garage",
        )}
        icon={<ReceiptText className="w-5 h-5 text-primary" />}
        tableId="garage-opex-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={listHook.isLoading}
        emptyLabel={t("opex.empty", "Chưa có dữ liệu chi phí vận hành")}
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
        onCreate={openCreate}
        createLabel={t("opex.actions.addExpense", "Thêm chi phí")}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={getRowActions}
        summaryRow={{
          amount: (
            <div className="text-right font-bold text-primary tabular-nums">
              {totalAmountSum.toLocaleString("vi-VN")} đ
            </div>
          ),
        }}
      />

      {/* Drawer Create / View / Edit */}
      <GarageOpexDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        setMode={setDrawerMode}
        isCreate={isCreate}
        initialData={selectedItem}
        onSuccess={() => listHook.refetch()}
      />

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("opex.actions.deleteConfirmTitle", "Xác nhận xóa chi phí")}
        message={
          itemToDelete
            ? `${t("opex.actions.deleteConfirmDesc", "Bạn có chắc chắn muốn xóa:")} ${itemToDelete.categoryName} (${itemToDelete.period} - ${itemToDelete.amount.toLocaleString("vi-VN")} đ)?`
            : ""
        }
        confirmLabel={t("common.delete", "Xóa")}
        cancelLabel={t("common.cancel", "Hủy")}
        danger={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        loading={deleting}
      />
    </>
  );
}
export default GarageOpex;
