import type * as React from "react";

export interface V2RadioCardOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface V2RadioCardGroupProps<T extends string> {
  name: string;
  /** Nhãn nhóm, đọc bởi công nghệ hỗ trợ */
  ariaLabel: string;
  options: V2RadioCardOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}
