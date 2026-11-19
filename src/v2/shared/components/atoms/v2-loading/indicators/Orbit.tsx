import * as React from "react";
import type { IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const OrbitIndicator: React.FC<IndicatorProps> = ({
  size = "md",
  color,
  className,
  ...props
}) => {
  const { width, height } = resolveDimensions(size, 1);
  const strokeColor = color ?? "currentColor";
  const fillColor = color ?? "currentColor";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Quỹ đạo tròn mờ */}
      <circle
        cx="25"
        cy="25"
        r="18"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.35"
      />

      {/* Lõi trung tâm */}
      <circle cx="25" cy="25" r="5" fill={fillColor}>
        <animate
          attributeName="r"
          values="4; 6; 4"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6; 1; 0.6"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Hạt vệ tinh xoay quanh quỹ đạo */}
      <g transform="translate(25 25)">
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="1.2s"
            repeatCount="indefinite"
          />
          <circle cx="18" cy="0" r="3.5" fill={fillColor} />
          {/* Vệt sáng vệ tinh */}
          <circle cx="15" cy="-7" r="2" fill={fillColor} opacity="0.5" />
          <circle cx="10" cy="-13" r="1.2" fill={fillColor} opacity="0.25" />
        </g>
      </g>
    </svg>
  );
};
