import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { buildSparklinePoints, toPolylinePoints } from "./V2Sparkline.helper";
import type { V2SparklineProps } from "./V2Sparkline.type";

/** Đường xu hướng nhỏ: đường 2px, chấm cuối 8px có viền màu nền */
export const V2Sparkline: React.FC<V2SparklineProps> = ({
  values,
  color = "currentColor",
  width = 96,
  height = 28,
  ariaLabel,
  className,
}) => {
  const points = buildSparklinePoints(values, width, height);
  if (points.length === 0) return null;
  const last = points[points.length - 1]!;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0 text-muted-foreground", className)}
    >
      <polyline
        points={toPolylinePoints(points)}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill={color}
        stroke="var(--surface, #ffffff)"
        strokeWidth={2}
      />
    </svg>
  );
};
V2Sparkline.displayName = "V2Sparkline";
