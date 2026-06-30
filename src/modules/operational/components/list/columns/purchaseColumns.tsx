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
import type { DataTableColumn } from "@/shared/components/DataTable";
import type {
  OperationalDocument,
  OperationalVariant,
} from "@/modules/operational/api/operationalApi";
import { StatusBadge } from "@/shared/components/badges";

interface UsePurchaseColumnsOptions {
  variant: OperationalVariant;
  expandedRowIds: Record<string, boolean>;
  onToggleExpand: (key: string) => void;
}

/**
 * Hook trả về columns cho bảng danh sách đơn mua hàng (variant="purchase").
 * Extracted từ OperationalListPage.tsx (dòng 1365–1477).
 */
export function usePurchaseColumns({
  variant,
  expandedRowIds,
  onToggleExpand,
}: UsePurchaseColumnsOptions): DataTableColumn<OperationalDocument>[] {
  const t = useT();
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(rowKey);
              }}
              className="focus:outline-none flex items-center justify-center w-full"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform text-[color:var(--muted-fg)] shrink-0",
                  isExpanded && "rotate-90",
                )}
              />
            </button>
          );
        },
      },
      {
        key: "po_no",
        header: t("Số PO"),
        sortable: true,
        sortKey: "purchase_no",
        size: 140,
        enableResizing: true,
        className: "!py-2 align-middle font-medium text-left",
        headerClassName: "text-center",
        cell: (row) => {
          return (
            <div className="flex items-center gap-1.5 text-left text-sm max-w-[120px]">
              <Tooltip content={row.notes || t("Không có ghi chú")}>
                <span className="font-semibold text-primary truncate">
                  {row.purchase_no || "—"}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "supplier",
        header: t("Nhà cung cấp"),
        sortable: true,
        sortKey: "supplier_id",
        size: 140,
        enableResizing: true,
        className: "!py-2 align-middle text-left w-full",
        headerClassName: "text-center w-full",
        cell: (row) => (
          <Tooltip content={row.supplier_name_snapshot || "—"}>
            <div className="w-full text-left truncate">
              {row.supplier_name_snapshot || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "order_date",
        header: t("Ngày đặt"),
        sortable: true,
        sortKey: "order_date",
        size: 140,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => {
          const dt = normalizeDateTime(row.document_date);
          if (!dt || dt === "—") return "—";
          const [d] = dt.split(" ");
          return (
            <Tooltip content={dt}>
              <span className="font-semibold cursor-default block w-full text-right">
                {d}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "expected_date",
        header: t("Ngày nhập DK"),
        sortable: true,
        sortKey: "expected_date",
        size: 140,
        enableResizing: true,
        className: "!py-2 align-middle text-right",
        headerClassName: "text-center",
        cell: (row) => {
          const dt = normalizeDateTime(row.due_date);
          if (!dt || dt === "—") return "—";
          const [d] = dt.split(" ");
          return (
            <Tooltip content={dt}>
              <span className="font-semibold cursor-default block w-full text-right">
                {d}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "inventory_status",
        header: t("common.inventoryStatus"),
        size: 140,
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
    ],
    [expandedRowIds, onToggleExpand, t, variant],
  );
}
