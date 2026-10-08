import * as React from "react";
import { RotateCcw, Settings2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import { V2ColumnToggleList } from "./V2ColumnToggle.list";
import type { V2ColumnToggleProps } from "./V2ColumnToggle.type";

export const V2ColumnToggle: React.FC<V2ColumnToggleProps> = ({
  columns,
  onToggle,
  onReorder,
  onReset,
  isCustomized = false,
  className,
}) => {
  const { t } = useV2Translation();

  const content = (
    <div className="flex w-60 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          {t("v2.table.columns", "Cột")}
        </span>
        <V2Button
          variant="ghost"
          size="xs"
          disabled={!isCustomized}
          leftIcon={<RotateCcw className="h-3 w-3" />}
          onClick={onReset}
        >
          {t("v2.table.resetLayout", "Khôi phục")}
        </V2Button>
      </div>
      <V2ColumnToggleList
        columns={columns}
        onToggle={onToggle}
        onReorder={onReorder}
      />
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <V2Button
          variant="ghost"
          size="icon-sm"
          className={className}
          aria-label={t("v2.table.columnSettings", "Tùy chỉnh cột")}
        >
          <Settings2 className="h-4 w-4" />
        </V2Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2">
        {content}
      </PopoverContent>
    </Popover>
  );
};
