import React from "react";
import { Calendar, Eye } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
  paid: number;
  balance: number;
  count: number;
}

interface CustomerMonthlyTrendTableProps {
  items: MonthlyTrendItem[];
  isPayable: boolean;
  onSelectMonth?: (month: string) => void;
}

export const CustomerMonthlyTrendTable: React.FC<
  CustomerMonthlyTrendTableProps
> = ({ items, isPayable, onSelectMonth }) => {
  if (items.length === 0) return null;

  return (
    <DrawerSection
      title={
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Chi tiết đối soát theo từng tháng ({items.length} tháng)</span>
        </div>
      }
      collapsible={false}
      className="p-3 border border-slate-200/80 dark:border-slate-800"
    >
      <div className="overflow-x-auto rounded-lg border border-border/80">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="py-2 px-3">Tháng</th>
              <th className="py-2 px-3 text-center">Số vụ việc</th>
              <th className="py-2 px-3 text-right">
                {isPayable ? "Chi phí" : "Phát sinh"}
              </th>
              <th className="py-2 px-3 text-right">
                {isPayable ? "Đã chi" : "Đã thu"}
              </th>
              <th className="py-2 px-3 text-right">
                {isPayable ? "Còn phải chi" : "Còn nợ"}
              </th>
              <th className="py-2 px-3 text-center">Tỷ lệ</th>
              <th className="py-2 px-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((item) => {
              const rate =
                item.revenue > 0 ? (item.paid / item.revenue) * 100 : 0;
              const parts = item.month.split("-");
              const label =
                parts.length === 2
                  ? `Tháng ${parts[1]}/${parts[0]}`
                  : item.month;
              return (
                <tr
                  key={item.month}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="py-2 px-3 font-semibold text-foreground">
                    {label}
                  </td>
                  <td className="py-2 px-3 text-center font-mono">
                    {item.count}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {money(item.revenue)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-600 font-semibold">
                    {money(item.paid)}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-right font-mono font-bold",
                      item.balance > 0
                        ? isPayable
                          ? "text-orange-600"
                          : "text-amber-600"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {item.balance > 0 ? money(item.balance) : "—"}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-semibold">
                    {rate.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Tooltip
                      content="Xem chi tiết đối soát tháng này"
                      side="left"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectMonth?.(item.month)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DrawerSection>
  );
};
