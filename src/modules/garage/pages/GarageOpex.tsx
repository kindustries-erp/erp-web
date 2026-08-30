import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  useGarageOpexList,
  type CostGroupFilter,
} from "../hooks/useGarageOpexList";
import { GarageOpexDrawer } from "../components/GarageOpexDrawer";
import { garageOpexApi, type GarageOpexItem } from "../api/garageOpexApi";
import toast from "react-hot-toast";
import { ReceiptText, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { cn } from "@/shared/utils";

const getCostGroupInfo = (
  categoryKey: string,
  t: (key: string, fallback: string) => string,
): { label: string; badgeClass: string; groupKey: CostGroupFilter } => {
  if (
    categoryKey === "HOA_HONG_TRUC_TIEP" ||
    categoryKey === "CHI_PHI_TRUC_TIEP_KHAC"
  ) {
    return {
      label: t("opex.costGroups.COGS", "Giá vốn (COGS)"),
      badgeClass:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 font-normal",
      groupKey: "COGS",
    };
  }
  if (categoryKey.startsWith("HOA_HONG_")) {
    return {
      label: t("opex.costGroups.COMMISSION", "Hoa hồng"),
      badgeClass:
        "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700/60 font-normal",
      groupKey: "COMMISSION",
    };
  }
  return {
    label: t("opex.costGroups.OPEX", "CP Vận hành"),
    badgeClass:
      "bg-muted/60 text-muted-foreground border-border/80 font-normal",
    groupKey: "OPEX",
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

  // Standardize Column Header Filter Helper (Default align ALWAYS center)
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        defaultAlign: "center",
        queryKeyPrefix: "garage-opex-column-options",
        fetchOptions: async ({ columnKey, search, pageParam, filtersStr }) => {
          const res = await garageOpexApi.getColumnOptions({
            column: columnKey,
            search,
            page: pageParam,
            pageSize: 20,
            filtersStr,
          });
          return {
            items: res.data.map((it: string) => ({
              label:
                columnKey === "categoryKey"
                  ? t(`opex.categories.${it}`, it)
                  : columnKey === "recurrenceType" && it === "monthly"
                    ? t("opex.drawer.monthlyLabel", "Hàng tháng")
                    : it,
              value: it,
            })),
            total: res.total,
            next: res.page < res.totalPages ? res.page + 1 : null,
          };
        },
      }),
    [listHook, t],
  );

  // Define Columns following /standardize-table rules (100% Header Center Aligned & 100% Columns Filterable)
  const columns: DataTableColumn<GarageOpexItem>[] = useMemo(
    () => [
      // 1. Cột STT: 40px, non-resizable, căn giữa tuyệt đối
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground font-normal",
        cell: (_: GarageOpexItem, idx: number) => (
          <span className="w-full block text-center font-normal">{idx}</span>
        ),
      },

      // 2. Cột Kỳ báo cáo (MM/YYYY) - Header căn giữa, Text thường căn giữa
      {
        key: "period",
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        header: headerFilter.date(
          "period",
          t("opex.columns.period", "Kỳ báo cáo"),
          { align: "center" },
        ),
        cell: (row: GarageOpexItem) => (
          <span className="font-mono text-xs font-normal text-foreground">
            {row.period}
          </span>
        ),
      },

      // 3. Nhóm chi phí (Cost Group) - Header căn giữa + Filter Client Options + Tooltip + Ellipsis
      {
        key: "costGroup",
        size: 140,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        header: headerFilter.client(
          "costGroup",
          t("opex.columns.costGroup", "Nhóm chi phí"),
          {
            align: "center",
            filterOptions: [
              {
                label: t("opex.costGroups.OPEX", "CP Vận hành"),
                value: "OPEX",
              },
              {
                label: t("opex.costGroups.COGS", "Giá vốn (COGS)"),
                value: "COGS",
              },
              {
                label: t("opex.costGroups.COMMISSION", "Hoa hồng"),
                value: "COMMISSION",
              },
            ],
          },
        ),
        cell: (row: GarageOpexItem) => {
          const groupInfo = getCostGroupInfo(row.categoryKey, t);
          return (
            <div className="w-full flex justify-center">
              <Tooltip content={groupInfo.label}>
                <Badge
                  variant="outline"
                  className={cn(
                    "w-[110px] inline-flex items-center justify-center text-center px-2 py-0.5 font-normal",
                    groupInfo.badgeClass,
                  )}
                >
                  <span className="truncate block w-full text-center">
                    {groupInfo.label}
                  </span>
                </Badge>
              </Tooltip>
            </div>
          );
        },
      },

      // 4. Loại chi phí (Category Key) - Header căn giữa + Icon Detail Drawer mở View Mode tại đây
      {
        key: "categoryKey",
        size: 210,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        header: headerFilter(
          "categoryKey",
          t("opex.columns.categoryKey", "Loại chi phí"),
          {
            align: "center",
            enableSelectAllMatching: true,
          },
        ),
        cell: (row: GarageOpexItem) => (
          <TableText
            text={t(`opex.categories.${row.categoryKey}`, row.categoryKey)}
            tooltip={true}
            onDetailClick={() => openDetail(row, "view")}
            className="font-normal text-xs text-foreground cursor-pointer hover:underline"
          />
        ),
      },

      // 5. Nội dung / Diễn giải chi tiết - Header căn giữa + Text thường căn trái
      {
        key: "categoryName",
        size: 240,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        header: headerFilter(
          "categoryName",
          t("opex.columns.categoryName", "Nội dung / Diễn giải"),
          {
            align: "center",
            enableSelectAllMatching: true,
          },
        ),
        cell: (row: GarageOpexItem) => (
          <TableText
            text={row.categoryName}
            tooltip={true}
            className="font-normal text-xs text-foreground"
          />
        ),
      },

      // 6. Chu kỳ lặp lại (Recurrence Type) - Header căn giữa + Badge fixed-width w-[88px]
      {
        key: "recurrenceType",
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        header: headerFilter(
          "recurrenceType",
          t("opex.columns.recurrenceType", "Chu kỳ lặp"),
          {
            align: "center",
            showBlankOption: true,
          },
        ),
        cell: (row: GarageOpexItem) => (
          <div className="w-full flex justify-center">
            {row.recurrenceType === "monthly" ? (
              <Badge
                variant="outline"
                className="w-[88px] inline-flex items-center justify-center text-center text-[11px] font-normal text-primary border-primary/30 bg-primary/5 truncate"
              >
                <span className="truncate block w-full text-center">
                  {t("opex.drawer.monthlyLabel", "Hàng tháng")}
                </span>
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs font-normal">
                —
              </span>
            )}
          </div>
        ),
      },

      // 7. Thời hạn kết thúc (Recurrence Until) - Header căn giữa + Căn giữa cell
      {
        key: "recurrenceUntil",
        size: 120,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        header: headerFilter(
          "recurrenceUntil",
          t("opex.columns.recurrenceUntil", "Hạn kết thúc"),
          {
            align: "center",
            showBlankOption: true,
          },
        ),
        cell: (row: GarageOpexItem) => {
          if (row.recurrenceUntilMonth && row.recurrenceUntilYear) {
            return (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {String(row.recurrenceUntilMonth).padStart(2, "0")}/
                {row.recurrenceUntilYear}
              </span>
            );
          }
          return (
            <span className="text-muted-foreground text-xs font-normal">—</span>
          );
        },
      },

      // 8. Số tiền (VND) - Header căn giữa + Filter Amount chuẩn + Cell căn phải
      {
        key: "amount",
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right",
        header: headerFilter.amount(
          "amount",
          t("opex.columns.amount", "Số tiền"),
          { align: "center" },
        ),
        cell: (row: GarageOpexItem) => (
          <div className="flex flex-col items-end gap-0.5">
            <span className="tabular-nums font-mono text-xs font-normal text-foreground">
              {row.amount.toLocaleString("vi-VN")} đ
            </span>
            {Boolean(row.ojAmount && row.ojAmount > 0) && (
              <span className="text-[11px] font-mono text-muted-foreground font-normal">
                OJ: {row.ojAmount!.toLocaleString("vi-VN")} đ
              </span>
            )}
          </div>
        ),
      },

      // 9. Ghi chú (Note) - Header căn giữa + Cell căn trái + showBlankOption
      {
        key: "note",
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        header: headerFilter("note", t("opex.columns.note", "Ghi chú"), {
          align: "center",
          showBlankOption: true,
        }),
        cell: (row: GarageOpexItem) => (
          <TableText
            text={row.note || "—"}
            tooltip={true}
            className="text-muted-foreground text-xs font-normal"
          />
        ),
      },
    ],
    [headerFilter, t],
  );

  // Row Actions (Standard Context Menu & Row Action items)
  const getRowActions = useCallback(
    (row: GarageOpexItem): ActionDropdownItem[] => [
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
    ],
    [t],
  );

  // Calculate Subtotals for Summary Row
  const { totalAmountSum, totalOjSum } = useMemo(() => {
    let amt = 0;
    let oj = 0;
    for (const r of listHook.data) {
      amt += r.amount || 0;
      oj += r.ojAmount || 0;
    }
    return { totalAmountSum: amt, totalOjSum: oj };
  }, [listHook.data]);

  // Toolbar Quick Filter PillTabs Items
  const pillTabItems: PillTabItem<CostGroupFilter>[] = useMemo(
    () => [
      { value: "ALL", label: t("opex.tabs.all", "Tất cả") },
      { value: "OPEX", label: t("opex.tabs.opex", "CP Vận hành") },
      { value: "COGS", label: t("opex.tabs.cogs", "Giá vốn (COGS)") },
      { value: "COMMISSION", label: t("opex.tabs.commission", "Hoa hồng") },
    ],
    [t],
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
        onClearAllFilters={() => {
          listHook.clearAllFilters();
          listHook.setCostGroup("ALL");
        }}
        rowActions={getRowActions}
        customActionsNode={
          <PillTabs<CostGroupFilter>
            value={listHook.costGroup}
            onValueChange={(val) => listHook.setCostGroup(val)}
            items={pillTabItems}
            className="w-full sm:w-auto shrink-0"
            listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
            triggerClassName="h-7 px-3.5 text-xs rounded-full"
            hideBorder
          />
        }
        summaryRow={{
          amount: (
            <div className="flex flex-col items-end justify-center">
              <span className="font-semibold text-primary tabular-nums font-mono text-xs">
                {totalAmountSum.toLocaleString("vi-VN")} đ
              </span>
              {totalOjSum > 0 && (
                <span className="text-[11px] font-mono text-muted-foreground font-normal">
                  OJ: {totalOjSum.toLocaleString("vi-VN")} đ
                </span>
              )}
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
