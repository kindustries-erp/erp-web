import * as React from "react";
import type { IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const ThreeDotsIndicator: React.FC<IndicatorProps> = ({
  size = "md",
  color,
  className,
  ...props
}) => {
  const { width, height } = resolveDimensions(size, 2.5);
  const fillColor = color ?? "currentColor";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 30"
      xmlns="http://www.w3.org/2000/svg"
      fill={fillColor}
      className={className}
      {...props}
    >
      <circle cx="15" cy="15" r="14">
        <animate
          attributeName="r"
          from="14"
          to="14"
          begin="0s"
          dur="0.8s"
          values="14;8;14"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="0.8s"
          values="1;.3;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="15" r="8" fillOpacity="0.3">
        <animate
          attributeName="r"
          from="8"
          to="8"
          begin="0s"
          dur="0.8s"
          values="8;14;8"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="0.3"
          to="0.3"
          begin="0s"
          dur="0.8s"
          values=".3;1;.3"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="105" cy="15" r="14">
        <animate
          attributeName="r"
          from="14"
          to="14"
          begin="0s"
          dur="0.8s"
          values="14;8;14"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="0.8s"
          values="1;.3;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};
