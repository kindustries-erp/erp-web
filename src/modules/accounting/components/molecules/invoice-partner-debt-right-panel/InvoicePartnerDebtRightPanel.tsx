import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { InvoicePartnerDebtRightPanelProps } from "./InvoicePartnerDebtRightPanel.type";

export const InvoicePartnerDebtRightPanel = React.memo(
  function InvoicePartnerDebtRightPanel({
    resolvedName,
    taxCode,
    isCustomer,
    partnerAddress,
    totals,
    invoicesCount,
  }: InvoicePartnerDebtRightPanelProps) {
    const { t } = useTranslation(["debts", "common"]);

    return (
      <div className="space-y-3 pb-3">
        {/* SECTION 1: THÔNG TIN ĐỐI TÁC */}
        <DrawerSection
          title={t("debts:drawer.partnerInfoTitle", "Thông tin đối tác")}
          collapsible
          defaultCollapsed={false}
        >
          <DrawerRow
            label={t("debts:drawer.partnerName", "Tên đối tác")}
            value={resolvedName}
            cls="font-medium text-foreground"
          />
          <DrawerRow
            label={t("debts:drawer.taxCode", "Mã số thuế / MST")}
            value={
              taxCode === "KHONG_MST" || !taxCode ? "— (Không có MST)" : taxCode
            }
            cls="font-mono text-primary font-medium"
          />
          <DrawerRow
            label={t("debts:columns.partnerName", "Phân loại")}
            value={
              <Badge variant="outline" className="font-normal text-xs">
                {isCustomer
                  ? t("debts:tabs.customers", "Khách hàng")
                  : t("debts:tabs.suppliers", "Nhà cung cấp")}
              </Badge>
            }
          />
          <DrawerRow
            label={t("debts:drawer.address", "Địa chỉ")}
            value={partnerAddress || "—"}
          />
        </DrawerSection>

        {/* SECTION 2: TỔNG QUAN TÀI CHÍNH & KPI CÔNG NỢ */}
        <DrawerSection
          title={t(
            "debts:drawer.financialKpiTitle",
            "Tổng quan tài chính & Công nợ",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* KPI 1: Tổng tiền HĐ */}
            <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t("debts:drawer.kpiTotalAmount", "Tổng tiền HĐ")}</span>
                <FileText className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-sm font-bold font-mono text-foreground truncate">
                {money(totals.totalRevenue)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {invoicesCount} {t("debts:unitInvoice", "hóa đơn")}
              </div>
            </div>

            {/* KPI 2: Đã thanh toán */}
            <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {isCustomer
                    ? t("debts:received", "Đã thu")
                    : t("debts:paid", "Đã trả")}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 truncate">
                {money(totals.totalPaid)}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                {totals.recoveryRate}% hoàn tất
              </div>
            </div>

            {/* KPI 3: Còn nợ */}
            <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t("debts:drawer.balanceAmount", "Còn nợ")}</span>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              </div>
              <div
                className={cn(
                  "text-sm font-bold font-mono truncate",
                  totals.totalBalance > 0
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {money(totals.totalBalance)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {totals.totalBalance > 0 ? "Cần đối soát" : "Đã tất toán"}
              </div>
            </div>

            {/* KPI 4: Tuổi nợ cao nhất */}
            <div className="bg-card border rounded-lg p-2.5 shadow-sm space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t("debts:drawer.kpiMaxAging", "Tuổi nợ max")}</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-sm font-bold font-mono text-amber-800 dark:text-amber-300">
                {totals.maxAging} ngày
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {totals.maxAging > 90
                  ? ">90 ngày"
                  : totals.maxAging > 60
                    ? "61-90 ngày"
                    : totals.maxAging > 30
                      ? "31-60 ngày"
                      : "0-30 ngày"}
              </div>
            </div>
          </div>

          {/* Phân bổ nợ theo thời hạn */}
          <div className="space-y-1.5 pt-1.5 border-t border-border/60">
            <div className="text-[11px] font-semibold text-muted-foreground mb-1">
              Phân bổ nợ theo thời hạn:
            </div>
            <DrawerRow
              label="0 - 30 ngày (Trong hạn)"
              value={
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {money(totals.aging0_30)}
                </span>
              }
            />
            <DrawerRow
              label="31 - 60 ngày (Cần theo dõi)"
              value={
                <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                  {money(totals.aging31_60)}
                </span>
              }
            />
            <DrawerRow
              label="61 - 90 ngày (Quá hạn)"
              value={
                <span className="font-mono text-orange-600 dark:text-orange-400 font-medium">
                  {money(totals.aging61_90)}
                </span>
              }
            />
            <DrawerRow
              label="> 90 ngày (Quá hạn nghiêm trọng)"
              value={
                <span className="font-mono text-destructive font-semibold">
                  {money(totals.agingOver90)}
                </span>
              }
            />
          </div>
        </DrawerSection>
      </div>
    );
  },
);
