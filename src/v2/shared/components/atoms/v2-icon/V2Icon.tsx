import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2IconProps } from "./V2Icon.type";

/**
 * V2Icon Atom Component
 * Component hiển thị icon chuẩn hóa trong Design System V2.
 * Đóng gói việc render các icon từ V2 atoms và hỗ trợ chuẩn truy cập (a11y).
 */
export const V2Icon = React.forwardRef<SVGSVGElement, V2IconProps>(
  (
    {
      icon: IconComponent,
      size = 16,
      strokeWidth = 2,
      color = "currentColor",
      className,
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      ...props
    },
    ref,
  ) => {
    if (!IconComponent) {
      return null;
    }

    const isHidden = ariaHidden ?? (ariaLabel ? false : true);

    return (
      <IconComponent
        ref={ref}
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        aria-hidden={isHidden}
        aria-label={ariaLabel}
        data-testid="v2-icon"
        className={cn(
          "inline-block shrink-0 align-middle transition-colors duration-150",
          className,
        )}
        {...props}
      />
    );
  },
);

V2Icon.displayName = "V2Icon";
