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
  debtType?: "receivables" | "payables";
  tableIdPrefix: string;
  defaultCollapsed?: boolean;
  isAllTab?: boolean;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
}

export const MonthPartnerCategorizedSection: React.FC<
  MonthPartnerCategorizedSectionProps
> = ({
  title,
  categorized,
  totalBilled = 0,
  debtType = "receivables",
  tableIdPrefix,
  defaultCollapsed = false,
  isAllTab = false,
  onSelectGroup,
  onOpenCaseDetail,
}) => {
  const { t } = useTranslation(["garage", "common"]);
  const isPayable = debtType === "payables";

  const totalAmount = isPayable
    ? (categorized.totals.cost ?? categorized.totals.billed)
    : categorized.totals.billed;

  const titleExtra = useMemo(() => {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground">
          {categorized.all.length} đối tượng • {categorized.totals.caseCount}{" "}
          phiếu
        </span>
        <Badge
          variant="outline"
          className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-foreground"
        >
          {money(totalAmount)}
        </Badge>
      </div>
    );
  }, [categorized.all.length, categorized.totals.caseCount, totalAmount]);

  // 1. Nếu ở tab "Tất cả đối tượng": chỉ hiển thị 1 table tổng hợp duy nhất
  if (isAllTab) {
    return (
      <DrawerSection
        title={title}
        titleExtra={titleExtra}
        collapsible
        defaultCollapsed={defaultCollapsed}
      >
        <MonthInvoicePartnerTable
          items={categorized.all}
          tableId={`${tableIdPrefix}-all`}
          totalBilled={totalBilled}
          debtType={debtType}
          onSelectGroup={onSelectGroup}
          onOpenCaseDetail={onOpenCaseDetail}
        />
      </DrawerSection>
    );
  }

  // 2. Nếu ở các tab con riêng biệt: cấu hình 3 DrawerSection theo trạng thái HĐ
  const subSections = [
    {
      key: "with-invoice",
      title: t("progress.sections.subWithInvoice", "Đã xuất hóa đơn"),
      icon: (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      ),
      items: categorized.withInvoice,
    },
    {
      key: "pending-invoice",
      title: t(
        "progress.sections.subPendingInvoice",
        "Chưa xuất hóa đơn (Có VAT)",
      ),
      icon: (
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      ),
      items: categorized.pendingInvoice,
    },
    {
      key: "no-invoice",
      title: t(
        "progress.sections.subNoInvoice",
        "Không xuất hóa đơn (Không thuế)",
      ),
      icon: <FileMinus className="w-4 h-4 text-slate-500" />,
      items: categorized.noInvoice,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {subSections.map((sec) => {
        const cases = sec.items.reduce(
          (sum, i) => sum + (i.cases?.length || i.caseCount || 0),
          0,
        );
        const secAmount = sec.items.reduce(
          (sum, i) => sum + (isPayable ? (i.cost ?? i.billed) : i.billed),
          0,
        );

        return (
          <DrawerSection
            key={sec.key}
            title={
              <div className="flex items-center gap-1.5">
                {sec.icon}
                <span>{sec.title}</span>
              </div>
            }
            titleExtra={
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground">
                  {sec.items.length} đối tượng • {cases} phiếu
                </span>
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-foreground"
                >
                  {money(secAmount)}
                </Badge>
              </div>
            }
            collapsible
            defaultCollapsed={sec.items.length === 0}
          >
            <MonthInvoicePartnerTable
              items={sec.items}
              tableId={`${tableIdPrefix}-${sec.key}`}
              totalBilled={totalBilled}
              debtType={debtType}
              onSelectGroup={onSelectGroup}
              onOpenCaseDetail={onOpenCaseDetail}
            />
          </DrawerSection>
        );
      })}
    </div>
  );
};
