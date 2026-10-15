import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { MonthInvoicePartnerTable } from "./MonthInvoicePartnerTable";
import type {
  MonthlyReceivablesGroupCategorized,
  MonthlyReceivablesGroupItem,
} from "../../../../api/garageDashboardApi";
import { CheckCircle2, AlertTriangle, FileMinus } from "lucide-react";

export interface MonthPartnerCategorizedSectionProps {
  title: string;
  categorized: MonthlyReceivablesGroupCategorized;
  totalBilled?: number;
  tableIdPrefix: string;
  defaultCollapsed?: boolean;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
}

export const MonthPartnerCategorizedSection: React.FC<
  MonthPartnerCategorizedSectionProps
> = ({
  title,
  categorized,
  totalBilled = 0,
  tableIdPrefix,
  defaultCollapsed = false,
  onSelectGroup,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  const titleExtra = useMemo(() => {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground">
          {categorized.all.length} đối tượng • {categorized.totals.caseCount} vụ
          việc
        </span>
        <Badge
          variant="outline"
          className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-foreground"
        >
          {money(categorized.totals.billed)}
        </Badge>
      </div>
    );
  }, [
    categorized.all.length,
    categorized.totals.caseCount,
    categorized.totals.billed,
  ]);

  return (
    <DrawerSection
      title={title}
      titleExtra={titleExtra}
      collapsible
      defaultCollapsed={defaultCollapsed}
    >
      <div className="flex flex-col gap-4">
        {/* 1. Đã xuất hóa đơn */}
        {categorized.withInvoice.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-xs text-foreground">
                  {t("progress.sections.subWithInvoice", "Đã xuất hóa đơn")}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                >
                  {categorized.withInvoice.length} đối tượng
                </Badge>
              </div>
            </div>
            <MonthInvoicePartnerTable
              items={categorized.withInvoice}
              tableId={`${tableIdPrefix}-with-invoice`}
              totalBilled={totalBilled}
              onSelectGroup={onSelectGroup}
            />
          </div>
        )}

        {/* 2. Chưa xuất hóa đơn (Có VAT) */}
        {categorized.pendingInvoice.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.03]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-xs text-foreground">
                  {t(
                    "progress.sections.subPendingInvoice",
                    "Chưa xuất hóa đơn (Có VAT)",
                  )}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40 font-bold"
                >
                  {categorized.pendingInvoice.length} đối tượng cần xuất HĐ
                </Badge>
              </div>
            </div>
            <MonthInvoicePartnerTable
              items={categorized.pendingInvoice}
              tableId={`${tableIdPrefix}-pending-invoice`}
              totalBilled={totalBilled}
              onSelectGroup={onSelectGroup}
            />
          </div>
        )}

        {/* 3. Không xuất hóa đơn */}
        {categorized.noInvoice.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-border/60 bg-slate-500/[0.02]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <FileMinus className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-xs text-foreground">
                  {t(
                    "progress.sections.subNoInvoice",
                    "Không xuất hóa đơn (Không thuế)",
                  )}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground border-border"
                >
                  {categorized.noInvoice.length} đối tượng
                </Badge>
              </div>
            </div>
            <MonthInvoicePartnerTable
              items={categorized.noInvoice}
              tableId={`${tableIdPrefix}-no-invoice`}
              totalBilled={totalBilled}
              onSelectGroup={onSelectGroup}
            />
          </div>
        )}

        {/* Trường hợp cả 3 nhóm đều không có items */}
        {categorized.all.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
            {t("progress.partnerTableEmpty", "Không có đối tượng hóa đơn")}
          </div>
        )}
      </div>
    </DrawerSection>
  );
};
