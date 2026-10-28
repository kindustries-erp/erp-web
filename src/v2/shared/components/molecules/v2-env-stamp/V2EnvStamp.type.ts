import type { V2BaseProps } from "@/v2/shared/types";

export interface V2EnvStampProps extends V2BaseProps<HTMLDivElement> {
  /** Cho phép ép môi trường thử nghiệm (dành cho storybook/test) */
  forcedEnv?: string;
  /** Nhãn tùy biến thay thế cho tự động tính toán */
  customLabel?: string;
}
