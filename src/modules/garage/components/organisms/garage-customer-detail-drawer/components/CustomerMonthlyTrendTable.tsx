import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Eye } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
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

export const CustomerMonthlyTrendTable = React.memo(
  function CustomerMonthlyTrendTable({
    items,
    isPayable,
    onSelectMonth,
  }: CustomerMonthlyTrendTableProps) {
    const { t } = useTranslation(["garage", "debts", "common"]);

    const totals = useMemo(() => {
      return items.reduce(
        (acc, it) => ({
          count: acc.count + (it.count || 0),
          revenue: acc.revenue + (it.revenue || 0),
          paid: acc.paid + (it.paid || 0),
          balance: acc.balance + (it.balance || 0),
        }),
        { count: 0, revenue: 0, paid: 0, balance: 0 },
      );
    }, [items]);

    const totalRate =
      totals.revenue > 0 ? (totals.paid / totals.revenue) * 100 : 0;

    const columns: DataTableColumn<MonthlyTrendItem>[] = useMemo(
      () => [
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          minSize: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className:
            "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
          cell: (_: any, idx: number) => <span>{idx}</span>,
        },
        {
          key: "month",
          header: t("customers.monthly.month", "Tháng"),
          size: 130,
          minSize: 110,
          enableResizing: true,
          className: "font-semibold text-foreground text-xs",
          cell: (row) => {
            const parts = row.month.split("-");
            return parts.length === 2
              ? `Tháng ${parts[1]}/${parts[0]}`
              : row.month;
          },
        },
        {
          key: "count",
          header: (
            <span className="w-full block text-center">
              {t("customers.monthly.count", "Số vụ việc")}
            </span>
          ),
          size: 90,
          minSize: 80,
          enableResizing: true,
          headerClassName: "text-center",
          className: "text-center font-mono text-xs",
          cell: (row) => <span>{row.count}</span>,
        },
        {
          key: "revenue",
          header: (
            <span className="w-full block text-right">
              {isPayable
                ? t("customers.monthly.cost", "Chi phí")
                : t("customers.monthly.revenue", "Phát sinh")}
            </span>
          ),
          size: 130,
          minSize: 110,
          enableResizing: true,
          headerClassName: "text-right",
          className: "text-right font-mono font-semibold text-xs",
          cell: (row) => <span>{money(row.revenue)}</span>,
        },
        {
          key: "paid",
          header: (
            <span className="w-full block text-right">
              {isPayable
                ? t("customers.monthly.paidCost", "Đã chi")
                : t("customers.monthly.paid", "Đã thu")}
            </span>
          ),
          size: 130,
          minSize: 110,
          enableResizing: true,
          headerClassName: "text-right",
          className:
            "text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs",
          cell: (row) => <span>{money(row.paid)}</span>,
        },
        {
          key: "balance",
          header: (
            <span className="w-full block text-right">
              {isPayable
                ? t("customers.monthly.balanceCost", "Còn phải chi")
                : t("customers.monthly.balance", "Còn nợ")}
            </span>
          ),
          size: 130,
          minSize: 110,
          enableResizing: true,
          headerClassName: "text-right",
          className: "text-right font-mono font-bold text-xs",
          cell: (row) => (
            <span
              className={
                row.balance > 0
                  ? isPayable
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground/60"
              }
            >
              {row.balance > 0 ? money(row.balance) : "—"}
            </span>
          ),
        },
        {
          key: "rate",
          header: (
            <span className="w-full block text-center">
              {t("customers.monthly.rate", "Tỷ lệ")}
            </span>
          ),
          size: 85,
          minSize: 75,
          enableResizing: true,
          headerClassName: "text-center",
          className: "text-center font-mono font-semibold text-xs",
          cell: (row) => {
            const r = row.revenue > 0 ? (row.paid / row.revenue) * 100 : 0;
            return <span>{r.toFixed(1)}%</span>;
          },
        },
      ],
      [isPayable, t],
    );

    const summaryRow: Record<string, React.ReactNode> = useMemo(() => {
      if (items.length === 0) return {};
      return {
        month: (
          <span className="font-bold text-foreground">
            {t("common.totalSummary", "Tổng cộng")} ({items.length}{" "}
            {t("common.monthUnit", "tháng")})
          </span>
        ),
        count: (
          <span className="font-mono font-bold block text-center">
            {totals.count}
          </span>
        ),
        revenue: (
          <span className="font-mono font-bold block text-right">
            {money(totals.revenue)}
          </span>
        ),
        paid: (
          <span className="font-mono font-bold block text-right text-emerald-600 dark:text-emerald-400">
            {money(totals.paid)}
          </span>
        ),
        balance: (
          <span
            className={cn(
              "font-mono font-bold block text-right",
              totals.balance > 0
                ? isPayable
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground/60",
            )}
          >
            {totals.balance > 0 ? money(totals.balance) : "—"}
          </span>
        ),
        rate: (
          <span className="font-mono font-bold block text-center">
            {totalRate.toFixed(1)}%
          </span>
        ),
      };
    }, [items, isPayable, totalRate, totals, t]);

    const getRowActions = useMemo(
      () =>
        onSelectMonth
          ? (row: MonthlyTrendItem) => [
              {
                label: t(
                  "customers.viewMonthDetail",
                  "Xem chi tiết đối soát tháng",
                ),
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => onSelectMonth(row.month),
              },
            ]
          : undefined,
      [onSelectMonth, t],
    );

    if (items.length === 0) return null;

    return (
      <DrawerSection
        title={
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              {t(
                "customers.monthly.title",
                "Chi tiết đối soát theo từng tháng",
              )}{" "}
              ({items.length} {t("common.monthUnit", "tháng")})
            </span>
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        className="p-3 border border-slate-200/80 dark:border-slate-800"
      >
        <div className="w-full">
          <StandardTable
            items={items}
            columns={columns}
            getRowKey={(it) => it.month}
            variant="spreadsheet"
            actions={getRowActions}
            summaryRow={summaryRow}
            hideLegacyActionColumn={true}
            enableRowHoverActions={true}
            containerClassName="w-full"
          />
        </div>
      </DrawerSection>
    );
  },
);

export default CustomerMonthlyTrendTable;
