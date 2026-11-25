import * as React from "react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { cn } from "@/v2/shared/utils/cn";
import { pad2 } from "./V2TimePicker.helper";

interface V2TimeColumnProps {
  label: string;
  values: number[];
  selected?: number;
  isDisabled: (n: number) => boolean;
  onPick: (n: number) => void;
}

const optionClass =
  "h-11 w-full justify-center rounded-md px-0 text-base tabular-nums sm:h-8 sm:text-sm";

/** Một cột chọn (giờ hoặc phút): danh sách cuộn, tự cuộn tới giá trị đang chọn khi mở. */
export const V2TimeColumn: React.FC<V2TimeColumnProps> = ({
  label,
  values,
  selected,
  isDisabled,
  onPick,
}) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    el?.scrollIntoView?.({ block: "center" });
  }, []);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <V2Text variant="caption" color="muted" className="text-center">
        {label}
      </V2Text>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="flex max-h-56 flex-col gap-0.5 overflow-y-auto overscroll-contain pr-1"
      >
        {values.map((n) => {
          const active = n === selected;
          return (
            <V2Button
              key={n}
              type="button"
              role="option"
              aria-selected={active}
              variant={active ? "default" : "ghost"}
              disabled={isDisabled(n)}
              className={cn(
                optionClass,
                active && "bg-primary text-primary-fg hover:bg-primary",
              )}
              onClick={() => onPick(n)}
            >
              {pad2(n)}
            </V2Button>
          );
        })}
      </div>
    </div>
  );
};
V2TimeColumn.displayName = "V2TimeColumn";
