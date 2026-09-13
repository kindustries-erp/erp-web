import { useMemo } from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { StatusBadge } from "@/shared/components/badges";
import { Badge } from "@/shared/components/ui/badge";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "../api/salesOrdersCoreApi";
import { DeliveryDetailPopover } from "../components/DeliveryDetailPopover";
import { type useTableColumnState } from "@/shared/hooks/useTableColumnState";

interface UseSalesOrderColumnsOptions {
  tableState: ReturnType<typeof useTableColumnState>;
  onOpenDetail?: (item: ErpSalesOrder, mode?: "view" | "edit") => void;
}

export function useSalesOrderColumns({
  tableState,
  onOpenDetail,
}: UseSalesOrderColumnsOptions): DataTableColumn<ErpSalesOrder>[] {
  const t = useT();

  const fetchSalesOrdersColumnOptions = async (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const filtersStr =
      Object.keys(tableState.columnFilters).length > 0
        ? JSON.stringify(tableState.columnFilters)
        : undefined;

    const res = await salesOrdersCoreApi.getColumnOptions(
      params.columnKey,
      params.search,
      params.pageParam || 1,
      20,
      filtersStr,
    );
    return {
      items: res.items.map((i: string) => ({ value: i, label: i })),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
    };
  };

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        queryKeyPrefix: "sales-orders-options",
        fetchOptions: fetchSalesOrdersColumnOptions,
      }),
    [tableState],
  );

  return useMemo<DataTableColumn<ErpSalesOrder>[]>(
    () => [
      // 1. Cột STT: 40px, căn giữa tuyệt đối cả Header và Cell, 1-based index
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },

      // 2. Cột Mã SO: TableText + onDetailClick view mode + Quick status badge (DRAFT/CANCELLED)
      {
        key: "soNo",
        header: headerFilter("soNo", t("Số SO")),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        cell: (item) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={item.soNo || "—"}
              tooltip={item.soNo || false}
              enableCopy={Boolean(item.soNo)}
              onDetailClick={
                item.soNo ? () => onOpenDetail?.(item, "view") : undefined
              }
            />
            {item.status === "DRAFT" && (
              <Tooltip content={t("Nháp", "Draft")}>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("Nháp", "Draft")}
                </Badge>
              </Tooltip>
            )}
            {item.status === "CANCELLED" && (
              <Tooltip content={t("Hủy", "Canceled")}>
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("Hủy", "Canceled")}
                </Badge>
              </Tooltip>
            )}
          </div>
        ),
      },

      // 3. Cột Khách hàng: headerFilter + Tooltip
      {
        key: "customerName",
        header: headerFilter("customerName", t("Khách hàng")),
        size: 220,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item) => {
          const text = item.customerName || item.customerId || "—";
          return (
            <Tooltip content={text !== "—" ? text : ""}>
              <div className="whitespace-normal break-words w-full cursor-pointer line-clamp-2">
                {text}
              </div>
            </Tooltip>
          );
        },
      },

      // 4. Cột Số lượng: headerFilter.qty format có phân tách hàng nghìn
      {
        key: "totalQty",
        header: headerFilter.qty("totalQty", t("Số lượng")),
        size: 110,
        enableResizing: true,
        className: "text-right",
        headerClassName: "text-center",
        cell: (item) => {
          const qty =
            item.lines?.reduce(
              (sum, line) => sum + Number(line.qtyOrdered || 0),
              0,
            ) || 0;
          return (
            <span className="tabular-nums font-medium">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },

      // 5. Cột Ngày đặt: headerFilter.date kèm DateRangeColumnSlot, TableDateCell căn phải
      {
        key: "orderDate",
        header: headerFilter.date("orderDate", t("Ngày đặt")),
        size: 150,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right",
        cell: (item) => (
          <TableDateCell
            date={item.orderDate}
            showTooltip={false}
            className="justify-end w-full"
          />
        ),
      },

      // 6. Cột Ngày giao DK: headerFilter.date, TableDateCell căn phải
      {
        key: "expectedDeliveryDate",
        header: headerFilter.date("expectedDeliveryDate", t("Ngày giao DK")),
        size: 150,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-right",
        cell: (item) => (
          <TableDateCell
            date={item.expectedDeliveryDate}
            showTooltip={false}
            className="justify-end w-full"
          />
        ),
      },

      // 7. Cột Ngày đã giao: headerFilter.date, DeliveryDetailPopover
      {
        key: "deliveredDate",
        header: headerFilter.date("deliveredDate", t("Ngày đã giao")),
        size: 150,
        enableResizing: true,
        className: "text-center",
        headerClassName: "text-center",
        cell: (item: any) => {
          if (
            item.status === "DELIVERED" ||
            item.status === "PARTIAL_DELIVERED" ||
            item.deliveredDate
          ) {
            return <DeliveryDetailPopover item={item} />;
          }
          return "—";
        },
      },

      // 8. Cột Trạng thái: StatusBadge fixed width w-[88px] + Tooltip + i18n filterOptions
      {
        key: "status",
        header: headerFilter("status", t("Trạng thái"), {
          filterOptions: [
            { value: "DRAFT", label: t("Nháp", "Draft") },
            { value: "CONFIRMED", label: t("Đã xác nhận", "Confirmed") },
            { value: "DELIVERED", label: t("Đã giao", "Delivered") },
            {
              value: "PARTIAL_DELIVERED",
              label: t("Giao một phần", "Partially Delivered"),
            },
            { value: "CANCELLED", label: t("Đã hủy", "Cancelled") },
          ],
        }),
        size: 130,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-center",
        cell: (item) => (
          <div className="w-full flex justify-center">
            <Tooltip content={t(item.status || "")}>
              <StatusBadge
                status={item.status || ""}
                className="w-[88px] inline-flex items-center justify-center text-center truncate"
              />
            </Tooltip>
          </div>
        ),
      },

      // 9. Cột Ghi chú: headerFilter với showBlankOption
      {
        key: "remarks",
        header: headerFilter("remarks", t("Ghi chú"), {
          showBlankOption: true,
        }),
        size: 200,
        enableResizing: true,
        headerClassName: "text-center",
        className: "text-left",
        cell: (item) => {
          const text = item.remarks || "—";
          return (
            <Tooltip content={text !== "—" ? text : ""}>
              <div className="whitespace-normal break-words w-full cursor-pointer line-clamp-2">
                {text}
              </div>
            </Tooltip>
          );
        },
      },
    ],
    [headerFilter, onOpenDetail, t],
  );
}
