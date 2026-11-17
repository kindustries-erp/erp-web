import * as React from "react";
import type { IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const PulseBarsIndicator: React.FC<IndicatorProps> = ({
  size = "md",
  color,
  className,
  ...props
}) => {
  const { width, height } = resolveDimensions(size, 1);
  const fillColor = color ?? "currentColor";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 55 80"
      xmlns="http://www.w3.org/2000/svg"
      fill={fillColor}
      className={className}
      {...props}
    >
      <g transform="matrix(1 0 0 -1 0 80)">
        <rect width="10" height="20" rx="3">
          <animate
            attributeName="height"
            begin="0s"
            dur="1s"
            values="20;75;20"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="15" width="10" height="40" rx="3">
          <animate
            attributeName="height"
            begin="0.15s"
            dur="1s"
            values="20;75;20"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="30" width="10" height="60" rx="3">
          <animate
            attributeName="height"
            begin="0.3s"
            dur="1s"
            values="20;75;20"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="45" width="10" height="30" rx="3">
          <animate
            attributeName="height"
            begin="0.45s"
            dur="1s"
            values="20;75;20"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
      </g>
    </svg>
  );
};
