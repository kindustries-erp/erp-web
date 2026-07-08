import { useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  PackagePlus,
  PackageMinus,
  History,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { fmtQty, formatGMT7 } from "@/shared/utils/format";
import type {
  InventoryMovementsPayload,
  InventoryMovement,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { Tooltip } from "@/core/components/ui/Tooltip";

interface InventoryTimelineBlockProps {
  itemId: string;
  loadingId: string | null;
  error: string | null;
  data?: InventoryMovementsPayload;
  onOpenDocument?: (docId: string, docType: string) => void;
}

/**
 * Block hiển thị lịch sử xuất nhập kho theo timeline cho 1 item.
 * Extracted từ OperationalListPage.tsx (dòng 142–262).
 */
export function InventoryTimelineBlock({
  itemId,
  loadingId,
  error,
  data,
  onOpenDocument,
}: InventoryTimelineBlockProps) {
  const t = useT();
  const isLoading = loadingId === itemId;

  const movements = data?.movements;
  const sortedMovements = useMemo(() => {
    if (!movements) return [];
    return [...movements].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [movements]);

  const timelineColumns: DataTableColumn<InventoryMovement>[] = useMemo(
    () => [
      {
        key: "time",
        header: t("inventory.history.time"),
        headerClassName: "text-center",
        className: "text-right",
        size: 120,
        cell: (m) => {
          if (!m.createdAt) return "—";
          return (
            <div className="w-full text-right">
              <Tooltip
                content={formatGMT7(m.createdAt, "datetime-sec")}
                side="top"
              >
                <span className="cursor-help inline-block border-b border-dotted border-gray-400 text-xs">
                  {formatGMT7(m.createdAt, "date")}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: "type",
        header: t("Loại"),
        headerClassName: "text-center",
        className: "text-center",
        size: 120,
        cell: (m) => {
          const isIn = Number(m.qtyIn || 0) > 0;
          return (
            <div className="flex justify-center items-center">
              <span
                title={isIn ? t("Nhập kho") : t("Xuất kho")}
                className="flex-shrink-0"
              >
                {isIn ? (
                  <PackagePlus className="h-4 w-4 text-emerald-600" />
                ) : (
                  <PackageMinus className="h-4 w-4 text-orange-600" />
                )}
              </span>
            </div>
          );
        },
      },
      {
        key: "documentNo",
        header: t("Số phiếu"),
        headerClassName: "text-center",
        className: "text-center",
        size: 150,
        cell: (m) => {
          if (!m.documentNo) return "—";
          return (
            <span
              className={`truncate text-xs font-mono ${
                m.documentId && m.documentType
                  ? "text-blue-600 hover:underline cursor-pointer"
                  : "text-muted-foreground"
              }`}
              onClick={() => {
                if (m.documentId && m.documentType && onOpenDocument) {
                  onOpenDocument(m.documentId, m.documentType);
                }
              }}
            >
              {m.documentNo}
            </span>
          );
        },
      },
      {
        key: "notes",
        header: t("Ghi chú"),
        headerClassName: "text-center",
        className: "text-left",
        size: 250,
        cell: (m) => {
          if (!m.notes) return null;
          return (
            <Tooltip content={m.notes} side="top">
              <span className="inline-block max-w-[250px] truncate text-xs text-muted-foreground cursor-help">
                {m.notes}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "change",
        header: t("inventory.history.change"),
        headerClassName: "text-center",
        className: "text-right",
        size: 120,
        cell: (m) => {
          const isIn = Number(m.qtyIn || 0) > 0;
          const qty = isIn ? m.qtyIn : m.qtyOut;
          return (
            <div
              className={
                isIn
                  ? "font-medium text-emerald-600 text-xs sm:text-sm w-full text-right"
                  : "font-medium text-amber-600 text-xs sm:text-sm w-full text-right"
              }
            >
              {isIn ? "+" : "-"}
              {fmtQty(qty)}
            </div>
          );
        },
      },
      {
        key: "balance",
        header: t("inventory.history.balance"),
        headerClassName: "text-center",
        className: "text-right",
        size: 120,
        cell: (m) => (
          <div className="font-medium text-foreground text-xs sm:text-sm w-full text-right">
            {fmtQty(m.balanceAfter)}
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-6 sm:p-8 flex items-center justify-center text-sm text-muted-foreground my-2 shadow-sm border border-border">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("inventory.history.loading")}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-6 flex items-center justify-center text-sm text-red-700 my-2 shadow-sm">
        <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="py-2 px-1">
      <div className="mb-3 font-semibold text-sm sm:text-base text-foreground pl-1 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        {t("inventory.history.title")}
      </div>
      <StandardTable
        tableId={`timeline-table-${itemId}`}
        items={sortedMovements}
        columns={timelineColumns}
        getRowKey={(row) => row.id}
        variant="spreadsheet"
        enableColumnResizing={true}
        enableRowSelection={false}
        enableColumnVisibility={false}
        emptyLabel={t("inventory.history.empty")}
        minWidth={600}
        containerClassName="max-h-[200px] overflow-y-auto"
      />
    </div>
  );
}
