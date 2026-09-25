import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { Building2, Clock, Wrench } from "lucide-react";
import type { CustomerDebtTotals } from "../types";

interface CustomerSidebarSummaryProps {
  customerCode: string | null;
  customerName?: string;
  totals: CustomerDebtTotals;
}

export const CustomerSidebarSummary = React.memo(
  function CustomerSidebarSummary({
    customerCode,
    customerName,
    totals,
  }: CustomerSidebarSummaryProps) {
    const { t } = useTranslation(["garage", "common"]);

    return (
      <div className="space-y-4 w-full">
        {/* Section 1: Thông tin đối tác */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Building2 className="w-4 h-4 text-primary" />
              <span>
                {t("customers.drawer.generalInfo", "Thông tin đối tác")}
              </span>
            </div>
          }
          collapsible={false}
          className="p-3 border border-slate-200/80 dark:border-slate-800"
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
            <DrawerRow
              label={t("customers.columns.caseCount", "SL phiếu hoàn thành")}
              value={
                <span className="font-mono font-semibold">
                  {totals.completedCount}
                </span>
              }
            />
            <DrawerRow
              label={t("partners.vehiclesRegistered", "Số lượng phương tiện")}
              value={
                <span className="font-mono font-semibold">
                  {totals.vehicleCount} xe
                </span>
              }
            />
          </div>
        </DrawerSection>

        {/* Section 2: Phân bổ Tuổi nợ */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                {t("customers.drawer.debtSummary", "Phân tích tuổi nợ (Aging)")}
              </span>
            </div>
          }
          collapsible={false}
          className="p-3 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="space-y-2 text-xs">
            <DrawerRow
              label={
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {t("customers.columns.aging0_30", "0-30 ngày")}
                </span>
              }
              value={
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {money(totals.aging0_30)}
                </span>
              }
            />
            <DrawerRow
              label={
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {t("customers.columns.aging31_60", "31-60 ngày")}
                </span>
              }
              value={
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {money(totals.aging31_60)}
                </span>
              }
            />
            <DrawerRow
              label={
                <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {t("customers.columns.aging61_90", "61-90 ngày")}
                </span>
              }
              value={
                <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                  {money(totals.aging61_90)}
                </span>
              }
            />
            <DrawerRow
              label={
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {t("customers.columns.agingOver90", ">90 ngày")}
                </span>
              }
              value={
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {money(totals.agingOver90)}
                </span>
              }
            />
          </div>
        </DrawerSection>

        {/* Section 3: Xe đang làm tại xưởng (Dự thu) */}
        {totals.inProgressCount > 0 && (
          <DrawerSection
            title={
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Wrench className="w-4 h-4" />
                <span>
                  {t("customers.drawer.tabPipeline", "Xe đang làm (Dự thu)")}
                </span>
              </div>
            }
            collapsible={false}
            className="p-3 border border-amber-500/20 bg-amber-500/5"
          >
            <div className="space-y-2 text-xs">
              <DrawerRow
                label="Số xe đang sửa chữa"
                value={
                  <span className="font-mono font-bold text-amber-600">
                    {totals.inProgressCount} xe
                  </span>
                }
              />
              <DrawerRow
                label="Dự thu tạm tính"
                value={
                  <span className="font-mono font-bold text-foreground">
                    {money(totals.inProgressAmount)}
                  </span>
                }
              />
              <div className="text-[11px] text-muted-foreground pt-1 border-t border-amber-500/20">
                * Chưa phát sinh công nợ chính thức cho đến khi hoàn thành
                nghiệm thu.
              </div>
            </div>
          </DrawerSection>
        )}
      </div>
    );
  },
);
