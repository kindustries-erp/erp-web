import * as React from "react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";

export interface PageSizeSectionProps {
  pageSize: number;
  options: readonly number[];
  onSelect: (size: number) => void;
}

export const PageSizeSection: React.FC<PageSizeSectionProps> = ({
  pageSize,
  options,
  onSelect,
}) => {
  const { t } = useV2Translation();
  return (
    <section className="flex flex-col gap-2">
      <V2Text as="h3" variant="label" color="muted" weight="semibold">
        {t("v2.table.rowsPerPage", "Số dòng mỗi trang")}
      </V2Text>
      <div className="grid grid-cols-4 gap-2">
        {options.map((size) => {
          const active = size === pageSize;
          return (
            <V2Button
              key={size}
              type="button"
              variant="outline"
              aria-pressed={active}
              onClick={() => onSelect(size)}
              className={cn(
                "h-11 rounded-xl text-sm tabular-nums shadow-none",
                active
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary hover:bg-primary/15 hover:text-primary"
                  : "border-border/70 bg-card hover:bg-surface/80 text-foreground",
              )}
            >
              {size}
            </V2Button>
          );
        })}
      </div>
    </section>
  );
};
