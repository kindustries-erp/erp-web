import * as React from "react";
import type { IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const TailSpinIndicator: React.FC<IndicatorProps> = ({
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
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient
          x1="8.042%"
          y1="0%"
          x2="65.676%"
          y2="89.244%"
          id="tail-spin-gradient"
        >
          <stop stopColor={strokeColor} stopOpacity="0" offset="0%" />
          <stop stopColor={strokeColor} stopOpacity=".631" offset="63.146%" />
          <stop stopColor={strokeColor} offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)">
          <path
            d="M36 18c0-9.94-8.06-18-18-18"
            id="Oval-2"
            stroke="url(#tail-spin-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.85s"
              repeatCount="indefinite"
            />
          </path>
          <circle fill={strokeColor} cx="36" cy="18" r="1.5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.85s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
};
