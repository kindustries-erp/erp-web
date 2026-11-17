import * as React from "react";
import type { IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const GridIndicator: React.FC<IndicatorProps> = ({
  size = "md",
  color,
  className,
  ...props
}) => {
  const { width, height } = resolveDimensions(size, 1);
  const fillColor = color ?? "currentColor";

  const delays = [
    [0.2, 0.4, 0.6],
    [0.4, 0.6, 0.8],
    [0.6, 0.8, 1.0],
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 105 105"
      xmlns="http://www.w3.org/2000/svg"
      fill={fillColor}
      className={className}
      {...props}
    >
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const cx = 12.5 + col * 40;
          const cy = 12.5 + row * 40;
          const begin = `${delays[row][col]}s`;
          return (
            <circle key={`${row}-${col}`} cx={cx} cy={cy} r="12.5">
              <animate
                attributeName="fill-opacity"
                begin={begin}
                dur="1.2s"
                values="1;.2;1"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
          );
        }),
      )}
    </svg>
  );
};
