import React, { useState, useRef, type ReactNode } from "react";
import { Popover } from "@/core/components/ui/Popover";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import { Sigma, Layers, Package, Info } from "lucide-react";

export function toText(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if (val.name && typeof val.name === "string") return val.name;
    if (val.label && typeof val.label === "string") return val.label;
    if (val.code && typeof val.code === "string") return val.code;
    if (val.sku && typeof val.sku === "string") return val.sku;
    if (val.vi && typeof val.vi === "string") return val.vi;
    if (val.en && typeof val.en === "string") return val.en;
    if (val.title && typeof val.title === "string") return val.title;
    if (val.text && typeof val.text === "string") return val.text;
    return "";
  }
  return String(val);
}

export interface QtyBucket {
  qty: number;
  itemCount: number;
  totalQty: number;
  percentage: number;
}

export interface SubtotalGroupItem {
  id?: string;
  code?: string;
  name: string;
  qty: number;
  amount?: number;
  uom?: string;
  count?: number;
  percentage?: number;
}

export interface SubtotalSummaryCellProps {
  /** Giá trị subtotal của trang hiện tại */
  subtotalQty?: number;
  /** Giá trị subtotal amount của trang hiện tại */
  subtotalAmount?: number;
  /** Tổng số lượng toàn bộ (Grand Total) */
  grandTotalQty: number;
  /** Tổng thành tiền toàn bộ (Grand Total) */
  grandTotalAmount?: number;
  /** Tổng số lượng đặt (nếu có, e.g. PO/GR) */
  grandTotalOrderedQty?: number;
  /** Subtotal số lượng đặt trang hiện tại (nếu có) */
  subtotalOrderedQty?: number;
  /** Tổng tăng / giảm (nếu là điều chỉnh kho) */
  positiveQty?: number;
  negativeQty?: number;
  /** Tổng số mặt hàng / dòng */
  itemCount?: number;
  /** Loại hiển thị cho cell này: 'qty' | 'amount' | 'label' */
  variantType: "qty" | "amount" | "label";
  /** Trang hiện tại */
  page?: number;
  /** Tổng số trang */
  totalPages?: number;
  /** Số dòng trên trang hiện tại */
  currentPageCount?: number;
  /** Tổng số dòng toàn bộ */
  totalCount?: number;
  /** Danh sách mặt hàng (optional) */
  groupedItems?: any[];
  /** Custom label nếu variantType === 'label' */
  label?: ReactNode;
  /** ClassName bổ sung */
  className?: string;
}

export const SubtotalSummaryCell = React.memo(function SubtotalSummaryCell({
  subtotalQty,
  subtotalAmount,
  grandTotalQty,
  grandTotalAmount,
  grandTotalOrderedQty,
  subtotalOrderedQty,
  positiveQty,
  negativeQty,
  itemCount,
  variantType,
  page = 1,
  totalPages = 1,
  currentPageCount,
  totalCount,
  label,
  className,
}: SubtotalSummaryCellProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  const totalItemsDisplay = itemCount ?? totalCount ?? 0;

  const popoverContent = (
    <div
      className="w-[260px] sm:w-[280px] p-2.5 text-xs flex flex-col gap-2.5 select-text"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Sigma className="w-3.5 h-3.5 text-primary" />
          <span>Tổng quan toàn bộ</span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] font-mono px-1.5 py-0"
        >
          Trang {page}/{totalPages || 1}
        </Badge>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Box 1: Số mặt hàng */}
        <div className="p-2 rounded-lg bg-surface border border-border/70 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span>Số mặt hàng</span>
            <Layers className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-base font-bold font-mono text-foreground mt-0.5 tabular-nums">
            {totalItemsDisplay.toLocaleString("vi-VN")}
          </div>
          {currentPageCount !== undefined && totalPages > 1 && (
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
              Trang này:{" "}
              <span className="font-semibold text-foreground font-mono">
                {currentPageCount}
              </span>
            </div>
          )}
        </div>

        {/* Box 2: Tổng số lượng */}
        <div className="p-2 rounded-lg bg-surface border border-border/70 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span>
              {positiveQty !== undefined ? "SL điều chỉnh" : "Tổng số lượng"}
            </span>
            <Package className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-base font-bold font-mono text-primary mt-0.5 tabular-nums">
            {Number(grandTotalQty).toLocaleString("vi-VN")}
          </div>
          {subtotalQty !== undefined && totalPages > 1 && (
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
              Trang này:{" "}
              <span className="font-semibold text-foreground font-mono">
                {Number(subtotalQty).toLocaleString("vi-VN")}
              </span>
            </div>
          )}
        </div>

        {/* Box 3: SL Đặt (nếu có trong GR/PO) */}
        {grandTotalOrderedQty !== undefined && (
          <div className="p-2 rounded-lg bg-surface border border-border/70 flex flex-col col-span-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Tổng SL đặt</span>
              <span className="font-mono font-bold text-foreground text-xs">
                {Number(grandTotalOrderedQty).toLocaleString("vi-VN")}
              </span>
            </div>
            {subtotalOrderedQty !== undefined && totalPages > 1 && (
              <div className="text-[10px] text-muted-foreground mt-0.5 flex justify-between">
                <span>Trang hiện tại:</span>
                <span className="font-semibold text-foreground font-mono">
                  {Number(subtotalOrderedQty).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Box 4: Tăng / Giảm điều chỉnh (nếu là IA) */}
        {(positiveQty !== undefined || negativeQty !== undefined) && (
          <div className="p-2 rounded-lg bg-surface border border-border/70 flex flex-col col-span-2 gap-1">
            {positiveQty !== undefined && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-medium">
                  Tổng tăng (+)
                </span>
                <span className="font-mono font-bold text-emerald-600">
                  +{Number(positiveQty).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
            {negativeQty !== undefined && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-600 font-medium">Tổng giảm (-)</span>
                <span className="font-mono font-bold text-rose-600">
                  -{Number(negativeQty).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Box 5: Tổng thành tiền (nếu có) */}
        {grandTotalAmount !== undefined && (
          <div className="p-2 rounded-lg bg-surface border border-border/70 flex flex-col col-span-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Tổng thành tiền</span>
              <span className="text-base font-bold font-mono text-primary tabular-nums">
                {money(Number(grandTotalAmount))}
              </span>
            </div>
            {subtotalAmount !== undefined && totalPages > 1 && (
              <div className="text-[10px] text-muted-foreground mt-0.5 flex justify-between">
                <span>Trang hiện tại:</span>
                <span className="font-semibold text-foreground font-mono">
                  {money(Number(subtotalAmount))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={popoverContent}
      side="top"
      align="end"
      sideOffset={6}
      glass={true}
    >
      <div
        className={cn(
          "inline-flex items-center justify-end gap-1 cursor-pointer transition-colors group",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setOpen((s) => !s)}
      >
        {variantType === "label" && (
          <span className="font-semibold text-muted-foreground group-hover:text-foreground">
            {label}
          </span>
        )}

        {variantType === "qty" && (
          <span className="font-bold text-primary tabular-nums border-b border-dashed border-primary/40 group-hover:border-primary">
            {Number(subtotalQty ?? grandTotalQty).toLocaleString("vi-VN")}
          </span>
        )}

        {variantType === "amount" && (
          <span className="font-bold text-primary tabular-nums border-b border-dashed border-primary/40 group-hover:border-primary">
            {money(Number(subtotalAmount ?? grandTotalAmount))}
          </span>
        )}

        <Info className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors opacity-70 group-hover:opacity-100" />
      </div>
    </Popover>
  );
});
