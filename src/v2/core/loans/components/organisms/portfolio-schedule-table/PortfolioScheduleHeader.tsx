import React from "react";
import { Download } from "lucide-react";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface PortfolioScheduleHeaderProps {
  title?: string;
  description?: string;
  hasAnyBreakdown: boolean;
  monthsCount: number;
  onExportCsv: () => void;
}

export const PortfolioScheduleHeader: React.FC<
  PortfolioScheduleHeaderProps
> = ({ title, description, hasAnyBreakdown, monthsCount, onExportCsv }) => {
  const { t } = useV2Translation();

  return (
    <div className="p-5 border-b border-border flex flex-wrap justify-between items-center gap-3">
      <div>
        <V2Text as="h3" variant="h3" className="font-semibold text-base">
          {title ||
            t(
              "v2.loans.table.portfolioScheduleTitle",
              "Lịch Trả Nợ Danh Mục Theo Tháng",
            )}
        </V2Text>
        <V2Text variant="caption" className="text-muted-foreground">
          {description ||
            (hasAnyBreakdown
              ? t(
                  "v2.loans.table.portfolioScheduleDesc",
                  "Bấm vào từng tháng để xem chi tiết khoản vay cấu thành",
                )
              : t(
                  "v2.loans.cashflow.tableSubtitle",
                  "Tổng hợp nghĩa vụ trả gốc, lãi và dư nợ còn lại theo từng tháng",
                ))}
        </V2Text>
      </div>
      <div className="flex items-center gap-2">
        <V2Badge variant="outline" className="text-xs font-normal">
          {monthsCount} {t("v2.loans.table.monthsCount", "tháng dự phóng")}
        </V2Badge>
        <V2Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t("v2.loans.table.exportCsv", "Xuất CSV")}
        </V2Button>
      </div>
    </div>
  );
};
PortfolioScheduleHeader.displayName = "PortfolioScheduleHeader";
