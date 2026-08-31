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
  useOperatingExpensesList,
  type CostGroupFilter,
} from "../modules/budget/hooks/useOperatingExpensesList";
import { BudgetDrawer } from "../modules/budget/components/BudgetDrawer";
import {
  budgetApi,
  type OperatingExpenseItem,
  type CostGroupType,
} from "../modules/budget/api/budgetApi";
import toast from "react-hot-toast";
import { Target, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { cn } from "@/shared/utils";

const getCostGroupInfo = (
  costGroup: CostGroupType | string | null | undefined,
  categoryKey: string | null | undefined,
  t: (key: string, fallback: string) => string,
): { label: string; badgeClass: string; groupKey: CostGroupFilter } => {
  if (
    costGroup === "COGS" ||
    categoryKey === "THAU_PHU_GIA_CONG" ||
    categoryKey === "VAN_CHUYEN_LOGISTICS" ||
    categoryKey === "CHI_PHI_TRUC_TIEP_KHAC" ||
    categoryKey === "HOA_HONG_TRUC_TIEP"
  ) {
    return {
      label: t("costGroups.COGS", "Giá vốn (COGS)"),
      badgeClass:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 font-normal",
      groupKey: "COGS",
    };
  }
  if (
    costGroup === "COMMISSION" ||
    categoryKey === "HOA_HONG_KINH_DOANH" ||
    categoryKey === "MARKETING_QC" ||
    categoryKey === "CHIET_KHAU_TM" ||
    categoryKey?.startsWith("HOA_HONG_")
  ) {
    return {
      label: t("costGroups.COMMISSION", "Hoa hồng"),
      badgeClass:
        "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700/60 font-normal",
      groupKey: "COMMISSION",
    };
  }
  return {
    label: t("costGroups.OPEX", "CP Vận hành"),
    badgeClass:
      "bg-muted/60 text-muted-foreground border-border/80 font-normal",
    groupKey: "OPEX",
  };
};

export function OpexPage() {
  const { t } = useTranslation("budget");
  const listHook = useOperatingExpensesList();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [isCreate, setIsCreate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OperatingExpenseItem | null>(
    null,
  );

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<OperatingExpenseItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const openDetail = (
    item: OperatingExpenseItem,
    mode: "view" | "edit" = "view",
  ) => {
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

  const handleDuplicate = (item: OperatingExpenseItem) => {
    setSelectedItem(item);
    setIsCreate(true);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleDelete = (item: OperatingExpenseItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await budgetApi.deleteExpense(itemToDelete.id);
      toast.success(t("deleteSuccess", "Đã xóa khoản chi thành công"));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      listHook.refetch();
    } catch (err: any) {
      toast.error(err?.message || t("deleteError", "Không thể xóa khoản chi"));
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
        queryKeyPrefix: "operating-expenses-column-options",
        fetchOptions: async ({ columnKey, search, pageParam, filtersStr }) => {
          const res = await budgetApi.getColumnOptions({
            columnKey,
            search,
            pageParam,
            pageSize: 20,
            filtersStr,
          });
          return {
            items: res.items.map((it) => ({
              label:
                columnKey === "categoryKey" || columnKey === "expenseCategory"
                  ? t(`categories.${it.value}`, it.label)
                  : columnKey === "recurrenceType" &&
                      (it.value === "MONTHLY" || it.value === "monthly")
                    ? t("cycleMonthly", "Hàng tháng")
                    : columnKey === "paymentStatus"
                      ? it.value === "PAID"
                        ? t("paymentPaid", "Đã TT")
                        : it.value === "PARTIAL"
                          ? t("paymentPartial", "TT 1 phần")
                          : t("paymentUnpaid", "Chưa TT")
                      : it.label,
              value: it.value,
            })),
            total: res.total,
            next: res.next,
          };
        },
      }),
    [listHook, t],
  );

  // Define Columns following /standardize-table rules (100% Header Center Aligned & 100% Columns Filterable)
  const columns: DataTableColumn<OperatingExpenseItem>[] = useMemo(
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
        cell: (_: OperatingExpenseItem, idx: number) => (
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
        header: headerFilter.date("period", t("colPeriod", "Kỳ báo cáo"), {
          align: "center",
        }),
        cell: (row: OperatingExpenseItem) => (
          <span className="font-mono text-xs font-normal text-foreground">
            {row.period ||
              (row.periodMonth && row.periodYear
                ? `${String(row.periodMonth).padStart(2, "0")}/${row.periodYear}`
                : "—")}
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
          t("colCostGroup", "Nhóm chi phí"),
          {
            align: "center",
            filterOptions: [
              {
                label: t("costGroups.OPEX", "CP Vận hành"),
                value: "OPEX",
              },
              {
                label: t("costGroups.COGS", "Giá vốn (COGS)"),
                value: "COGS",
              },
              {
                label: t("costGroups.COMMISSION", "Hoa hồng"),
                value: "COMMISSION",
              },
            ],
          },
        ),
        cell: (row: OperatingExpenseItem) => {
          const groupInfo = getCostGroupInfo(
            row.costGroup,
            row.categoryKey || row.expenseCategory,
            t,
          );
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
          t("colCategoryKey", "Loại chi phí"),
          {
            align: "center",
            enableSelectAllMatching: true,
          },
        ),
        cell: (row: OperatingExpenseItem) => {
          const catKey = row.categoryKey || row.expenseCategory || "KHAC";
          return (
            <TableText
              text={t(`categories.${catKey}`, catKey)}
              tooltip={true}
              onDetailClick={() => openDetail(row, "view")}
              className="font-normal text-xs text-foreground cursor-pointer hover:underline"
            />
          );
        },
      },

      // 5. Nội dung / Diễn giải chi tiết - Header căn giữa + Text thường căn trái
      {
        key: "title",
        size: 240,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        header: headerFilter("title", t("colTitle", "Nội dung / Diễn giải"), {
          align: "center",
          enableSelectAllMatching: true,
        }),
        cell: (row: OperatingExpenseItem) => (
          <TableText
            text={row.title || row.expenseCategory || "—"}
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
        header: headerFilter("recurrenceType", t("colCycle", "Chu kỳ lặp"), {
          align: "center",
          showBlankOption: true,
        }),
        cell: (row: OperatingExpenseItem) => (
          <div className="w-full flex justify-center">
            {row.recurrenceType === "MONTHLY" ||
            row.recurrenceType === "monthly" ? (
              <Badge
                variant="outline"
                className="w-[88px] inline-flex items-center justify-center text-center text-[11px] font-normal text-primary border-primary/30 bg-primary/5 truncate"
              >
                <span className="truncate block w-full text-center">
                  {t("cycleMonthly", "Hàng tháng")}
                </span>
              </Badge>
            ) : row.recurrenceType === "QUARTERLY" ? (
              <Badge
                variant="outline"
                className="w-[88px] inline-flex items-center justify-center text-center text-[11px] font-normal text-muted-foreground border-border bg-muted/30 truncate"
              >
                <span className="truncate block w-full text-center">
                  {t("cycleQuarterly", "Hàng quý")}
                </span>
              </Badge>
            ) : row.recurrenceType === "YEARLY" ? (
              <Badge
                variant="outline"
                className="w-[88px] inline-flex items-center justify-center text-center text-[11px] font-normal text-muted-foreground border-border bg-muted/30 truncate"
              >
                <span className="truncate block w-full text-center">
                  {t("cycleYearly", "Hàng năm")}
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
          t("colRecurrenceUntil", "Hạn kết thúc"),
          {
            align: "center",
            showBlankOption: true,
          },
        ),
        cell: (row: OperatingExpenseItem) => {
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
        key: "totalAmount",
        size: 160,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right",
        header: headerFilter.amount("totalAmount", t("colAmount", "Số tiền"), {
          align: "center",
        }),
        cell: (row: OperatingExpenseItem) => (
          <div className="flex flex-col items-end gap-0.5">
            <span className="tabular-nums font-mono text-xs font-normal text-foreground">
              {(Number(row.totalAmount || row.amount) || 0).toLocaleString(
                "vi-VN",
              )}{" "}
              đ
            </span>
          </div>
        ),
      },

      // 9. Cột Thanh toán: Badge fixed width w-[88px] + formatOptionLabel
      {
        key: "paymentStatus",
        size: 130,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        header: headerFilter(
          "paymentStatus",
          t("colPaymentStatus", "Thanh toán"),
          {
            align: "center",
            showBlankOption: true,
          },
        ),
        cell: (row: OperatingExpenseItem) => {
          const isPaid = row.paymentStatus === "PAID";
          const isPartial = row.paymentStatus === "PARTIAL";
          return (
            <div className="w-full flex justify-center">
              <Tooltip
                content={
                  isPaid
                    ? t("paymentPaid", "Đã TT")
                    : isPartial
                      ? t("paymentPartial", "TT 1 phần")
                      : t("paymentUnpaid", "Chưa TT")
                }
              >
                <Badge
                  variant={
                    isPaid ? "default" : isPartial ? "outline" : "secondary"
                  }
                  className="w-[88px] inline-flex items-center justify-center text-center truncate font-normal text-xs"
                >
                  {isPaid
                    ? t("paymentPaid", "Đã TT")
                    : isPartial
                      ? t("paymentPartial", "TT 1 phần")
                      : t("paymentUnpaid", "Chưa TT")}
                </Badge>
              </Tooltip>
            </div>
          );
        },
      },

      // 10. Ghi chú (Notes) - Header căn giữa + Cell căn trái + showBlankOption
      {
        key: "notes",
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        header: headerFilter("notes", t("colNotes", "Ghi chú"), {
          align: "center",
          showBlankOption: true,
        }),
        cell: (row: OperatingExpenseItem) => (
          <TableText
            text={row.notes || "—"}
            tooltip={true}
            className="text-muted-foreground text-xs font-normal"
          />
        ),
      },
    ],
    [headerFilter, t],
  );

  // Row Actions (Standard Context Menu & Row Action items following /standardize-table)
  const getRowActions = useCallback(
    (row: OperatingExpenseItem): ActionDropdownItem[] => [
      {
        groupLabel: t("groupTraCuu", "TRA CỨU"),
        items: [
          {
            label: t("actionView", "Xem chi tiết"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () => openDetail(row, "view"),
          },
        ],
      },
      {
        groupLabel: t("groupThaoTac", "THAO TÁC"),
        items: [
          {
            label: t("actionEdit", "Chỉnh sửa"),
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => openDetail(row, "edit"),
          },
          {
            label: t("actionDuplicate", "Nhân đôi"),
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(row),
          },
          {
            label: t("actionDelete", "Xóa"),
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
  const totalAmountSum = useMemo(() => {
    if (listHook.totalAmountSum) return listHook.totalAmountSum;
    let amt = 0;
    for (const r of listHook.data) {
      amt += Number(r.totalAmount || r.amount) || 0;
    }
    return amt;
  }, [listHook.data, listHook.totalAmountSum]);

  // Toolbar Quick Filter PillTabs Items
  const pillTabItems: PillTabItem<CostGroupFilter>[] = useMemo(
    () => [
      { value: "ALL", label: t("tabs.all", "Tất cả") },
      { value: "OPEX", label: t("tabs.opex", "CP Vận hành") },
      { value: "COGS", label: t("tabs.cogs", "Giá vốn (COGS)") },
      { value: "COMMISSION", label: t("tabs.commission", "Hoa hồng") },
    ],
    [t],
  );

  return (
    <>
      <SpreadsheetPageTemplate<OperatingExpenseItem>
        title={t("pageTitle", "Chi phí vận hành")}
        desc={t(
          "pageDesc",
          "Quản lý các khoản chi phí vận hành, chi phí định kỳ và dự báo dòng tiền toàn công ty",
        )}
        icon={<Target className="w-5 h-5 text-primary" />}
        tableId="operating-expenses-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={listHook.isLoading}
        emptyLabel={t("emptyList", "Chưa có dữ liệu chi phí vận hành")}
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
        createLabel={t("createExpense", "Thêm khoản chi")}
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
          totalAmount: (
            <div className="flex flex-col items-end justify-center">
              <span className="font-semibold text-primary tabular-nums font-mono text-xs">
                {totalAmountSum.toLocaleString("vi-VN")} đ
              </span>
            </div>
          ),
        }}
      />

      {/* Drawer Create / View / Edit */}
      <BudgetDrawer
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
        title={t("confirmDeleteTitle", "Xác nhận xóa khoản chi")}
        message={
          itemToDelete
            ? `${t("confirmDeleteDesc", "Bạn có chắc chắn muốn xóa:")} ${itemToDelete.title || itemToDelete.expenseCategory} (${itemToDelete.period || `${itemToDelete.periodMonth}/${itemToDelete.periodYear}`} - ${(Number(itemToDelete.totalAmount || itemToDelete.amount) || 0).toLocaleString("vi-VN")} đ)?`
            : ""
        }
        confirmLabel={t("actionDelete", "Xóa")}
        cancelLabel={t("actionCancel", "Hủy")}
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

export default OpexPage;
