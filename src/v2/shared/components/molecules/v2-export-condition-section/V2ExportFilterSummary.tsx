import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui/badge";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2ExportFilterSummaryRow } from "./V2ExportConditionSection.type";

export interface V2ExportFilterSummaryProps {
  rows: V2ExportFilterSummaryRow[];
  filterCount: number;
}

export const V2ExportFilterSummary: React.FC<V2ExportFilterSummaryProps> = ({
  rows,
  filterCount,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
      <V2Text variant="label">
        {t("v2.exportExcel.condition.filterSummary", "Tóm tắt bộ lọc bảng")}
      </V2Text>
      <dl className="divide-y divide-border/40 text-[11px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-1"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd
              className="min-w-0 truncate font-medium text-foreground"
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 py-1">
          <dt className="text-muted-foreground">
            {t("v2.exportExcel.condition.filterConditions", "Điều kiện lọc")}
          </dt>
          <dd>
            <Badge variant="outline" className="h-4 px-1.5 py-0 text-[10px]">
              {filterCount > 0
                ? t("v2.exportExcel.condition.filterCount", {
                    defaultValue: "{{count}} điều kiện lọc",
                    count: filterCount,
                  })
                : t("v2.exportExcel.condition.noFilter", "Không có bộ lọc nào")}
            </Badge>
          </dd>
        </div>
      </dl>
    </div>
  );
};
