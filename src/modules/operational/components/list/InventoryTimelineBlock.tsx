import { useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useT } from "@/core/i18n";
import { normalizeDateTimeGMT7, fmtQty } from "@/shared/utils/format";
import { movementLabel } from "@/modules/operational/utils/operationalHelpers";
import type { InventoryMovementsPayload } from "@/modules/inventory-core/api/inventoryCoreApi";

interface InventoryTimelineBlockProps {
  itemId: string;
  loadingId: string | null;
  error: string | null;
  data?: InventoryMovementsPayload;
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
    <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-3 sm:p-4 md:p-6 overflow-x-auto my-2 shadow-sm border border-border">
      <div className="min-w-[560px]">
        <div className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base text-foreground">
          {t("inventory.history.title")}
        </div>
        {sortedMovements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            {t("inventory.history.empty")}
          </div>
        ) : (
          <div className="w-full text-sm">
            <div className="flex items-center text-muted-foreground border-b border-border pb-2 mb-2 px-2">
              <div className="w-[90px] sm:w-[100px] font-medium">
                {t("inventory.history.time")}
              </div>
              <div className="flex-1 font-medium">
                {t("inventory.history.transaction")}
              </div>
              <div className="w-[90px] sm:w-[120px] text-right font-medium">
                {t("inventory.history.change")}
              </div>
              <div className="w-[90px] sm:w-[120px] text-right font-medium">
                {t("inventory.history.balance")}
              </div>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
              {sortedMovements.map((m) => {
                const isIn = Number(m.qtyIn || 0) > 0;
                const qty = isIn ? m.qtyIn : m.qtyOut;
                const dt = normalizeDateTimeGMT7(m.createdAt);
                return (
                  <div
                    key={m.id}
                    className="flex items-center hover:bg-muted/50 rounded py-2 px-2 transition-colors"
                  >
                    <div className="w-[90px] sm:w-[100px]">
                      <div className="text-xs font-semibold text-foreground">
                        {dt.slice(11, 16)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {dt.slice(0, 10)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span
                          className={
                            isIn
                              ? "text-[11px] font-medium text-emerald-600"
                              : "text-[11px] font-medium text-amber-600"
                          }
                        >
                          {isIn
                            ? t("inventory.history.in")
                            : t("inventory.history.out")}
                        </span>
                        <span className="truncate font-medium text-foreground text-xs sm:text-sm">
                          {movementLabel(m, t)}
                        </span>
                        {m.notes ? (
                          <span className="hidden sm:inline truncate text-xs text-muted-foreground">
                            • {m.notes}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-[90px] sm:w-[120px] text-right">
                      <div
                        className={
                          isIn
                            ? "font-medium text-emerald-600 text-xs sm:text-sm"
                            : "font-medium text-amber-600 text-xs sm:text-sm"
                        }
                      >
                        {isIn ? "+" : "-"}
                        {fmtQty(qty)}
                      </div>
                    </div>

                    <div className="w-[90px] sm:w-[120px] text-right">
                      <div className="font-medium text-foreground text-xs sm:text-sm">
                        {fmtQty(m.balanceAfter)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
