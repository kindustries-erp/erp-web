import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { v2StackVariants } from "./V2Stack";

export type V2StackElement = "div" | "section";

export interface V2StackProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof v2StackVariants> {
  /** Thẻ HTML gốc: div (mặc định) hoặc section */
  as?: V2StackElement;
}
