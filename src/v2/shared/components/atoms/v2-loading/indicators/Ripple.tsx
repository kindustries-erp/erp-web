import * as React from "react";
import type { IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const RippleIndicator: React.FC<IndicatorProps> = ({
  size = "md",
  color,
  className,
  ...props
}) => {
  const { width, height } = resolveDimensions(size, 1);
  const strokeColor = color ?? "currentColor";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={strokeColor}
      className={className}
      {...props}
    >
      <circle cx="25" cy="25" r="5" strokeWidth="2.5" opacity="0">
        <animate
          attributeName="r"
          begin="0s"
          dur="1.5s"
          values="4; 22"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.1 0.8 0.3 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          begin="0s"
          dur="1.5s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.1 0.8 0.3 1"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="25" cy="25" r="5" strokeWidth="2.5" opacity="0">
        <animate
          attributeName="r"
          begin="0.75s"
          dur="1.5s"
          values="4; 22"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.1 0.8 0.3 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          begin="0.75s"
          dur="1.5s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.1 0.8 0.3 1"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};
