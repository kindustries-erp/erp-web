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
  debtType?: "receivables" | "payables";
  selectedLicensePlate?: string | null;
  onSelectVehicle?: (plate: string) => void;
}

export const CustomerVehicleDebtTab = React.memo(
  function CustomerVehicleDebtTab({
    vehicleStats,
    debtType = "receivables",
    selectedLicensePlate,
    onSelectVehicle,
  }: CustomerVehicleDebtTabProps) {
    const { t } = useTranslation(["garage", "common"]);
    const isPayables = debtType === "payables";

    const columns: DataTableColumn<VehicleDebtStat>[] = useMemo(
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
          cell: (_: any, idx: number) => idx,
        },
        {
          key: "licensePlate",
          header: t("customers.drawer.licensePlate", "Biển số xe"),
          size: 160,
          minSize: 130,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => {
            const isSelected =
              Boolean(selectedLicensePlate) &&
              row.licensePlate.trim().toUpperCase() ===
                (selectedLicensePlate || "").trim().toUpperCase();

            return (
              <button
                type="button"
                onClick={() => onSelectVehicle?.(row.licensePlate)}
                className={cn(
                  "inline-flex items-center gap-1.5 font-mono font-bold px-2 py-1 rounded text-xs whitespace-nowrap transition-all text-left",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/40"
                    : "text-foreground bg-muted/60 hover:bg-primary/15 hover:text-primary cursor-pointer",
                )}
                title={t(
                  "customers.drawer.clickToFilterVehicle",
                  "Nhấn để lọc chi tiết phiếu của xe này",
                )}
              >
                <Car
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                />
                <span>{row.licensePlate}</span>
                {isSelected && (
                  <span className="text-[10px] ml-1 opacity-90 font-sans">
                    ({t("common:active", "Đang xem")})
                  </span>
                )}
              </button>
            );
          },
        },
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
        {
          key: "totalRevenue",
          className: "text-right",
          header: isPayables
            ? t("customers.drawer.totalCost", "Tổng chi phí")
            : t("customers.drawer.totalAmount", "Doanh thu hoàn thành"),
          size: 140,
          minSize: 120,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <span className="font-mono text-xs font-semibold block text-right">
              {money(row.totalRevenue)}
            </span>
          ),
        },
        {
          key: "totalPaid",
          className: "text-right",
          header: isPayables
            ? t("customers.drawer.paidPayables", "Đã chi")
            : t("customers.drawer.paidAmount", "Đã thu"),
          size: 130,
          minSize: 115,
          enableResizing: true,
          cell: (row: VehicleDebtStat) => (
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium block text-right">
              {money(row.totalPaid)}
            </span>
          ),
        },
        {
          key: "totalBalance",
          className: "text-right",
          header: isPayables
            ? t("customers.drawer.balancePayables", "Còn phải chi")
            : t("customers.drawer.balanceAmount", "Còn nợ"),
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
      [isPayables, t],
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
