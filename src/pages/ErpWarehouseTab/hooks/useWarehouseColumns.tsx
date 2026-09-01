import React, { useMemo } from "react";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { fmtQty } from "@/shared/utils/format";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { StatusBadge } from "@/shared/components/badges";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import {
  warehouseVouchersCoreApi,
  type WarehouseRow,
} from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type { useInventoryVoucherDrawer } from "@/modules/inventory-core/hooks/useInventoryVoucherDrawer";

export interface UseWarehouseColumnsOptions {
  tableState: ReturnType<typeof useTableColumnState>;
  dateFrom?: string;
  dateTo?: string;
  setDateRange: (from?: string, to?: string) => void;
  setPage: (page: number) => void;
  unifiedDrawer: ReturnType<typeof useInventoryVoucherDrawer>;
  rows: WarehouseRow[];
}

export function useWarehouseColumns({
  tableState,
  dateFrom,
  dateTo,
  setDateRange,
  setPage,
  unifiedDrawer,
  rows,
}: UseWarehouseColumnsOptions) {
  const t = useT();
  const { grDrawer, giDrawer, iaDrawer } = unifiedDrawer;

  const fetchColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const res = await warehouseVouchersCoreApi.getColumnOptions(
      columnKey,
      search,
      pageParam,
      20,
      filtersStr,
      undefined,
    );
    return {
      items: res.items.map((i: string) => ({
        label: String(i),
        value: String(i),
      })),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
    };
  };

  const listHookLike = useMemo(
    () => ({
      sorts: tableState.sorts,
      setSort: (key: string, state: "asc" | "desc" | "none") => {
        tableState.setSort(key, state);
      },
      columnFilters: tableState.columnFilters,
      setColumnFilter: (key: string, vals: string[]) => {
        tableState.setColumnFilter(key, vals);
        setPage(1);
      },
      columnSearch: tableState.columnSearch,
      setColumnSearch: (key: string, val: string) => {
        tableState.setColumnSearch(key, val);
        setPage(1);
      },
      dateFrom,
      dateTo,
      setDateRange,
    }),
    [tableState, dateFrom, dateTo, setDateRange, setPage],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: listHookLike,
        queryKeyPrefix: "warehouse-vouchers-col-options",
        fetchOptions: fetchColumnOptions,
      }),
    [listHookLike],
  );

  const columns: DataTableColumn<WarehouseRow>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        hideable: false,
        sortable: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      {
        key: "date",
        header: headerFilter.date("date", t("table.date", "Ngày")),
        size: 130,
        enableResizing: true,
        className: "text-right",
        cell: (row) => (
          <TableDateCell date={row.createdAt} className="justify-end w-full" />
        ),
      },
      {
        key: "type",
        header: headerFilter("type", t("inventory.voucherType", "Loại phiếu"), {
          formatOptionLabel: (val: string) => {
            if (val === "receipt") return t("inventory.receipt", "Nhập kho");
            if (val === "issue") return t("inventory.issue", "Xuất kho");
            if (val === "adjustment")
              return t("inventory.adjustment", "Điều chỉnh");
            return val;
          },
        }),
        size: 130,
        enableResizing: true,
        className: "text-center",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          const typeMap: Record<string, { label: string; cls: string }> = {
            receipt: {
              label: t("inventory.receipt", "Nhập kho"),
              cls: "bg-emerald-100 text-emerald-700",
            },
            issue: {
              label: t("inventory.issue", "Xuất kho"),
              cls: "bg-orange-100 text-orange-700",
            },
            adjustment: {
              label: t("inventory.adjustment", "Điều chỉnh"),
              cls: "bg-blue-100 text-blue-700",
            },
          };
          const item = typeMap[row.type] ?? {
            label: row.type,
            cls: "bg-slate-100 text-slate-700",
          };
          return (
            <div className="w-full flex justify-center">
              <Tooltip content={item.label}>
                <span
                  className={cn(
                    "text-[11px] px-2 py-[3px] rounded-md font-semibold whitespace-nowrap w-[80px] inline-flex items-center justify-center text-center truncate",
                    item.cls,
                  )}
                >
                  {item.label}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "voucherNo",
        header: headerFilter("voucherNo", t("inventory.voucherNo", "Số phiếu")),
        size: 220,
        enableResizing: true,
        className: "font-mono text-sm text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={row.voucherNo || ""}
              onDetailClick={(e) => {
                e.stopPropagation();
                if (row.type === "receipt") {
                  grDrawer.openDetail(row.id);
                } else if (row.type === "issue") {
                  giDrawer.openDetail(row.id);
                } else if (row.type === "adjustment") {
                  iaDrawer.openDetail(row.id);
                }
              }}
              tooltip={true}
              enableCopy={true}
              textClassName="font-medium text-primary"
            />
            {row.status === "DRAFT" && (
              <Tooltip content={t("status.draft", "Nháp")}>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("status.draft", "Nháp")}
                </Badge>
              </Tooltip>
            )}
            {(row.status === "CANCELLED" || row.status === "CANCELED") && (
              <Tooltip content={t("status.cancelled", "Hủy")}>
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("status.cancelled", "Hủy")}
                </Badge>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        key: "qtyReceipt",
        header: headerFilter.qty(
          "qtyReceipt",
          t("inventory.qtyReceipt", "SL Nhập"),
        ),
        size: 150,
        enableResizing: true,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (row.type !== "receipt") return "";
          const qty = Number(row.totalQty);
          return isNaN(qty) ? (
            ""
          ) : (
            <span className="font-medium text-emerald-600 tabular-nums">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        key: "qtyIssue",
        header: headerFilter.qty(
          "qtyIssue",
          t("inventory.qtyIssue", "SL Xuất"),
        ),
        size: 150,
        enableResizing: true,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (row.type !== "issue") return "";
          const qty = Number(row.totalQty);
          return isNaN(qty) ? (
            ""
          ) : (
            <span className="font-medium text-orange-600 tabular-nums">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        key: "qtyAdjustment",
        header: headerFilter.qty(
          "qtyAdjustment",
          t("inventory.qtyAdjustment", "SL Điều chỉnh"),
        ),
        size: 150,
        enableResizing: true,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (row.type !== "adjustment") return "";
          const qty = Number(row.totalQty);
          if (isNaN(qty)) return "";

          const colorClass =
            qty > 0
              ? "text-emerald-600"
              : qty < 0
                ? "text-red-600"
                : "text-blue-600";
          return (
            <span className={cn("font-medium tabular-nums", colorClass)}>
              {qty > 0 ? "+" : ""}
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        key: "poNo",
        header: headerFilter("poNo", t("inventory.document", "Chứng từ"), {
          showBlankOption: true,
        }),
        size: 200,
        enableResizing: true,
        className: "font-mono text-sm text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (!row.poNo) return null;
          return (
            <TableText
              text={row.poNo}
              tooltip={row.poNo}
              enableCopy={true}
              textClassName="font-medium text-primary"
            />
          );
        },
      },
      {
        key: "partnerName",
        header: headerFilter("partnerName", t("common.partner", "Đối tác"), {
          showBlankOption: true,
        }),
        size: 200,
        enableResizing: true,
        className: "text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <Tooltip content={row.partnerName || ""}>
            <div className="whitespace-normal break-words w-full">
              {row.partnerName ?? ""}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "remarks",
        header: headerFilter("remarks", t("common.remarks", "Ghi chú"), {
          showBlankOption: true,
        }),
        size: 300,
        enableResizing: true,
        className: "text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <Tooltip content={row.remarks || ""}>
            <div className="whitespace-normal break-words w-full">
              {row.remarks ?? ""}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "status",
        header: headerFilter("status", t("common.status", "Trạng thái")),
        size: 150,
        enableResizing: true,
        className: "text-center",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <div className="w-full flex justify-center">
            <Tooltip content={t(row.status || "", row.status || "")}>
              <StatusBadge
                status={row.status || ""}
                className="w-[88px] inline-flex items-center justify-center text-center truncate"
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, headerFilter, grDrawer, giDrawer, iaDrawer],
  );

  const summaryRow = useMemo(() => {
    if (!rows || rows.length === 0) return undefined;
    const totalReceipt = rows
      .filter((r) => r.type === "receipt")
      .reduce((sum, r) => sum + Number(r.totalQty || 0), 0);
    const totalIssue = rows
      .filter((r) => r.type === "issue")
      .reduce((sum, r) => sum + Number(r.totalQty || 0), 0);
    const totalAdjustment = rows
      .filter((r) => r.type === "adjustment")
      .reduce((sum, r) => sum + Number(r.totalQty || 0), 0);

    return {
      voucherNo: (
        <div className="text-right w-full font-bold text-xs uppercase text-muted-foreground pr-2">
          {t("common.total", "Tổng cộng")}:
        </div>
      ),
      qtyReceipt: (
        <div className="text-right font-bold text-emerald-600 tabular-nums">
          {fmtQty(totalReceipt)}
        </div>
      ),
      qtyIssue: (
        <div className="text-right font-bold text-orange-600 tabular-nums">
          {fmtQty(totalIssue)}
        </div>
      ),
      qtyAdjustment: (
        <div
          className={cn(
            "text-right font-bold tabular-nums",
            totalAdjustment > 0
              ? "text-emerald-600"
              : totalAdjustment < 0
                ? "text-red-600"
                : "text-blue-600",
          )}
        >
          {totalAdjustment > 0 ? "+" : ""}
          {fmtQty(totalAdjustment)}
        </div>
      ),
    };
  }, [rows, t]);

  return {
    columns,
    summaryRow,
  };
}
