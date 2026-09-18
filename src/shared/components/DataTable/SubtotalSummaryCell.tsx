import React, { useState, useRef, type ReactNode } from "react";
import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { fmtQty, money } from "@/shared/utils/format";
import {
  Sigma,
  Layers,
  Package,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

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
  grandTotalQty?: number;
  /** Tổng thành tiền toàn bộ (Grand Total) */
  grandTotalAmount?: number;
  /** Chế độ hiển thị trên cell: 'subtotal' (Trang hiện tại, mặc định) | 'grand' (Tổng toàn bộ các trang) */
  displayMode?: "grand" | "subtotal";
  /** Tổng số lượng đặt (nếu có, e.g. PO/GR) */
  grandTotalOrderedQty?: number;
  /** Subtotal số lượng đặt trang hiện tại (nếu có) */
  subtotalOrderedQty?: number;
  /** Tổng tăng / giảm (nếu là điều chỉnh kho) */
  positiveQty?: number;
  /** Tổng giảm (nếu là điều chỉnh kho) */
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
  /** Tiêu đề ngữ cảnh cho chỉ số số lượng (vd: "SL Nhập kho", "SL Tồn kho", "SL Thực nhận") */
  metricTitle?: string;
  /** Tiêu đề ngữ cảnh cho chỉ số dòng/mặt hàng (vd: "Mặt hàng", "Dòng chứng từ", "Bút toán") */
  itemTitle?: string;
  /** Đơn vị mặt hàng / dòng (vd: "SKU", "dòng", "mặt hàng", "bút toán") */
  itemUnit?: string;
  /** Bật/tắt thanh progress bar tỷ lệ */
  showRatioProgress?: boolean;
  /** Danh sách mặt hàng (optional) */
  groupedItems?: any[];
  /** Custom label nếu variantType === 'label' */
  label?: ReactNode;
  /** ClassName bổ sung cho wrapper */
  className?: string;
  /** ClassName bổ sung cho giá trị hiển thị */
  valueClassName?: string;
  /** Hiển thị dấu '+' cho số dương (ví dụ điều chỉnh kho) */
  showSign?: boolean;
  /** Bật card đối soát cân đối Kế toán Nợ - Có */
  showAccountingBalance?: boolean;
  /** Tổng phát sinh Nợ dùng để đối soát kế toán */
  balanceDebit?: number;
  /** Tổng phát sinh Có dùng để đối soát kế toán */
  balanceCredit?: number;
}

export const SubtotalSummaryCell = React.memo(function SubtotalSummaryCell({
  subtotalQty,
  subtotalAmount,
  grandTotalQty = 0,
  grandTotalAmount,
  displayMode = "subtotal",
  grandTotalOrderedQty,
  positiveQty,
  negativeQty,
  itemCount,
  variantType,
  page = 1,
  totalPages = 1,
  currentPageCount,
  totalCount,
  metricTitle,
  itemTitle,
  itemUnit,
  showRatioProgress = true,
  label,
  className,
  valueClassName,
  showSign = false,
  showAccountingBalance = false,
  balanceDebit,
  balanceCredit,
}: SubtotalSummaryCellProps) {
  const t = useT();
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

  const isMultiPage = totalPages > 1;
  const totalItemsDisplay = itemCount ?? totalCount ?? 0;
  const currentItemsDisplay =
    currentPageCount ?? (isMultiPage ? 0 : totalItemsDisplay);

  // Tỷ lệ phân trang số dòng / mặt hàng
  const itemRatioPct =
    totalItemsDisplay > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((currentItemsDisplay / totalItemsDisplay) * 1000) / 10,
          ),
        )
      : 0;

  // Tỷ lệ phân trang số lượng
  const currentQtyDisplay = subtotalQty ?? grandTotalQty;
  const qtyRatioPct =
    grandTotalQty !== 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (Math.abs(currentQtyDisplay) / Math.abs(grandTotalQty)) * 1000,
            ) / 10,
          ),
        )
      : 0;

  // Tỷ lệ phân trang thành tiền (nếu có)
  const currentAmountDisplay = subtotalAmount ?? grandTotalAmount ?? 0;
  const totalAmountDisplay = grandTotalAmount ?? 0;
  const amountRatioPct =
    totalAmountDisplay !== 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((currentAmountDisplay / totalAmountDisplay) * 1000) / 10,
          ),
        )
      : 0;

  const isAmountVariant = variantType === "amount";

  // Xác định tiêu đề hiển thị Box 1 (Số dòng / SKU / Bút toán)
  const resolvedItemTitle =
    itemTitle ||
    (isMultiPage
      ? t("common.summaryItems", "Mặt hàng")
      : t("common.summaryLines", "Dòng chứng từ"));
  const resolvedItemUnit =
    itemUnit || (isMultiPage ? "SKU" : t("common.summaryLines", "dòng"));

  // Xác định tiêu đề hiển thị Box 2 (Số lượng hoặc Số tiền)
  const resolvedMetricTitle =
    metricTitle ||
    (isAmountVariant
      ? t("common.summaryTotalAmount", "Tổng số tiền")
      : positiveQty !== undefined || negativeQty !== undefined
        ? t("common.summaryAdjDiff", "SL điều chỉnh")
        : grandTotalOrderedQty !== undefined
          ? t("common.summaryQuantity", "SL thực nhận")
          : t("common.summaryQuantity", "Tổng số lượng"));

  // Tính toán so khớp PO (nếu có)
  const hasPoComparison =
    grandTotalOrderedQty !== undefined && grandTotalOrderedQty > 0;
  const poDiff = hasPoComparison ? grandTotalQty - grandTotalOrderedQty : 0;
  const poProgressPct = hasPoComparison
    ? Math.min(
        100,
        Math.max(0, Math.round((grandTotalQty / grandTotalOrderedQty) * 100)),
      )
    : 100;

  // Tính toán đối soát cân đối Kế toán (Double-Entry Balance Reconciliation)
  const hasAccountingBalance =
    showAccountingBalance ||
    (balanceDebit !== undefined && balanceCredit !== undefined);
  const debVal = Number(balanceDebit ?? 0);
  const creVal = Number(balanceCredit ?? 0);
  const isBalanced = Math.abs(debVal - creVal) < 0.01;
  const acctDiff = debVal - creVal;

  const popoverContent = (
    <div
      className="w-[calc(100vw-32px)] max-w-[440px] sm:w-[440px] p-3.5 sm:p-4 text-xs flex flex-col gap-2.5 select-text shadow-2xl rounded-2xl bg-popover/98 backdrop-blur-md border border-border/80"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Sigma className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">
            {t("common.summaryOverview", "Tổng quan số liệu")}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] font-mono px-2 py-0.5 bg-muted/80 text-muted-foreground font-semibold"
        >
          {t("common.summaryPage", "Trang")} {page}/{totalPages || 1}
        </Badge>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Box 1: Mặt hàng / Số dòng chứng từ / Bút toán */}
        <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span className="truncate">{resolvedItemTitle}</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />
          </div>

          <div className="mt-1.5">
            {/* Hàng 1: Giá trị trang hiện tại */}
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-base sm:text-lg font-bold font-mono text-foreground tabular-nums tracking-tight">
                {currentItemsDisplay.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium font-mono">
                {t("common.summaryPage", "Trang")} {page}/{totalPages || 1}
              </span>
            </div>

            {/* Hàng 2: Tổng toàn bộ */}
            <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate flex items-center gap-1">
              <span className="text-muted-foreground/70">/</span>
              <span className="font-semibold text-foreground/90 font-mono">
                {totalItemsDisplay.toLocaleString("vi-VN")}
              </span>
              <span className="truncate">{resolvedItemUnit}</span>
            </div>

            {/* Progress Bar */}
            {showRatioProgress && (
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[1px] shadow-inner">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(itemRatioPct || 100, 2)}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 flex justify-between font-mono font-medium">
                  <span>{t("common.summaryPageRatio", "Tỷ trọng trang")}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {itemRatioPct || 100}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Chỉ số theo cột (Số tiền khi variantType === 'amount' hoặc Số lượng khi 'qty') */}
        {isAmountVariant ? (
          <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span className="truncate">{resolvedMetricTitle}</span>
              <Coins className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
            </div>

            <div className="mt-1.5">
              {/* Hàng 1: Giá trị trang hiện tại */}
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-lg font-bold font-mono text-primary tabular-nums tracking-tight">
                  {money(Number(currentAmountDisplay))}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium font-mono">
                  {t("common.summaryPage", "Trang")} {page}/{totalPages || 1}
                </span>
              </div>

              {/* Hàng 2: Tổng toàn bộ */}
              <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate flex items-center gap-1">
                <span className="text-muted-foreground/70">/</span>
                <span className="font-semibold text-foreground/90 font-mono">
                  {money(Number(totalAmountDisplay))}
                </span>
              </div>

              {/* Progress Bar */}
              {showRatioProgress && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(amountRatioPct || 100, 2)}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex justify-between font-mono font-medium">
                    <span>
                      {t("common.summaryValueRatio", "Tỷ trọng giá trị")}
                    </span>
                    <span className="font-bold text-primary">
                      {amountRatioPct || 100}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span className="truncate">{resolvedMetricTitle}</span>
              <Package className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
            </div>

            <div className="mt-1.5">
              {/* Hàng 1: Giá trị trang hiện tại */}
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-lg font-bold font-mono text-primary tabular-nums tracking-tight">
                  {showSign && currentQtyDisplay > 0 ? "+" : ""}
                  {fmtQty(currentQtyDisplay)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium font-mono">
                  {t("common.summaryPage", "Trang")} {page}/{totalPages || 1}
                </span>
              </div>

              {/* Hàng 2: Tổng toàn bộ */}
              <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate flex items-center gap-1">
                <span className="text-muted-foreground/70">/</span>
                <span className="font-semibold text-foreground/90 font-mono">
                  {showSign && grandTotalQty > 0 ? "+" : ""}
                  {fmtQty(grandTotalQty)}
                </span>
                <span className="truncate">
                  {t("common.summaryUnits", "đơn vị")}
                </span>
              </div>

              {/* Progress Bar */}
              {showRatioProgress && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(qtyRatioPct || 100, 2)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex justify-between font-mono font-medium">
                    <span>
                      {t("common.summaryPageRatio", "Tỷ trọng trang")}
                    </span>
                    <span className="font-bold text-primary">
                      {qtyRatioPct || 100}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Box 3: Đối soát Cân đối Kế toán (Double-Entry Balance Reconciliation) */}
        {hasAccountingBalance && (
          <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col col-span-2 gap-2 shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Coins className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {t(
                  "common.summaryAccountingReconciliation",
                  "Đối soát Cân đối Kế toán",
                )}
              </span>
              {isBalanced ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("common.summaryBalanced", "Cân đối Nợ - Có")}
                </Badge>
              ) : (
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] px-2 py-0.5 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {t("common.summaryUnbalanced", "Lệch Nợ - Có")}:{" "}
                  {acctDiff > 0
                    ? `+${money(acctDiff)}`
                    : `-${money(Math.abs(acctDiff))}`}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="flex flex-col p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {t("common.summaryDebitTotal", "Tổng phát sinh Nợ")}
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-foreground mt-0.5 tabular-nums">
                  {money(debVal)}
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {t("common.summaryCreditTotal", "Tổng phát sinh Có")}
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-foreground mt-0.5 tabular-nums">
                  {money(creVal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Box 4: So khớp đơn đặt hàng PO (khi có grandTotalOrderedQty) */}
        {hasPoComparison && (
          <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col col-span-2 shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>
                {t(
                  "common.summaryPoProgress",
                  "Tiến độ nhập theo Đơn đặt (PO)",
                )}
              </span>
              {poDiff === 0 ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 font-semibold">
                  {t("common.summaryPoFull", "Đủ 100%")}
                </Badge>
              ) : poDiff < 0 ? (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-2 py-0.5 font-semibold">
                  {t("common.summaryPoMissing", "Thiếu")}{" "}
                  {fmtQty(Math.abs(poDiff))}
                </Badge>
              ) : (
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] px-2 py-0.5 font-semibold">
                  {t("common.summaryPoExceeded", "Vượt")} +{fmtQty(poDiff)}
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono text-foreground tabular-nums">
                  {fmtQty(grandTotalQty)}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  / {fmtQty(grandTotalOrderedQty)}{" "}
                  {t("common.summaryPoOrdered", "đặt hàng")}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-foreground">
                {poProgressPct}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden mt-2 p-[1px] shadow-inner">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  poDiff === 0
                    ? "bg-emerald-500"
                    : poDiff < 0
                      ? "bg-amber-500"
                      : "bg-purple-500",
                )}
                style={{ width: `${Math.max(poProgressPct, 2)}%` }}
              />
            </div>
          </div>
        )}

        {/* Box 5: Tăng / Giảm điều chỉnh (nếu là IA) */}
        {(positiveQty !== undefined || negativeQty !== undefined) && (
          <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col col-span-2 gap-1.5 shadow-sm">
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("common.summaryAdjDiff", "Chi tiết chênh lệch điều chỉnh")}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {t("common.summaryAdjIncrease", "Tăng (+)")}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{fmtQty(positiveQty ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  {t("common.summaryAdjDecrease", "Giảm (-)")}
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  -{fmtQty(negativeQty ?? 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Box 6: Tổng thành tiền / Giá trị tồn kho (chỉ hiển thị khi variantType !== 'amount' và có grandTotalAmount) */}
        {!isAmountVariant && grandTotalAmount !== undefined && (
          <div className="p-3 rounded-xl bg-surface/90 border border-border/80 flex flex-col col-span-2 shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>
                {isMultiPage
                  ? t("common.summaryStockValue", "Giá trị tồn kho")
                  : t("common.summaryTotalAmount", "Tổng thành tiền")}
              </span>
              <span className="text-xs text-muted-foreground font-mono font-medium">
                {t("common.summaryPage", "Trang")} {page}/{totalPages || 1}
              </span>
            </div>
            <div className="mt-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold font-mono text-primary tabular-nums">
                  {money(Number(currentAmountDisplay))}
                </span>
                <span className="text-xs font-bold font-mono text-primary">
                  {amountRatioPct || 100}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate flex items-center gap-1">
                <span className="text-muted-foreground/70">/</span>
                <span className="font-semibold text-foreground/90 font-mono">
                  {money(Number(totalAmountDisplay))}
                </span>
              </div>
              {showRatioProgress && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[1px] shadow-inner">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(amountRatioPct || 100, 2)}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex justify-between font-mono font-medium">
                    <span>
                      {t("common.summaryValueRatio", "Tỷ trọng giá trị")}
                    </span>
                    <span className="font-bold text-primary">
                      {amountRatioPct || 100}%
                    </span>
                  </div>
                </div>
              )}
            </div>
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

        {variantType === "qty" &&
          (() => {
            const val = Number(
              displayMode === "subtotal"
                ? (subtotalQty ?? grandTotalQty)
                : (grandTotalQty ?? subtotalQty),
            );
            const prefix = showSign && val > 0 ? "+" : "";
            return (
              <span
                className={cn(
                  "font-bold tabular-nums border-b border-dashed border-current/40 group-hover:border-current",
                  valueClassName || "text-primary",
                )}
              >
                {prefix}
                {fmtQty(val)}
              </span>
            );
          })()}

        {variantType === "amount" && (
          <span
            className={cn(
              "font-bold tabular-nums border-b border-dashed border-current/40 group-hover:border-current",
              valueClassName || "text-primary",
            )}
          >
            {money(
              Number(
                displayMode === "subtotal"
                  ? (subtotalAmount ?? grandTotalAmount)
                  : (grandTotalAmount ?? subtotalAmount),
              ),
            )}
          </span>
        )}

        <Info className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors opacity-70 group-hover:opacity-100" />
      </div>
    </Popover>
  );
});
