import * as React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipProvider,
} from "@/v2/shared/ui/tooltip";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { V2TooltipProps } from "./V2Tooltip.type";

export const V2Tooltip: React.FC<V2TooltipProps> = ({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 6,
  delayDuration = 200,
  disabled = false,
  arrow = true,
  className,
  asChild = true,
}) => {
  const { isMobile } = useViewport();

  // Bỏ qua tooltip nếu bị disabled, nội dung rỗng, hoặc trên màn hình cảm ứng điện thoại
  if (disabled || !content || isMobile) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={className}
        >
          {content}
          {arrow && <TooltipArrow />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
V2Tooltip.displayName = "V2Tooltip";

// Alias tiện dụng cho lập trình viên
export const AppTooltip = V2Tooltip;
