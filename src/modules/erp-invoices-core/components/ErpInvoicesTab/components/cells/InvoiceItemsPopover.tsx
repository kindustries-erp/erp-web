import React from "react";
import { Package } from "lucide-react";
import { fmtAmt } from "../../utils";

export interface InvoiceItemsPopoverProps {
  items?: any[];
}

function formatVatRateDisplay(vatRate: any, vatPercentage?: any): string {
  if (vatRate != null && vatRate !== "") {
    if (typeof vatRate === "string") {
      const trimmed = vatRate.trim();
      if (trimmed.endsWith("%") || isNaN(Number(trimmed))) {
        return trimmed || "—";
      }
      const num = Number(trimmed);
      if (num <= 1 && num > 0) {
        return `${Math.round(num * 100)}%`;
      }
      return `${num}%`;
    }
    if (typeof vatRate === "number") {
      if (vatRate <= 1 && vatRate > 0) {
        return `${Math.round(vatRate * 100)}%`;
      }
      return `${vatRate}%`;
    }
  }
  if (vatPercentage != null && vatPercentage !== "") {
    const num = Number(vatPercentage);
    if (!isNaN(num)) {
      return `${num}%`;
    }
    return String(vatPercentage);
  }
  return "—";
}

function getCompVatAmount(item: any): number {
  if (item.vatAmount != null && item.vatAmount !== "") {
    const amt = Number(item.vatAmount);
    if (!isNaN(amt)) return amt;
  }
  const preVat = Number(item.preVatAmount) || 0;
  let rate = 0;
  if (item.vatRate != null && item.vatRate !== "") {
    const r = Number(item.vatRate);
    if (!isNaN(r)) {
      rate = r > 1 ? r / 100 : r;
    }
  } else if (item.vatPercentage != null && item.vatPercentage !== "") {
    const r = Number(item.vatPercentage);
    if (!isNaN(r)) {
      rate = r / 100;
    }
  }
  return preVat * rate;
}

function getCompTotalAmount(item: any): number {
  if (item.totalAmount != null && item.totalAmount !== "") {
    const amt = Number(item.totalAmount);
    if (!isNaN(amt)) return amt;
  }
  const preVat = Number(item.preVatAmount) || 0;
  return preVat + getCompVatAmount(item);
}

export const InvoiceItemsPopover = React.memo(function InvoiceItemsPopover({
  items,
}: InvoiceItemsPopoverProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 w-[320px] text-center text-slate-500 dark:text-slate-400 text-xs italic">
        Không có chi tiết mặt hàng.
      </div>
    );
  }

  const totalQuantity = items.reduce(
    (acc: number, item: any) => acc + (Number(item.quantity) || 0),
    0,
  );

  const totalPreVatAmount = items.reduce(
    (acc: number, item: any) => acc + (Number(item.preVatAmount) || 0),
    0,
  );

  const totalVatAmount = items.reduce((acc: number, item: any) => {
    return acc + getCompVatAmount(item);
  }, 0);

  const totalTotalAmount = items.reduce((acc: number, item: any) => {
    return acc + getCompTotalAmount(item);
  }, 0);

  return (
    <div className="w-[760px] max-w-[92vw] flex flex-col rounded-xl overflow-hidden shadow-2xl bg-card border border-border/80 text-card-foreground">
      {/* Popover Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-slate-100/95 dark:bg-zinc-800/95 backdrop-blur-md select-none">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary flex-shrink-0" />
          <h4 className="font-semibold text-xs text-foreground">
            Chi tiết mặt hàng
          </h4>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-700/80 text-foreground">
            {items.length} dòng
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Tổng tiền:</span>
          <span className="font-bold text-primary tabular-nums">
            {fmtAmt(totalTotalAmount.toString())}
          </span>
        </div>
      </div>

      {/* Scrollable Table Area (Horizontal & Vertical Scrolling) */}
      <div className="overflow-x-auto overflow-y-auto max-h-[360px] scrollbar-thin">
        <table className="w-full text-xs text-left border-collapse min-w-[720px]">
          <thead className="table-header-glass sticky top-0 z-20 border-b border-border shadow-[0_1px_0_0_var(--border-light)]">
            <tr className="text-[11px] font-semibold text-muted-foreground h-7">
              <th className="w-[40px] min-w-[40px] max-w-[40px] px-2 py-1.5 text-center border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                #
              </th>
              <th className="w-[150px] min-w-[150px] max-w-[150px] px-2.5 py-1.5 text-left border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                Tên mặt hàng
              </th>
              <th className="w-[50px] min-w-[50px] px-2 py-1.5 text-right border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                SL
              </th>
              <th className="w-[55px] min-w-[55px] px-2 py-1.5 text-left border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                ĐVT
              </th>
              <th className="w-[90px] min-w-[90px] px-2 py-1.5 text-right border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                Đơn giá
              </th>
              <th className="w-[105px] min-w-[105px] px-2 py-1.5 text-right border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                Tiền trước thuế
              </th>
              <th className="w-[55px] min-w-[55px] px-2 py-1.5 text-right border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                VAT
              </th>
              <th className="w-[95px] min-w-[95px] px-2 py-1.5 text-right border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                Tiền VAT
              </th>
              <th className="w-[110px] min-w-[110px] px-2.5 py-1.5 text-right bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item: any, idx: number) => {
              const compVatAmt = getCompVatAmount(item);
              const compTotalAmt = getCompTotalAmount(item);
              const itemName =
                item.description || item.itemName || item.name || "—";
              const vatDisplay = formatVatRateDisplay(
                item.vatRate,
                item.vatPercentage,
              );

              return (
                <tr
                  key={item.id || idx}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {/* STT */}
                  <td className="w-[40px] min-w-[40px] max-w-[40px] px-2 py-1.5 text-center text-muted-foreground font-mono text-[11px] tabular-nums border-r border-border">
                    {idx + 1}
                  </td>

                  {/* Tên mặt hàng: 150px fixed, line-clamp-3, tooltip title */}
                  <td className="w-[150px] min-w-[150px] max-w-[150px] px-2.5 py-1.5 text-left align-top border-r border-border">
                    <div
                      className="line-clamp-3 break-words whitespace-normal text-xs leading-snug text-foreground"
                      title={itemName}
                    >
                      {itemName}
                    </div>
                  </td>

                  {/* Số lượng */}
                  <td className="w-[50px] min-w-[50px] px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-muted-foreground align-top border-r border-border">
                    {item.quantity != null && item.quantity !== ""
                      ? Number(item.quantity).toLocaleString("vi-VN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </td>

                  {/* ĐVT */}
                  <td className="w-[55px] min-w-[55px] px-2 py-1.5 text-left whitespace-nowrap text-muted-foreground text-[11px] truncate align-top border-r border-border">
                    {item.unit || item.unitName || "—"}
                  </td>

                  {/* Đơn giá */}
                  <td className="w-[90px] min-w-[90px] px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-foreground/90 align-top border-r border-border">
                    {fmtAmt(item.unitPrice?.toString())}
                  </td>

                  {/* Tiền trước thuế */}
                  <td className="w-[105px] min-w-[105px] px-2 py-1.5 text-right whitespace-nowrap font-medium tabular-nums text-foreground align-top border-r border-border">
                    {fmtAmt(item.preVatAmount?.toString())}
                  </td>

                  {/* Thuế suất VAT */}
                  <td className="w-[55px] min-w-[55px] px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-muted-foreground align-top border-r border-border">
                    {vatDisplay}
                  </td>

                  {/* Tiền VAT */}
                  <td className="w-[95px] min-w-[95px] px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-foreground/90 align-top border-r border-border">
                    {fmtAmt(compVatAmt.toString())}
                  </td>

                  {/* Thành tiền */}
                  <td className="w-[110px] min-w-[110px] px-2.5 py-1.5 text-right whitespace-nowrap font-semibold tabular-nums text-foreground align-top">
                    {fmtAmt(compTotalAmt.toString())}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="table-footer-glass sticky bottom-0 z-20 border-t border-border font-semibold shadow-[0_-1px_0_0_var(--border-light)]">
            <tr className="text-xs">
              <td
                colSpan={2}
                className="px-2.5 py-2 text-right text-foreground font-bold border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md"
              >
                Tổng cộng:
              </td>
              <td className="px-2 py-2 text-right text-foreground font-semibold tabular-nums border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                {totalQuantity.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-2 py-2 border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md" />
              <td className="px-2 py-2 border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md" />
              <td className="px-2 py-2 text-right text-foreground font-semibold tabular-nums border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                {fmtAmt(totalPreVatAmount.toString())}
              </td>
              <td className="px-2 py-2 border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md" />
              <td className="px-2 py-2 text-right text-foreground font-semibold tabular-nums border-r border-border bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                {fmtAmt(totalVatAmount.toString())}
              </td>
              <td className="px-2.5 py-2 text-right text-primary font-bold tabular-nums bg-slate-100/98 dark:bg-zinc-800/98 backdrop-blur-md">
                {fmtAmt(totalTotalAmount.toString())}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
});
