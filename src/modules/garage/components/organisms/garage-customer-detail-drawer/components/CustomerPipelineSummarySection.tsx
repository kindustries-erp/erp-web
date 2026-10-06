import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Wrench } from "lucide-react";
import { money } from "@/shared/utils/format";

interface CustomerPipelineSummarySectionProps {
  inProgressCount: number;
  inProgressAmount: number;
}

export const CustomerPipelineSummarySection: React.FC<
  CustomerPipelineSummarySectionProps
> = ({ inProgressCount, inProgressAmount }) => {
  const { t } = useTranslation(["garage", "common"]);

  if (inProgressCount <= 0) return null;

  return (
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
              {inProgressCount} xe
            </span>
          }
        />
        <DrawerRow
          label="Dự thu tạm tính"
          value={
            <span className="font-mono font-bold text-foreground">
              {money(inProgressAmount)}
            </span>
          }
        />
        <div className="text-[11px] text-muted-foreground pt-1 border-t border-amber-500/20">
          * Chưa phát sinh công nợ chính thức cho đến khi hoàn thành nghiệm thu.
        </div>
      </div>
    </DrawerSection>
  );
};
