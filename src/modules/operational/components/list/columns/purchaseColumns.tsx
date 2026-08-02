import { useMemo } from "react";
import {
  ChevronRight,
  PackageCheck,
  PackageOpen,
  PackageX,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { normalizeDateTime } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { Button } from "@/shared/components/ui/Button";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import {
  operationalApi,
  type OperationalDocument,
  type OperationalVariant,
} from "@/modules/operational/api/operationalApi";
import { StatusBadge } from "@/shared/components/badges";
import { useQuery } from "@tanstack/react-query";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { type useTableColumnState } from "@/shared/hooks/useTableColumnState";

interface UsePurchaseColumnsOptions {
  variant: OperationalVariant;
  expandedRowIds: Record<string, boolean>;
  onToggleExpand: (key: string) => void;
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
        Chi tiết PO ({lines.length} dòng)
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
              SL: {Number(l.qty || 0).toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook trả về columns cho bảng danh sách đơn mua hàng (variant="purchase").
 * Extracted từ OperationalListPage.tsx (dòng 1365–1477).
 */
export function usePurchaseColumns({
  variant,
  expandedRowIds,
  onToggleExpand,
  onOpenDetail,
  tableState,
  fetchColumnOptions,
}: UsePurchaseColumnsOptions): DataTableColumn<OperationalDocument>[] {
  const t = useT();

  const getSortState = (key: string) => {
    if (tableState.sorts.includes(key)) return "asc";
    if (tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    tableState.setSort(key, state);
  };
  const handleSearchChange = (key: string, val: string) => {
    tableState.setColumnSearch(key, val);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    tableState.setColumnFilter(key, vals);
  };

  return useMemo<DataTableColumn<OperationalDocument>[]>(
    () => [
      {
        key: "__expand",
        header: "",
        className:
          "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center align-middle",
        headerClassName: "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center",
        size: 40,
        enableResizing: false,
        cell: (row) => {
          const rowKey = `${row.document_type || variant}-${row.id}`;
          const isExpanded = !!expandedRowIds[rowKey];
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(rowKey);
              }}
              className="w-full flex items-center justify-center"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform text-[color:var(--muted-fg)] shrink-0",
                  isExpanded && "rotate-90",
                )}
              />
            </Button>
          );
        },
      },
      {
        key: "order_date",
        header: (
          <TableColumnHeaderFilter
            columnKey="orderDate"
            sortState={getSortState("orderDate")}
            onSortChange={(state) => handleSortChange("orderDate", state)}
            searchValue={tableState.columnSearch["orderDate"] || ""}
            onSearchChange={(val) => handleSearchChange("orderDate", val)}
            selectedFilters={tableState.columnFilters["orderDate"] || []}
            onFilterChange={(vals) => handleFilterChange("orderDate", vals)}
            allFilters={tableState.columnFilters}
            title={t("Ngày đặt")}
            fetchOptions={fetchColumnOptions}
          />
        ),
        sortable: true,
        sortKey: "order_date",
        size: 120,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => {
          const dt = normalizeDateTime(row.document_date);
          if (!dt || dt === "—") return "—";
          const [d] = dt.split(" ");
          return (
            <Tooltip content={dt}>
              <span className="cursor-default block w-full text-right">
                {d}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "expected_date",
        header: (
          <TableColumnHeaderFilter
            columnKey="expectedDate"
            sortState={getSortState("expectedDate")}
            onSortChange={(state) => handleSortChange("expectedDate", state)}
            searchValue={tableState.columnSearch["expectedDate"] || ""}
            onSearchChange={(val) => handleSearchChange("expectedDate", val)}
            selectedFilters={tableState.columnFilters["expectedDate"] || []}
            onFilterChange={(vals) => handleFilterChange("expectedDate", vals)}
            allFilters={tableState.columnFilters}
            title={t("Ngày nhập DK")}
            fetchOptions={fetchColumnOptions}
          />
        ),
        sortable: true,
        sortKey: "expected_date",
        size: 120,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => {
          const dt = normalizeDateTime(row.due_date);
          if (!dt || dt === "—") return "—";
          const [d] = dt.split(" ");
          return (
            <Tooltip content={dt}>
              <span className="cursor-default block w-full text-right">
                {d}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "po_no",
        header: t("Số PO"),
        sortable: true,
        sortKey: "purchase_no",
        size: 150,
        enableResizing: true,
        className: "!py-2 align-middle font-medium text-left",
        headerClassName: "text-center",
        cell: (row) => {
          return (
            <TableText
              text={row.purchase_no || "—"}
              tooltip={<PoTooltipContent row={row} />}
              enableCopy={Boolean(row.purchase_no)}
              onDrawerClick={
                row.purchase_no ? () => onOpenDetail?.(row) : undefined
              }
            />
          );
        },
      },
      {
        key: "supplier",
        header: t("Nhà cung cấp"),
        sortable: true,
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
      {
        key: "total_qty",
        header: t("Số lượng"),
        size: 100,
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
          return qty.toLocaleString("vi-VN");
        },
      },
      {
        key: "inventory_status",
        header: t("common.inventoryStatus"),
        size: 100,
        enableResizing: true,
        className: "!py-2 align-middle text-center",
        headerClassName: "text-center",
        cell: (row: OperationalDocument) => {
          const st = row.inventory_status || "NOT_RECEIVED";
          let icon = <PackageX className="h-5 w-5 text-muted-foreground" />;
          let label = "Chưa nhập";
          if (st === "RECEIVED" || st === "DONE") {
            icon = <PackageCheck className="h-5 w-5 text-emerald-500" />;
            label = "Đã nhập";
          } else if (st === "PARTIAL_RECEIVED" || st === "PARTIAL") {
            icon = <PackageOpen className="h-5 w-5 text-amber-500" />;
            label = "Nhập một phần";
          }
          return (
            <div className="w-full flex justify-center">
              <Tooltip content={label}>
                <div className="cursor-pointer">{icon}</div>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("Trạng thái"),
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
              <StatusBadge
                status={displayStatus}
                className="w-[75px] inline-block text-center"
              />
            </div>
          );
        },
      },
      {
        key: "notes",
        header: t("Ghi chú"),
        size: 250,
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
    [expandedRowIds, onToggleExpand, onOpenDetail, t, variant],
  );
}
