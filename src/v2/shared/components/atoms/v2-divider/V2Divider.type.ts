import type * as React from "react";

export interface V2DividerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** vertical (mặc định): vạch đứng trong toolbar; horizontal: vạch ngang */
  orientation?: "vertical" | "horizontal";
}
