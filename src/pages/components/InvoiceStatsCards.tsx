import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  subDays,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { money } from "@/shared/utils/format";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { InvoiceCheckpointDrawer } from "./InvoiceCheckpointDrawer";

interface InvoiceStatsCardsProps {
  direction: "IN" | "OUT";
  title?: string;
}

export function InvoiceStatsCards({
  direction,
  title,
}: InvoiceStatsCardsProps) {
  const [checkpointDrawer, setCheckpointDrawer] = useState<{
    open: boolean;
    dateFrom: string;
    dateTo: string;
    periodLabel: string;
  }>({
    open: false,
    dateFrom: "",
    dateTo: "",
    periodLabel: "",
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["erp-invoices-stats", direction],
    queryFn: () => erpInvoicesCoreApi.getStats(direction),
  });

  const monthLabels = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return `Tháng ${format(d, "MM/yyyy")}`;
    });
  }, []);

  const weekLabels = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const d = subWeeks(new Date(), 3 - i);
      const start = startOfWeek(d, { weekStartsOn: 1 });
      const end = endOfWeek(d, { weekStartsOn: 1 });
      return `${format(start, "dd/MM")} - ${format(end, "dd/MM")}`;
    });
  }, []);

  const dayLabels = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "dd/MM/yyyy");
    });
  }, []);

  const handleMonthClick = (index: number) => {
    const monthsAgo = 5 - index;
    const date = subMonths(new Date(), monthsAgo);
    const startStr = format(startOfMonth(date), "yyyy-MM-dd");
    const endStr = format(endOfMonth(date), "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: startStr,
      dateTo: endStr,
      periodLabel: `Tháng ${format(date, "MM/yyyy")}`,
    });
  };

  const handleWeekClick = (index: number) => {
    const weeksAgo = 3 - index;
    const date = subWeeks(new Date(), weeksAgo);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: startStr,
      dateTo: endStr,
      periodLabel: `Tuần ${format(start, "dd/MM")} - ${format(end, "dd/MM")}`,
    });
  };

  const handleDayClick = (index: number) => {
    const daysAgo = 6 - index;
    const date = subDays(new Date(), daysAgo);
    const dateStr = format(date, "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: dateStr,
      dateTo: dateStr,
      periodLabel: `Ngày ${format(date, "dd/MM/yyyy")}`,
    });
  };

  const labelPrefix = direction === "OUT" ? "Doanh thu" : "Chi phí";

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <div className="flex items-center gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm">
            {title}
          </h4>
          <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Month Card */}
        <KpiCard
          compact
          loading={statsLoading}
          label={`${labelPrefix} Tháng này`}
          value={money(statsData?.monthTotal || 0)}
          sub={`Trước thuế: ${money(statsData?.monthPreVat || 0)}`}
          rightNode={
            <KpiSparkline
              data={statsData?.monthChart || [0, 0, 0, 0, 0, 0]}
              preVatData={statsData?.monthPreVatChart || [0, 0, 0, 0, 0, 0]}
              labels={monthLabels}
              onClick={handleMonthClick}
            />
          }
          bottomNode={(() => {
            const branches = statsData?.byBranch;
            return branches && branches.length > 0 ? (
              <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                {branches.map((b) => (
                  <div key={b.branchName} className="flex flex-col min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                      {b.branchName}
                    </span>
                    <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                      {money(b.monthTotal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        />

        {/* Week Card */}
        <KpiCard
          compact
          loading={statsLoading}
          label={`${labelPrefix} Tuần này`}
          value={money(statsData?.weekTotal || 0)}
          sub={`Trước thuế: ${money(statsData?.weekPreVat || 0)}`}
          rightNode={
            <KpiSparkline
              data={statsData?.weekChart || [0, 0, 0, 0]}
              preVatData={statsData?.weekPreVatChart || [0, 0, 0, 0]}
              labels={weekLabels}
              onClick={handleWeekClick}
            />
          }
          bottomNode={(() => {
            const branches = statsData?.byBranch;
            return branches && branches.length > 0 ? (
              <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                {branches.map((b) => (
                  <div key={b.branchName} className="flex flex-col min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                      {b.branchName}
                    </span>
                    <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                      {money(b.weekTotal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        />

        {/* Day Card */}
        <KpiCard
          compact
          loading={statsLoading}
          label={`${labelPrefix} Hôm nay`}
          value={money(statsData?.dayTotal || 0)}
          sub={`Trước thuế: ${money(statsData?.dayPreVat || 0)}`}
          rightNode={
            <KpiSparkline
              data={statsData?.dayChart || [0, 0, 0, 0, 0, 0, 0]}
              preVatData={statsData?.dayPreVatChart || [0, 0, 0, 0, 0, 0, 0]}
              labels={dayLabels}
              onClick={handleDayClick}
            />
          }
          bottomNode={(() => {
            const branches = statsData?.byBranch;
            return branches && branches.length > 0 ? (
              <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                {branches.map((b) => (
                  <div key={b.branchName} className="flex flex-col min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                      {b.branchName}
                    </span>
                    <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                      {money(b.dayTotal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        />
      </div>

      <InvoiceCheckpointDrawer
        open={checkpointDrawer.open}
        onClose={() =>
          setCheckpointDrawer((prev) => ({ ...prev, open: false }))
        }
        direction={direction}
        dateFrom={checkpointDrawer.dateFrom}
        dateTo={checkpointDrawer.dateTo}
        periodLabel={checkpointDrawer.periodLabel}
      />
    </div>
  );
}
