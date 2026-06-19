import { useMemo } from "react";
import { ChevronRight, Warehouse } from "lucide-react";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { normalizeDateTime } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type {
  OperationalDocument,
  OperationalVariant,
} from "@/modules/operational/api/operationalApi";

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
        key: "po_no",
        header: t("Số PO"),
        sortable: true,
        sortKey: "purchase_no",
        className: "align-top font-medium",
        headerClassName: "min-w-[160px]",
        cell: (row) => {
          const rowKey = `${row.document_type || variant}-${row.id}`;
          const isExpanded = !!expandedRowIds[rowKey];
          return (
            <div className="flex flex-col items-start gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(rowKey);
                }}
                className="font-medium text-primary hover:underline focus:outline-none flex items-center gap-1.5 text-left text-sm"
              >
                <span className="font-semibold text-primary">
                  {row.purchase_no || "—"}
                </span>
                {row.inventory_status &&
                  row.inventory_status !== "NOT_RECEIVED" && (
                    <Tooltip content={t("Có lịch sử nhập kho")}>
                      <div className="flex items-center text-muted-foreground/80 cursor-help">
                        <Warehouse className="w-3 h-3" />
                      </div>
                    </Tooltip>
                  )}
                {row.status === "DRAFT" && (
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 whitespace-nowrap">
                    {t("Nháp")}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform text-[color:var(--muted-fg)] shrink-0",
                    isExpanded && "rotate-90 text-primary",
                  )}
                />
              </button>
            </div>
          );
        },
      },
      {
        key: "supplier",
        header: t("Nhà cung cấp"),
        sortable: true,
        sortKey: "supplier_id",
        className: "align-top",
        headerClassName: "min-w-[150px]",
        cell: (row) => (
          <div className="space-y-0.5">
            <div>{row.supplier_name_snapshot || "—"}</div>
          </div>
        ),
      },
      {
        key: "order_date",
        header: t("Ngày đặt"),
        sortable: true,
        sortKey: "order_date",
        className: "align-top",
        headerClassName: "min-w-[150px]",
        cell: (row) => {
          const dt = normalizeDateTime(row.document_date);
          if (!dt || dt === "—") return "—";
          const [d, time] = dt.split(" ");
          if (!time) return <span className="font-semibold">{d}</span>;
          return (
            <div className="flex flex-col">
              <span className="font-semibold">{d}</span>
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
          );
        },
      },
      {
        key: "expected_date",
        header: t("Ngày nhập DK"),
        sortable: true,
        sortKey: "expected_date",
        className: "align-top",
        headerClassName: "min-w-[150px]",
        cell: (row) => {
          const dt = normalizeDateTime(row.due_date);
          if (!dt || dt === "—") return "—";
          const [d, time] = dt.split(" ");
          if (!time) return <span className="font-semibold">{d}</span>;
          return (
            <div className="flex flex-col">
              <span className="font-semibold">{d}</span>
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
          );
        },
      },
    ],
    [expandedRowIds, onToggleExpand, t, variant],
  );
}
