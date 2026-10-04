import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2NavIconProps } from "./V2NavIcon.type";

export const V2NavIcon: React.FC<V2NavIconProps> = ({
  icon: Icon,
  isActive = false,
  className,
  size = 20,
}) => {
  return (
    <span
      data-testid="v2-nav-icon"
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors duration-150",
        isActive
          ? "text-primary"
          : "text-muted-foreground group-hover:text-foreground",
        className,
      )}
    >
      <Icon size={size} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
    </span>
  );
};
