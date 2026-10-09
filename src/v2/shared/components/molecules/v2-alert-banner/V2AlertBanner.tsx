import * as React from "react";
import { AlertCircle } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type { V2AlertBannerProps } from "./V2AlertBanner.type";

/** Banner lỗi (tone destructive) dùng cho thông báo lỗi trong khối nội dung */
export const V2AlertBanner = React.forwardRef<
  HTMLDivElement,
  V2AlertBannerProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive",
      className,
    )}
    {...props}
  >
    <AlertCircle className="h-5 w-5 shrink-0" />
    <V2Text variant="body-sm" className="font-medium text-destructive">
      {children}
    </V2Text>
  </div>
));
V2AlertBanner.displayName = "V2AlertBanner";
