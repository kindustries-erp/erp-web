import { useMemo } from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import {
  operationalApi,
  type OperationalDocument,
  type OperationalVariant,
} from "@/modules/operational/api/operationalApi";
import { StatusBadge } from "@/shared/components/badges";
import { Badge } from "@/shared/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { type useTableColumnState } from "@/shared/hooks/useTableColumnState";

interface UsePurchaseColumnsOptions {
  variant: OperationalVariant;
  onOpenDetail?: (row: OperationalDocument) => void;
  tableState: ReturnType<typeof useTableColumnState>;
  fetchColumnOptions: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<any>;
}

function PoTooltipContent({ row }: { row: OperationalDocument }) {
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: [
      "operational-document",
      row.document_type || "purchase_orders",
      row.id,
    ],
    queryFn: () =>
      operationalApi.getDocument(
        (row.document_type || "purchase_orders") as any,
        row.id,
      ),
    enabled: !row.lines || row.lines.length === 0,
    staleTime: 5 * 60 * 1000,
  });

  const lines = row.lines?.length ? row.lines : data?.lines;

  if (isLoading && (!row.lines || row.lines.length === 0)) {
    return (
      <div className="text-xs text-muted-foreground">
        {t("Đang tải chi tiết...")}
      </div>
    );
  }

  if (!lines || lines.length === 0) {
    return <div className="text-xs">{t("Không có chi tiết dòng")}</div>;
  }

  return (
    <div className="flex flex-col gap-1 min-w-[200px] max-w-[350px] text-xs">
      <div className="font-semibold border-b border-border pb-1 mb-1 shrink-0">
        {t("Chi tiết PO")} ({lines.length} {t("dòng")})
      </div>
      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
        {lines.map((l: any, idx: number) => (
          <div key={l.id || idx} className="flex justify-between gap-3">
            <span
              className="truncate flex-1"
              title={l.item_name || l.description}
            >
              - {l.item_name || l.description || t("Không có tên")}
            </span>
            <span className="font-medium whitespace-nowrap shrink-0">
              {t("SL")}: {Number(l.qty || 0).toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook trả về columns chuẩn hóa cho bảng danh sách đơn mua hàng (variant="purchase").
 */
export function usePurchaseColumns({
  onOpenDetail,
  tableState,
  fetchColumnOptions,
}: UsePurchaseColumnsOptions): DataTableColumn<OperationalDocument>[] {
  const t = useT();

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        queryKeyPrefix: "po-column-options",
        fetchOptions: fetchColumnOptions,
      }),
    [tableState, fetchColumnOptions],
  );

  return useMemo<DataTableColumn<OperationalDocument>[]>(
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

      // 2. Cột Ngày đặt: headerFilter.date kèm DateRangeColumnSlot, TableDateCell căn phải
      {
        key: "order_date",
        header: headerFilter.date("orderDate", t("Ngày đặt")),
        sortKey: "order_date",
        size: 150,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => (
          <TableDateCell
            date={row.document_date}
            showTooltip={false}
            className="justify-end w-full"
          />
        ),
      },

      // 3. Cột Số PO: TableText + onDetailClick view mode + Quick status badge (DRAFT/CANCELLED)
      {
        key: "po_no",
        header: headerFilter("poNo", t("Số PO")),
        sortKey: "purchase_no",
        size: 200,
        enableResizing: true,
        className: "!py-2 align-middle font-medium text-left",
        headerClassName: "text-center",
        cell: (row) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={row.purchase_no || "—"}
              tooltip={<PoTooltipContent row={row} />}
              enableCopy={Boolean(row.purchase_no)}
              onDetailClick={
                row.purchase_no ? () => onOpenDetail?.(row) : undefined
              }
            />
            {row.status === "DRAFT" && (
              <Tooltip content={t("Nháp", "Draft")}>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
                >
                  {t("Nháp", "Draft")}
                </Badge>
              </Tooltip>
            )}
            {row.status === "CANCELLED" && (
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

      // 4. Cột Nhà cung cấp: Tooltip + text-left
      {
        key: "supplier",
        header: headerFilter("supplierNameSnapshot", t("Nhà cung cấp")),
        sortKey: "supplier_id",
        size: 250,
        enableResizing: true,
        className: "!py-2 align-middle text-left w-full",
        headerClassName: "text-center w-full",
        cell: (row) => (
          <Tooltip content={row.supplier_name_snapshot || "—"}>
            <div className="w-full text-left whitespace-normal break-words cursor-pointer line-clamp-2">
              {row.supplier_name_snapshot || "—"}
            </div>
          </Tooltip>
        ),
      },

      // 5. Cột Số lượng: headerFilter.qty format có phân tách hàng nghìn
      {
        key: "total_qty",
        header: headerFilter.qty("totalQty", t("Số lượng")),
        size: 120,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => {
          const qty =
            row.lines?.reduce(
              (sum, line: any) =>
                sum + Number(line.qty || line.qtyOrdered || 0),
              0,
            ) || 0;
          return (
            <span className="tabular-nums font-medium">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },

      // 6. Cột Trạng thái kho: StatusBadge fixed width w-[88px] + Tooltip + i18n filterOptions
      {
        key: "inventory_status",
        header: headerFilter("inventoryStatus", t("common.inventoryStatus"), {
          filterOptions: [
            { value: "NOT_RECEIVED", label: t("Chưa nhập") },
            { value: "PARTIAL_RECEIVED", label: t("Nhập một phần") },
            { value: "RECEIVED", label: t("Đã nhập") },
          ],
        }),
        sortKey: "status",
        size: 140,
        enableResizing: true,
        className: "!py-2 align-middle text-center",
        headerClassName: "text-center",
        cell: (row: OperationalDocument) => {
          const st = row.inventory_status || "NOT_RECEIVED";
          let label = t("Chưa nhập");
          if (st === "RECEIVED" || st === "DONE") {
            label = t("Đã nhập");
          } else if (st === "PARTIAL_RECEIVED" || st === "PARTIAL") {
            label = t("Nhập một phần");
          }
          return (
            <div className="w-full flex justify-center">
              <Tooltip content={label}>
                <StatusBadge
                  status={st}
                  className="w-[88px] inline-flex items-center justify-center text-center truncate"
                />
              </Tooltip>
            </div>
          );
        },
      },

      // 7. Cột Trạng thái PO: StatusBadge fixed width w-[88px] + Tooltip + i18n filterOptions
      {
        key: "status",
        header: headerFilter("status", t("Trạng thái"), {
          filterOptions: [
            { value: "DRAFT", label: t("Nháp", "Draft") },
            { value: "CONFIRMED", label: t("Đã xác nhận", "Confirmed") },
            { value: "CANCELLED", label: t("Đã hủy", "Cancelled") },
          ],
        }),
        sortKey: "status",
        size: 140,
        enableResizing: true,
        className: "!py-2 align-middle text-center",
        headerClassName: "text-center",
        cell: (row) => {
          let displayStatus = "CONFIRMED";
          if (row.status === "DRAFT") displayStatus = "DRAFT";
          else if (row.status === "CANCELLED") displayStatus = "CANCELLED";

          return (
            <div className="w-full flex justify-center">
              <Tooltip content={t(displayStatus)}>
                <StatusBadge
                  status={displayStatus}
                  className="w-[88px] inline-flex items-center justify-center text-center truncate"
                />
              </Tooltip>
            </div>
          );
        },
      },

      // 8. Cột Ngày nhập DK: headerFilter.date
      {
        key: "expected_date",
        header: headerFilter.date("expectedDate", t("Ngày nhập DK")),
        sortKey: "expected_date",
        size: 150,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => (
          <TableDateCell
            date={row.due_date}
            showTooltip={false}
            format="date"
            className="justify-end w-full"
          />
        ),
      },

      // 9. Cột Ghi chú: headerFilter với showBlankOption
      {
        key: "notes",
        header: headerFilter("remarks", t("Ghi chú"), {
          showBlankOption: true,
        }),
        size: 220,
        enableResizing: true,
        className: "!py-2 align-middle text-left w-full",
        headerClassName: "text-center w-full",
        cell: (row) => (
          <Tooltip content={row.notes || "—"}>
            <div className="w-full text-left whitespace-normal break-words cursor-pointer line-clamp-2">
              {row.notes || "—"}
            </div>
          </Tooltip>
        ),
      },
    ],
    [headerFilter, onOpenDetail, t],
  );
}
