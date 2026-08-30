import React, { useState, useMemo, useCallback } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Target, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useOperatingExpensesList } from "../modules/budget/hooks/useOperatingExpensesList";
import {
  budgetApi,
  type OperatingExpenseItem,
} from "../modules/budget/api/budgetApi";
import { BudgetDrawer } from "../modules/budget/components/BudgetDrawer";

export function BudgetPage() {
  const { t } = useTranslation("budget");
  const listHook = useOperatingExpensesList();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<OperatingExpenseItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<"create" | "view" | "edit">(
    "create",
  );
  const [deleteTarget, setDeleteTarget] = useState<OperatingExpenseItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = useCallback(() => {
    setSelectedExpense(null);
    setDrawerMode("create");
    setIsDrawerOpen(true);
  }, []);

  const openDetail = useCallback(
    (item: OperatingExpenseItem, mode: "view" | "edit" = "view") => {
      setSelectedExpense(item);
      setDrawerMode(mode);
      setIsDrawerOpen(true);
    },
    [],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await budgetApi.deleteExpense(deleteTarget.id);
      toast.success(t("deleteSuccess", "Đã xóa khoản chi thành công"));
      setDeleteTarget(null);
      listHook.refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          t("deleteError", "Xóa khoản chi thất bại"),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper Header Filter Builder (Server-side)
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "operating-expenses-column-options",
        fetchOptions: budgetApi.getColumnOptions,
      }),
    [listHook],
  );

  // DataTable Columns Configuration
  const columns: DataTableColumn<OperatingExpenseItem>[] = useMemo(
    () => [
      // 1. Cột STT: 40px, căn giữa tuyệt đối, 1-based index
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: OperatingExpenseItem, idx: number) => (
          <span className="w-full block text-center font-medium text-muted-foreground">
            {idx}
          </span>
        ),
      },

      // 2. Cột Mã chi phí: TableText + onDetailClick view mode + Badge trạng thái nháp
      {
        key: "expenseNo",
        size: 170,
        enableResizing: true,
        header: headerFilter("expenseNo", t("colDocNo", "Mã chi phí")),
        cell: (row) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0 font-medium"
              text={row.expenseNo}
              enableCopy
              tooltip
              onDetailClick={() => openDetail(row, "view")}
            />
            {row.status === "DRAFT" && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 ml-auto w-[48px] inline-flex items-center justify-center truncate"
              >
                {t("statusDraft", "Nháp")}
              </Badge>
            )}
          </div>
        ),
      },

      // 3. Cột Nội dung / Tiêu đề: TableText tooltip
      {
        key: "title",
        size: 220,
        enableResizing: true,
        header: headerFilter("title", t("colTitle", "Nội dung")),
        cell: (row) => (
          <TableText
            className="w-full"
            text={row.title || "—"}
            tooltip
            onDetailClick={() => openDetail(row, "view")}
          />
        ),
      },

      // 4. Cột Danh mục: Badge / Text
      {
        key: "expenseCategory",
        size: 160,
        enableResizing: true,
        header: headerFilter("expenseCategory", t("colCategory", "Danh mục"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <span className="truncate block font-medium text-foreground">
            {row.expenseCategory || "—"}
          </span>
        ),
      },

      // 5. Cột Chu kỳ: Badge fixed width + formatOptionLabel
      {
        key: "recurrenceType",
        size: 130,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        header: headerFilter("recurrenceType", t("colCycle", "Chu kỳ"), {
          formatOptionLabel: (val) => {
            if (val === "MONTHLY") return t("cycleMonthly", "Hàng tháng");
            if (val === "QUARTERLY") return t("cycleQuarterly", "Hàng quý");
            if (val === "YEARLY") return t("cycleYearly", "Hàng năm");
            if (val === "ONE_TIME") return t("cycleOneTime", "Một lần");
            return val;
          },
        }),
        cell: (row) => {
          const cycleLabel =
            row.recurrenceType === "MONTHLY"
              ? t("cycleMonthly", "Hàng tháng")
              : row.recurrenceType === "QUARTERLY"
                ? t("cycleQuarterly", "Hàng quý")
                : row.recurrenceType === "YEARLY"
                  ? t("cycleYearly", "Hàng năm")
                  : t("cycleOneTime", "Một lần");
          return (
            <div className="w-full flex justify-center">
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 whitespace-nowrap bg-muted/40"
              >
                {row.recurrenceInterval && row.recurrenceInterval > 1
                  ? `${row.recurrenceInterval} ${cycleLabel}`
                  : cycleLabel}
              </Badge>
            </div>
          );
        },
      },

      // 6. Cột Ngày phát sinh: TableDateCell căn phải
      {
        key: "documentDate",
        size: 130,
        enableResizing: true,
        className: "text-right",
        headerClassName: "text-right",
        header: headerFilter.date(
          "documentDate",
          t("colDocDate", "Ngày phát sinh"),
        ),
        cell: (row) => (
          <TableDateCell
            date={row.documentDate}
            className="justify-end w-full"
          />
        ),
      },

      // 7. Cột Hạn thanh toán: TableDateCell căn phải
      {
        key: "nextDueDate",
        size: 140,
        enableResizing: true,
        className: "text-right",
        headerClassName: "text-right",
        header: headerFilter.date(
          "nextDueDate",
          t("colNextDueDate", "Hạn thanh toán"),
        ),
        cell: (row) => (
          <TableDateCell
            date={row.nextDueDate}
            className="justify-end w-full"
          />
        ),
      },

      // 8. Cột Số tiền: headerFilter.amount + tabular-nums
      {
        key: "totalAmount",
        size: 160,
        enableResizing: true,
        className: "text-right",
        headerClassName: "text-right",
        header: headerFilter.amount("totalAmount", t("colAmount", "Số tiền")),
        cell: (row) => (
          <span className="tabular-nums font-semibold text-foreground">
            {(Number(row.totalAmount) || 0).toLocaleString("vi-VN")} đ
          </span>
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
            formatOptionLabel: (val) => {
              if (val === "PAID") return t("paymentPaid", "Đã thanh toán");
              if (val === "PARTIAL")
                return t("paymentPartial", "Thanh toán 1 phần");
              if (val === "UNPAID")
                return t("paymentUnpaid", "Chưa thanh toán");
              return val;
            },
          },
        ),
        cell: (row) => {
          const isPaid = row.paymentStatus === "PAID";
          const isPartial = row.paymentStatus === "PARTIAL";
          return (
            <div className="w-full flex justify-center">
              <Tooltip
                content={
                  isPaid
                    ? t("paymentPaid", "Đã thanh toán")
                    : isPartial
                      ? t("paymentPartial", "Thanh toán 1 phần")
                      : t("paymentUnpaid", "Chưa thanh toán")
                }
              >
                <Badge
                  variant={
                    isPaid ? "default" : isPartial ? "outline" : "secondary"
                  }
                  className="w-[88px] inline-flex items-center justify-center text-center truncate"
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

      // 10. Cột Trạng thái: Badge fixed width w-[88px] + formatOptionLabel
      {
        key: "status",
        size: 120,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        header: headerFilter("status", t("colStatus", "Trạng thái"), {
          formatOptionLabel: (val) => {
            if (val === "CONFIRMED") return t("statusConfirmed", "Đã xác nhận");
            if (val === "CANCELLED") return t("statusCancelled", "Đã hủy");
            if (val === "DRAFT") return t("statusDraft", "Nháp");
            return val;
          },
        }),
        cell: (row) => {
          const isConfirmed = row.status === "CONFIRMED";
          const isCancelled = row.status === "CANCELLED";
          return (
            <div className="w-full flex justify-center">
              <Tooltip
                content={
                  isConfirmed
                    ? t("statusConfirmed", "Đã xác nhận")
                    : isCancelled
                      ? t("statusCancelled", "Đã hủy")
                      : t("statusDraft", "Nháp")
                }
              >
                <Badge
                  variant={
                    isConfirmed
                      ? "default"
                      : isCancelled
                        ? "destructive"
                        : "secondary"
                  }
                  className="w-[88px] inline-flex items-center justify-center text-center truncate"
                >
                  {isConfirmed
                    ? t("statusConfirmed", "Đã xác nhận")
                    : isCancelled
                      ? t("statusCancelled", "Đã hủy")
                      : t("statusDraft", "Nháp")}
                </Badge>
              </Tooltip>
            </div>
          );
        },
      },

      // 11. Cột Ghi chú: showBlankOption
      {
        key: "notes",
        size: 180,
        enableResizing: true,
        header: headerFilter("notes", t("colNotes", "Ghi chú"), {
          showBlankOption: true,
        }),
        cell: (row) => (
          <span className="text-muted-foreground truncate block">
            {row.notes || "—"}
          </span>
        ),
      },
    ],
    [headerFilter, openDetail, listHook.page, listHook.pageSize, t],
  );

  // Row Actions (Xem chi tiết, Chỉnh sửa, Xóa)
  const getRowActions = useCallback(
    (row: OperatingExpenseItem) => [
      {
        groupLabel: "TRA CỨU",
        items: [
          {
            label: t("actionView", "Xem chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => openDetail(row, "view"),
          },
        ],
      },
      {
        groupLabel: "THAO TÁC",
        items: [
          {
            label: t("actionEdit", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => openDetail(row, "edit"),
          },
          {
            label: t("actionDelete", "Xóa"),
            icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />,
            variant: "danger" as const,
            onClick: () => setDeleteTarget(row),
          },
        ],
      },
    ],
    [openDetail, t],
  );

  // Summary Row calculation
  const summaryRow = useMemo(() => {
    return {
      index: <span className="font-bold block text-center">Σ</span>,
      expenseNo: (
        <span className="font-semibold text-xs">
          {listHook.total} {t("countSuffix", "khoản chi")}
        </span>
      ),
      totalAmount: (
        <span className="font-bold tabular-nums text-foreground">
          {(listHook.totalAmountSum || 0).toLocaleString("vi-VN")} đ
        </span>
      ),
    };
  }, [listHook.total, listHook.totalAmountSum, t]);

  return (
    <>
      <SpreadsheetPageTemplate<OperatingExpenseItem>
        title={t("pageTitle", "Chi phí vận hành")}
        desc={t(
          "pageDesc",
          "Quản lý các khoản chi phí vận hành, chi phí định kỳ và dự báo dòng tiền",
        )}
        icon={<Target className="w-4 h-4 text-primary" />}
        tableId="operating-expenses-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={listHook.isLoading}
        emptyLabel={t("emptyList", "Không có khoản chi phí nào.")}
        minWidth={1200}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => void listHook.refetch()}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        filterConfig={listHook.filterConfig}
        filter={listHook.filter}
        createActions={[
          {
            groupLabel: t("Thao tác", "Thao tác"),
            items: [
              {
                label: t("createExpense", "Thêm khoản chi"),
                icon: <Plus className="w-4 h-4 text-emerald-600" />,
                onClick: openCreate,
              },
            ],
          },
        ]}
        rowActions={getRowActions}
        summaryRow={summaryRow}
      />

      <BudgetDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedExpense(null);
        }}
        expenseData={selectedExpense}
        initialMode={drawerMode}
      />

      {deleteTarget && (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={t("confirmDeleteTitle", "Xác nhận xóa khoản chi")}
          message={t(
            "confirmDeleteDesc",
            "Bạn có chắc chắn muốn xóa khoản chi này không? Thao tác này không thể hoàn tác.",
          )}
          confirmLabel={t("actionDelete", "Xóa")}
          cancelLabel={t("actionCancel", "Hủy")}
          danger
          loading={isDeleting}
        />
      )}
    </>
  );
}
