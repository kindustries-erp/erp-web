import * as React from "react";
import { Badge } from "@/v2/shared/ui";
import { V2BadgeProps } from "./V2Badge.type";

export const V2Badge: React.FC<V2BadgeProps> = ({
  variant,
  size,
  className,
  children,
  ...props
}) => {
  return (
    <Badge
      variant={variant as any}
      size={size as any}
      className={className}
      {...props}
    >
      {children}
    </Badge>
  );
};

V2Badge.displayName = "V2Badge";
