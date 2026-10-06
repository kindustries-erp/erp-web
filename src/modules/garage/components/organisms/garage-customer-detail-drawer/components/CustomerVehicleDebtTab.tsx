import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Car } from "lucide-react";
import type { VehicleDebtStat } from "../types";

interface CustomerVehicleDebtTabProps {
  vehicleStats: VehicleDebtStat[];
}

export const CustomerVehicleDebtTab = React.memo(
  function CustomerVehicleDebtTab({
    vehicleStats,
  }: CustomerVehicleDebtTabProps) {
    const { t } = useTranslation(["garage", "common"]);

    const columns: DataTableColumn<VehicleDebtStat>[] = useMemo(
      () => [
        // 1. STT
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          minSize: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className:
            "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
          cell: (_: any, idx: number) => idx + 1,
        },

        // 2. Biển số xe
        {
          key: "licensePlate",
          header: t("customers.drawer.licensePlate", "Biển số xe"),
          size: 150,
          minSize: 130,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-foreground bg-muted/60 px-2 py-1 rounded text-xs whitespace-nowrap">
              <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {row.licensePlate}
            </span>
          ),
        },

        // 3. Số vụ việc
        {
          key: "caseCount",
          className: "text-center",
          header: t("customers.columns.caseCount", "SL Phiếu"),
          size: 90,
          minSize: 80,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <Badge variant="outline" className="font-mono text-xs">
              {row.caseCount}
            </Badge>
          ),
        },

        // 4. Doanh thu hoàn thành
        {
          key: "totalRevenue",
          className: "text-right",
          header: t("customers.drawer.totalAmount", "Doanh thu hoàn thành"),
          size: 140,
          minSize: 120,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <span className="font-mono text-xs font-semibold block text-right">
              {money(row.totalRevenue)}
            </span>
          ),
        },

        // 5. Đã thu
        {
          key: "totalPaid",
          className: "text-right",
          header: t("customers.drawer.paidAmount", "Đã thu"),
          size: 130,
          minSize: 115,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium block text-right">
              {money(row.totalPaid)}
            </span>
          ),
        },

        // 6. Còn nợ
        {
          key: "totalBalance",
          className: "text-right",
          header: t("customers.drawer.balanceAmount", "Còn nợ"),
          size: 130,
          minSize: 115,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <span
              className={cn(
                "font-mono text-xs font-bold block text-right",
                row.totalBalance > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground font-normal",
              )}
            >
              {money(row.totalBalance)}
            </span>
          ),
        },

        // 7. Tuổi nợ cao nhất
        {
          key: "maxAgingDays",
          className: "text-center",
          header: t("customers.drawer.avgAging", "Tuổi nợ max"),
          size: 110,
          minSize: 90,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => {
            if (row.totalBalance <= 0) {
              return (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  0d
                </Badge>
              );
            }
            return (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-mono",
                  row.maxAgingDays > 90
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : row.maxAgingDays > 30
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-slate-500/10 text-muted-foreground border-slate-500/20",
                )}
              >
                {row.maxAgingDays}d
              </Badge>
            );
          },
        },
      ],
      [t],
    );

    return (
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <DataTable
          items={vehicleStats}
          columns={columns}
          emptyLabel={t("customers.empty", "Không có dữ liệu phương tiện")}
          total={vehicleStats.length}
          page={1}
          pageSize={Math.max(10, vehicleStats.length)}
          containerClassName="flex-1 min-h-0 w-full"
        />
      </div>
    );
  },
);
