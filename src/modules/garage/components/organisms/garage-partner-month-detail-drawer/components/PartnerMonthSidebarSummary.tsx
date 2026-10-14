import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { RateBar, MoneyRow } from "./PartnerMonthSidebarRows";
import type {
  PartnerMonthMetrics,
  PartnerClassificationRow,
} from "../GaragePartnerMonthDetailDrawer.type";

interface PartnerMonthSidebarSummaryProps {
  metrics: PartnerMonthMetrics;
  classificationRows: PartnerClassificationRow[];
  debtType: "receivables" | "payables";
}

export const PartnerMonthSidebarSummary: React.FC<
  PartnerMonthSidebarSummaryProps
> = ({ metrics, classificationRows, debtType }) => {
  const isReceipt = debtType === "receivables";

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. Section: Tổng quan Thu tiền / Chi trả */}
      <DrawerSection
        title={isReceipt ? "Tổng quan Thu tiền" : "Tổng quan Chi trả"}
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="flex flex-col gap-2.5">
          <RateBar rate={metrics.rate} isReceipt={isReceipt} />
          <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden bg-background/50 divide-y divide-border/40">
            <MoneyRow
              label={isReceipt ? "Đã thanh toán" : "Đã chi trả"}
              value={metrics.totalPaid}
              valueClass="font-bold text-foreground"
            />
            <MoneyRow
              label={isReceipt ? "Tổng phát sinh" : "Tổng chi phí"}
              value={metrics.totalBilled}
            />
            <MoneyRow
              label={isReceipt ? "Còn phải thu" : "Còn phải chi"}
              value={metrics.totalRemaining}
              valueClass={
                metrics.totalRemaining > 0
                  ? isReceipt
                    ? "text-amber-600 dark:text-amber-400 font-bold"
                    : "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-muted-foreground/60"
              }
            />
            {isReceipt && metrics.revenue > 0 && (
              <MoneyRow
                label="Doanh thu thuần"
                value={metrics.revenue}
                secondary="(chưa VAT)"
              />
            )}
          </div>
        </div>
      </DrawerSection>

      {/* 2. Section: Cơ cấu Thu KH vs Thu BH */}
      {isReceipt && (
        <DrawerSection
          title="Cơ cấu Thu KH vs Thu BH"
          collapsible={true}
          defaultCollapsed={false}
        >
          <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden bg-background/50 divide-y divide-border/40">
            <MoneyRow
              label="Thu Khách hàng"
              value={metrics.customer.billed}
              secondary={`Đã thu ${metrics.customer.rate.toFixed(1)}%`}
            />
            <MoneyRow
              label="Thu Bảo hiểm"
              value={metrics.insurance.billed}
              secondary={`Đã thu ${metrics.insurance.rate.toFixed(1)}%`}
            />
            {metrics.vatWarning.hasWarning && (
              <div className="p-2.5 bg-amber-500/10 border-t border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                VAT chưa xuất HĐ:{" "}
                {money(metrics.vatWarning.totalVatWithoutInvoice)} (
                {metrics.vatWarning.casesCount} vụ việc)
              </div>
            )}
          </div>
        </DrawerSection>
      )}

      {/* 3. Section: Thống kê vụ việc theo phân loại */}
      <DrawerSection
        title="Thống kê vụ việc theo phân loại"
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col p-2.5 rounded-lg border border-border/60 bg-background/50">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">
              Tổng vụ việc
            </span>
            <span className="text-lg font-bold font-mono text-foreground">
              {metrics.caseCount}
            </span>
          </div>
          {classificationRows.map((row) => (
            <div
              key={row.key}
              className="flex flex-col p-2.5 rounded-lg border border-border/60 bg-background/50"
            >
              <span className="text-[10px] text-muted-foreground truncate font-medium">
                {row.name}
              </span>
              <span className="text-lg font-bold font-mono text-foreground">
                {row.caseCount}
              </span>
            </div>
          ))}
        </div>
      </DrawerSection>
    </div>
  );
};
