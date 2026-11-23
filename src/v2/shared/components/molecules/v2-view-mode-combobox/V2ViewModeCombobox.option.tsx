import * as React from "react";
import { Check } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { cn } from "@/v2/shared/utils/cn";

export interface V2ViewModeOptionProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

/** Một dòng chọn trong popover, dấu ✓ khi được chọn; dùng chung cho chế độ xem và bộ lọc */
export const V2ViewModeOption: React.FC<V2ViewModeOptionProps> = ({
  active,
  onClick,
  children,
}) => (
  <V2Button
    type="button"
    role="option"
    aria-selected={active}
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={cn(
      "h-7 min-w-0 flex-1 justify-start gap-2 px-2 text-xs",
      active && "font-semibold text-primary",
    )}
  >
    <Check className={cn("h-3.5 w-3.5 shrink-0", !active && "opacity-0")} />
    {children}
  </V2Button>
);
