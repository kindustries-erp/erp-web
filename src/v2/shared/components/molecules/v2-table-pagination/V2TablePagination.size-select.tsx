import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";

interface PageSizeSelectProps {
  value: number;
  options: readonly number[];
  onChange: (size: number) => void;
}

export const V2PageSizeSelect: React.FC<PageSizeSelectProps> = ({
  value,
  options,
  onChange,
}) => {
  const { t } = useV2Translation();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <V2Button
          variant="outline"
          size="xs"
          className="gap-1 rounded-[6px] bg-surface px-2 font-normal tabular-nums"
          aria-label={`${t("v2.table.showRows", "Hiển thị")} ${value} ${t("v2.table.rowsSuffix", "hàng/trang")}`}
        >
          {value}
          <ChevronDown className="h-2.5 w-2.5 text-muted-fg" />
        </V2Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={4}
        className="w-auto min-w-[72px] overflow-hidden rounded-lg p-0"
      >
        {options.map((size) => (
          <V2Button
            key={size}
            variant="ghost"
            className={cn(
              "h-auto w-full justify-between gap-3 rounded-none px-4 py-1.5 text-xs font-normal",
              size === value && "bg-primary/5 font-semibold text-primary",
            )}
            onClick={() => {
              onChange(size);
              setOpen(false);
            }}
          >
            {size}
            {size === value && <Check className="h-3 w-3" />}
          </V2Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
