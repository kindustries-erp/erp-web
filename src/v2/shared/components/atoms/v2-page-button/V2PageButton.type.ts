import type { ButtonProps } from "@/v2/shared/ui";

export interface V2PageButtonProps extends Omit<
  ButtonProps,
  "variant" | "size"
> {
  /** Trang hiện tại: nền primary và aria-current="page" */
  active?: boolean;
}
