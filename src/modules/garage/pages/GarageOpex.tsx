import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { useGarageOpexList } from "../hooks/useGarageOpexList";
import { GarageOpexDrawer } from "../components/GarageOpexDrawer";
import { garageOpexApi, type GarageOpexItem } from "../api/garageOpexApi";
import toast from "react-hot-toast";
import { ReceiptText, Eye, Pencil, Trash2 } from "lucide-react";
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
  HOA_HONG_SALE:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  HOA_HONG_DV:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50",
  KHAC: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
};

export function GarageOpex() {
  const { t } = useTranslation("garage");
  const listHook = useGarageOpexList();

  const currentYear = new Date().getFullYear();

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
          <span className="w-full block text-center">
            {(listHook.page - 1) * listHook.pageSize + idx + 1}
          </span>
        ),
      },
      // 2. Kỳ báo cáo (MM/YYYY)
      {
        key: "period",
        header: (
          <TableColumnHeaderFilter
            title={t("opex.columns.period", "Kỳ báo cáo")}
            columnKey="period"
            queryKeyPrefix="garage-opex-period-options"
            allFilters={listHook.columnFilters}
            searchValue=""
            onSearchChange={() => {}}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageOpexApi.getColumnOptions({
                column: "period",
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
            sortState={getSortState("period")}
            onSortChange={(s) => listHook.setSort("period", s)}
            selectedFilters={listHook.columnFilters["period"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("period", v)}
            isActive={Boolean(listHook.columnFilters["period"]?.length)}
            enableSelectAllMatching={false}
            align="center"
          />
        ),
        size: 130,
        enableResizing: true,
        className: "text-center",
        cell: (row: GarageOpexItem) => (
          <span className="font-mono text-xs font-medium px-2 py-0.5 bg-muted rounded border border-border/50">
            {row.period}
          </span>
        ),
      },
      // 3. Loại chi phí (Category Badge)
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
      // 4. Nội dung / Diễn giải
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
      // 5. Số tiền (VND)
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
      // 6. Ghi chú
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

  const monthFilterOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "", label: t("common.allMonths", "Tất cả tháng") },
      ...Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `${t("pnl.monthLabel", "Tháng")} ${i + 1}`,
      })),
    ],
    [t],
  );

  const yearFilterOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "", label: t("common.allYears", "Tất cả năm") },
      ...Array.from({ length: 5 }, (_, i) => ({
        value: String(currentYear - 2 + i),
        label: `${t("pnl.yearLabel", "Năm")} ${currentYear - 2 + i}`,
      })),
    ],
    [currentYear, t],
  );

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
        extraActions={
          <div className="flex items-center gap-2">
            {/* Filter Tháng Combobox */}
            <Combobox
              options={monthFilterOptions}
              value={listHook.month !== undefined ? String(listHook.month) : ""}
              onChange={(val) => {
                const numVal = val ? Number(val) : undefined;
                listHook.setPeriodFilter(listHook.year, numVal);
              }}
              placeholder={t("common.allMonths", "Tất cả tháng")}
              className="w-36 h-8 text-xs"
              allowClear={true}
            />

            {/* Filter Năm Combobox */}
            <Combobox
              options={yearFilterOptions}
              value={listHook.year !== undefined ? String(listHook.year) : ""}
              onChange={(val) => {
                const numVal = val ? Number(val) : undefined;
                listHook.setPeriodFilter(numVal, listHook.month);
              }}
              placeholder={t("common.allYears", "Tất cả năm")}
              className="w-32 h-8 text-xs"
              allowClear={true}
            />
          </div>
        }
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
