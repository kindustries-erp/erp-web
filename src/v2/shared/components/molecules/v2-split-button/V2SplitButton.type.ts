import type * as React from "react";

export interface V2SplitButtonProps {
  label: string;
  icon?: React.ReactNode;
  /** Có onClick: nút chính chạy hành động mặc định */
  onClick?: () => void;
  /** Bọc trigger bằng dropdown của consumer (molecule không import molecule khác) */
  renderMenu?: (trigger: React.ReactElement) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}
