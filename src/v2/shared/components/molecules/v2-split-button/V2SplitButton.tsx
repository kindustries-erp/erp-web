import * as React from "react";
import { ChevronDown } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2SplitButtonProps } from "./V2SplitButton.type";

export const V2SplitButton: React.FC<V2SplitButtonProps> = ({
  label,
  icon,
  onClick,
  renderMenu,
  disabled,
  className,
}) => {
  const { t } = useV2Translation();
  const moreLabel = t("v2.table.moreActions", "Thao tác khác");

  if (!renderMenu) {
    return (
      <V2Button
        size="sm"
        onClick={onClick}
        disabled={disabled}
        leftIcon={icon}
        className={cn("shrink-0", className)}
      >
        {label}
      </V2Button>
    );
  }

  if (!onClick) {
    return (
      <>
        {renderMenu(
          <V2Button
            size="sm"
            disabled={disabled}
            leftIcon={icon}
            rightIcon={<ChevronDown className="h-4 w-4 opacity-70" />}
            className={cn("shrink-0", className)}
          >
            {label}
          </V2Button>,
        )}
      </>
    );
  }

  return (
    <div className={cn("flex shrink-0 items-center", className)}>
      <V2Button
        size="sm"
        onClick={onClick}
        disabled={disabled}
        leftIcon={icon}
        className="rounded-r-none border-r-0"
      >
        {label}
      </V2Button>
      <span className="h-8 w-px bg-primary-fg/25" aria-hidden />
      {renderMenu(
        <V2Button
          size="sm"
          disabled={disabled}
          aria-label={moreLabel}
          title={moreLabel}
          className="w-8 rounded-l-none border-l-0 px-0"
        >
          <ChevronDown className="h-4 w-4" />
        </V2Button>,
      )}
    </div>
  );
};
