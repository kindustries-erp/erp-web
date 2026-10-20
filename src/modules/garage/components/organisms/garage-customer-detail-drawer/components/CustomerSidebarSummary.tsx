import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Building2 } from "lucide-react";
import { CustomerKpiSummaryCards } from "./CustomerKpiSummaryCards";
import type { CustomerDebtTotals } from "../types";

interface CustomerSidebarSummaryProps {
  customerCode: string | null;
  customerName?: string;
  totals: CustomerDebtTotals;
  customerOverallTotals?: CustomerDebtTotals;
  selectedLicensePlate?: string | null;
  debtType?: "receivables" | "payables";
}

export const CustomerSidebarSummary = React.memo(
  function CustomerSidebarSummary({
    customerCode,
    customerName,
    totals,
    customerOverallTotals,
    selectedLicensePlate,
    debtType = "receivables",
  }: CustomerSidebarSummaryProps) {
    const { t } = useTranslation(["garage", "debts", "common"]);
    const isFilteredVehicle = Boolean(
      selectedLicensePlate && selectedLicensePlate !== "ALL",
    );

    return (
      <div className="space-y-4 w-full">
        {/* Section 1: Thông tin khách hàng */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Building2 className="w-4 h-4 text-primary" />
              <span>
                {t("customers.drawer.generalInfo", "Thông tin khách hàng")}
              </span>
            </div>
          }
          collapsible
          defaultCollapsed={false}
        >
          <div className="space-y-2 text-xs">
            <DrawerRow
              label={t("customers.columns.customerCode", "Mã khách hàng")}
              value={
                <Badge variant="outline" className="font-mono">
                  {customerCode || "KH_LE"}
                </Badge>
              }
            />
            <DrawerRow
              label={t("customers.columns.customerName", "Tên khách hàng")}
              value={
                <span className="font-medium text-foreground">
                  {customerName || "Khách lẻ"}
                </span>
              }
            />
            {isFilteredVehicle && (
              <DrawerRow
                label={t(
                  "customers.columns.licensePlate",
                  "Biển số xe đang xem",
                )}
                value={
                  <Badge
                    variant="secondary"
                    className="font-mono font-bold text-primary bg-primary/10 border-primary/20"
                  >
                    {selectedLicensePlate}
                  </Badge>
                }
              />
            )}
            <DrawerRow
              label={
                isFilteredVehicle
                  ? t("customers.vehicleCompletedCases", "SL phiếu xe này")
                  : t("customers.columns.caseCount", "SL phiếu hoàn thành")
              }
              value={
                <span className="font-mono font-semibold">
                  {totals.completedCount}
                  {isFilteredVehicle &&
                    customerOverallTotals &&
                    customerOverallTotals.completedCount !==
                      totals.completedCount && (
                      <span className="text-[11px] font-normal text-muted-foreground ml-1">
                        / {customerOverallTotals.completedCount}{" "}
                        {t("customers.totalOfAll", "tổng")}
                      </span>
                    )}
                </span>
              }
            />
            <DrawerRow
              label={t("partners.vehiclesRegistered", "Số lượng phương tiện")}
              value={
                <span className="font-mono font-semibold">
                  {(customerOverallTotals || totals).vehicleCount} xe
                </span>
              }
            />
          </div>
        </DrawerSection>

        {/* Section 2: Chỉ số công nợ & Thu hồi */}
        <CustomerKpiSummaryCards totals={totals} debtType={debtType} />
      </div>
    );
  },
);
