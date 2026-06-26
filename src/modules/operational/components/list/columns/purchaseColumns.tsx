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
        size: 250,
        enableResizing: true,
        className: "!py-2 align-middle font-medium text-left",
        headerClassName: "text-center",
        cell: (row) => {
          return (
            <div className="flex items-center gap-1.5 text-left text-sm">
              <Tooltip content={row.notes || t("Không có ghi chú")}>
                <span className="font-semibold text-primary">
                  {row.purchase_no || "—"}
                </span>
              </Tooltip>
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
            </div>
          );
        },
      },
      {
        key: "supplier",
        header: t("Nhà cung cấp"),
        sortable: true,
        sortKey: "supplier_id",
        size: 400,
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
        size: 200,
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
        size: 200,
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
    ],
    [expandedRowIds, onToggleExpand, t, variant],
  );
}
