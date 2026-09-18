import React, { useState, useRef, type ReactNode } from "react";
import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { fmtQty, money } from "@/shared/utils/format";
import {
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
  /** Giá trị lũy kế từ trang 1 đến trang hiện tại (nếu có) */
  cumulativeAmount?: number;
  /** Giá trị lũy kế số lượng từ trang 1 đến trang hiện tại (nếu có) */
  cumulativeQty?: number;
  /** Giá trị lũy kế số dòng từ trang 1 đến trang hiện tại (nếu có) */
  cumulativeCount?: number;
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
  cumulativeAmount,
  cumulativeQty,
  cumulativeCount,
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
  const resolvedCumulativeCount =
    cumulativeCount !== undefined
      ? cumulativeCount
      : isMultiPage
        ? (page - 1) * (currentPageCount || 0) + currentItemsDisplay
        : currentItemsDisplay;

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

  const cumulativeItemRatioPct =
    totalItemsDisplay > 0 && resolvedCumulativeCount !== undefined
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((resolvedCumulativeCount / totalItemsDisplay) * 1000) /
              10,
          ),
        )
      : itemRatioPct;

  // Tỷ lệ phân trang số lượng
  const currentQtyDisplay = subtotalQty ?? grandTotalQty;
  const resolvedCumulativeQty =
    cumulativeQty !== undefined
      ? cumulativeQty
      : isMultiPage && page === 1
        ? currentQtyDisplay
        : undefined;

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

  const cumulativeQtyRatioPct =
    grandTotalQty !== 0 && resolvedCumulativeQty !== undefined
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (Math.abs(resolvedCumulativeQty) / Math.abs(grandTotalQty)) *
                1000,
            ) / 10,
          ),
        )
      : qtyRatioPct;

  // Tỷ lệ phân trang thành tiền (nếu có)
  const currentAmountDisplay = subtotalAmount ?? grandTotalAmount ?? 0;
  const totalAmountDisplay = grandTotalAmount ?? 0;
  const resolvedCumulativeAmount =
    cumulativeAmount !== undefined
      ? cumulativeAmount
      : isMultiPage && page === 1
        ? currentAmountDisplay
        : undefined;

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

  const cumulativeAmountRatioPct =
    totalAmountDisplay !== 0 && resolvedCumulativeAmount !== undefined
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((resolvedCumulativeAmount / totalAmountDisplay) * 1000) /
              10,
          ),
        )
      : amountRatioPct;

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
      className="w-[calc(100vw-32px)] max-w-[340px] sm:w-[340px] p-3 sm:p-3.5 text-xs flex flex-col gap-2.5 select-text"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground min-w-0 pr-2">
          {variantType === "label" ? (
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          ) : isAmountVariant ? (
            <Coins className="w-4 h-4 text-primary shrink-0" />
          ) : (
            <Package className="w-4 h-4 text-primary shrink-0" />
          )}
          <span className="text-xs font-semibold truncate">
            {variantType === "label"
              ? resolvedItemTitle
              : resolvedMetricTitle ||
                t("common.summaryOverview", "Tổng quan số liệu")}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] font-mono px-1.5 py-0.5 bg-muted/80 text-muted-foreground font-semibold shrink-0"
        >
          {t("common.summaryPage", "Trang")} {page}/{totalPages || 1}
        </Badge>
      </div>

      {/* ── Unified Metric Content (Flush Left-Right Aligned) ── */}
      {variantType === "label" ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">
                {t(
                  "common.currentPageMetric",
                  isMultiPage ? `Trang ${page}:` : "Phát sinh:",
                )}
              </span>
              <span
                className={cn(
                  "font-mono tabular-nums tracking-tight",
                  isMultiPage
                    ? "text-xs font-medium text-foreground/80"
                    : "text-xs font-bold text-foreground",
                )}
              >
                {currentItemsDisplay.toLocaleString("vi-VN")} {resolvedItemUnit}
              </span>
            </div>

            {isMultiPage && resolvedCumulativeCount !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    ↳
                  </span>
                  {t("common.cumulativeUpToPage", `Lũy kế (T1 → T${page}):`)}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                  {resolvedCumulativeCount.toLocaleString("vi-VN")}{" "}
                  {resolvedItemUnit}
                </span>
              </div>
            )}

            {isMultiPage && (
              <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-border/40">
                <span className="text-muted-foreground font-medium text-[11px]">
                  {t(
                    "common.grandTotalAllPages",
                    `Tổng toàn bộ (${totalPages} trang):`,
                  )}
                </span>
                <span className="text-xs font-bold text-foreground font-mono tabular-nums">
                  {totalItemsDisplay.toLocaleString("vi-VN")} {resolvedItemUnit}
                </span>
              </div>
            )}
          </div>

          {showRatioProgress && isMultiPage && totalItemsDisplay > 0 && (
            <div className="flex flex-col gap-1 pt-1">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[0.5px]">
                <div
                  className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      resolvedCumulativeCount !== undefined && isMultiPage
                        ? cumulativeItemRatioPct
                        : itemRatioPct || 100,
                      2,
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground flex justify-between font-mono font-medium">
                <span>{t("common.summaryRatio", "Tỷ trọng lũy kế")}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {resolvedCumulativeCount !== undefined && isMultiPage
                    ? `${cumulativeItemRatioPct}%`
                    : `${itemRatioPct || 100}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : isAmountVariant ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">
                {t(
                  "common.currentPageMetric",
                  isMultiPage ? `Trang ${page}:` : "Phát sinh:",
                )}
              </span>
              <span
                className={cn(
                  "font-mono tabular-nums tracking-tight",
                  isMultiPage
                    ? "text-xs font-medium text-foreground/80"
                    : "text-xs font-bold text-primary",
                )}
              >
                {money(Number(currentAmountDisplay))}
              </span>
            </div>

            {isMultiPage && resolvedCumulativeAmount !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
                  <span className="text-primary font-mono font-bold">↳</span>
                  {t("common.cumulativeUpToPage", `Lũy kế (T1 → T${page}):`)}
                </span>
                <span className="text-xs font-bold text-primary font-mono tabular-nums">
                  {money(Number(resolvedCumulativeAmount))}
                </span>
              </div>
            )}

            {isMultiPage && (
              <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-border/40">
                <span className="text-muted-foreground font-medium text-[11px]">
                  {t(
                    "common.grandTotalAllPages",
                    `Tổng toàn bộ (${totalPages} trang):`,
                  )}
                </span>
                <span className="text-xs font-bold text-foreground font-mono tabular-nums">
                  {money(Number(totalAmountDisplay))}
                </span>
              </div>
            )}
          </div>

          {showRatioProgress && isMultiPage && totalAmountDisplay !== 0 && (
            <div className="flex flex-col gap-1 pt-1">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[0.5px]">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      resolvedCumulativeAmount !== undefined && isMultiPage
                        ? cumulativeAmountRatioPct
                        : amountRatioPct || 100,
                      2,
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground flex justify-between font-mono font-medium">
                <span>{t("common.summaryValueRatio", "Tỷ trọng lũy kế")}</span>
                <span className="font-bold text-primary">
                  {resolvedCumulativeAmount !== undefined && isMultiPage
                    ? `${cumulativeAmountRatioPct}%`
                    : `${amountRatioPct || 100}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">
                {t(
                  "common.currentPageMetric",
                  isMultiPage ? `Trang ${page}:` : "Phát sinh:",
                )}
              </span>
              <span
                className={cn(
                  "font-mono tabular-nums tracking-tight",
                  isMultiPage
                    ? "text-xs font-medium text-foreground/80"
                    : "text-xs font-bold text-primary",
                )}
              >
                {showSign && currentQtyDisplay > 0 ? "+" : ""}
                {fmtQty(currentQtyDisplay)} {t("common.summaryUnits", "đơn vị")}
              </span>
            </div>

            {isMultiPage && resolvedCumulativeQty !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
                  <span className="text-primary font-mono font-bold">↳</span>
                  {t("common.cumulativeUpToPage", `Lũy kế (T1 → T${page}):`)}
                </span>
                <span className="text-xs font-bold text-primary font-mono tabular-nums">
                  {showSign && resolvedCumulativeQty > 0 ? "+" : ""}
                  {fmtQty(resolvedCumulativeQty)}{" "}
                  {t("common.summaryUnits", "đơn vị")}
                </span>
              </div>
            )}

            {isMultiPage && (
              <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-border/40">
                <span className="text-muted-foreground font-medium text-[11px]">
                  {t(
                    "common.grandTotalAllPages",
                    `Tổng toàn bộ (${totalPages} trang):`,
                  )}
                </span>
                <span className="text-xs font-bold text-foreground font-mono tabular-nums">
                  {showSign && grandTotalQty > 0 ? "+" : ""}
                  {fmtQty(grandTotalQty)} {t("common.summaryUnits", "đơn vị")}
                </span>
              </div>
            )}
          </div>

          {showRatioProgress && isMultiPage && grandTotalQty !== 0 && (
            <div className="flex flex-col gap-1 pt-1">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-[0.5px]">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      resolvedCumulativeQty !== undefined && isMultiPage
                        ? cumulativeQtyRatioPct
                        : qtyRatioPct || 100,
                      2,
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground flex justify-between font-mono font-medium">
                <span>{t("common.summaryPageRatio", "Tỷ trọng lũy kế")}</span>
                <span className="font-bold text-primary">
                  {resolvedCumulativeQty !== undefined && isMultiPage
                    ? `${cumulativeQtyRatioPct}%`
                    : `${qtyRatioPct || 100}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Khối Đối soát Kế toán Nợ - Có (nếu có) ── */}
      {hasAccountingBalance && (
        <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Coins className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {t(
                "common.summaryAccountingReconciliation",
                "Đối soát Cân đối Kế toán",
              )}
            </span>
            {isBalanced ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0.2 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t("common.summaryBalanced", "Cân đối Nợ - Có")}
              </Badge>
            ) : (
              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] px-1.5 py-0.2 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t("common.summaryUnbalanced", "Lệch Nợ - Có")}:{" "}
                {acctDiff > 0
                  ? `+${money(acctDiff)}`
                  : `-${money(Math.abs(acctDiff))}`}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium">
                {t("common.summaryDebitTotal", "Tổng phát sinh Nợ")}
              </span>
              <span className="font-mono font-bold text-xs text-foreground mt-0.5 tabular-nums">
                {money(debVal)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium">
                {t("common.summaryCreditTotal", "Tổng phát sinh Có")}
              </span>
              <span className="font-mono font-bold text-xs text-foreground mt-0.5 tabular-nums">
                {money(creVal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Khối So khớp Đơn đặt hàng PO (nếu có) ── */}
      {hasPoComparison && (
        <div className="pt-2 border-t border-border/50 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span>
              {t("common.summaryPoProgress", "Tiến độ nhập theo Đơn đặt (PO)")}
            </span>
            {poDiff === 0 ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0.2 font-semibold">
                {t("common.summaryPoFull", "Đủ 100%")}
              </Badge>
            ) : poDiff < 0 ? (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0.2 font-semibold">
                {t("common.summaryPoMissing", "Thiếu")}{" "}
                {fmtQty(Math.abs(poDiff))}
              </Badge>
            ) : (
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0.2 font-semibold">
                {t("common.summaryPoExceeded", "Vượt")} +{fmtQty(poDiff)}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono text-foreground tabular-nums">
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
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden mt-1 p-[0.5px]">
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

      {/* ── Khối Tăng / Giảm Điều chỉnh Kho (nếu có) ── */}
      {(positiveQty !== undefined || negativeQty !== undefined) && (
        <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5">
          <div className="text-[11px] text-muted-foreground font-medium">
            {t("common.summaryAdjDiff", "Chi tiết chênh lệch điều chỉnh")}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {t("common.summaryAdjIncrease", "Tăng (+)")}
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{fmtQty(positiveQty ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/15">
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
