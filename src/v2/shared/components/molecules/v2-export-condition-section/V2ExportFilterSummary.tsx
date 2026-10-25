import * as React from "react";
import { V2Stack, V2Text } from "@/v2/shared/components/atoms";
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
    <V2Stack
      gap="xs"
      className="rounded-lg border border-border/80 bg-muted/20 p-3"
    >
      <V2Text variant="label">
        {t("v2.exportExcel.condition.filterSummary", "Tóm tắt bộ lọc bảng")}
      </V2Text>
      <V2Stack role="list" className="divide-y divide-border/40">
        {rows.map((row) => (
          <V2Stack
            key={row.label}
            role="listitem"
            className="flex-row items-center justify-between gap-3 py-1"
          >
            <V2Text variant="body-sm" color="muted">
              {row.label}
            </V2Text>
            <V2Text
              variant="body-sm"
              weight="medium"
              truncate
              className="min-w-0"
              title={row.value}
            >
              {row.value}
            </V2Text>
          </V2Stack>
        ))}
        <V2Stack
          role="listitem"
          className="flex-row items-center justify-between gap-3 py-1"
        >
          <V2Text variant="body-sm" color="muted">
            {t("v2.exportExcel.condition.filterConditions", "Điều kiện lọc")}
          </V2Text>
          <Badge variant="outline" className="h-4 px-1.5 py-0 text-[10px]">
            {filterCount > 0
              ? t("v2.exportExcel.condition.filterCount", {
                  defaultValue: "{{count}} điều kiện lọc",
                  count: filterCount,
                })
              : t("v2.exportExcel.condition.noFilter", "Không có bộ lọc nào")}
          </Badge>
        </V2Stack>
      </V2Stack>
    </V2Stack>
  );
};
