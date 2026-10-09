import type * as React from "react";

export interface V2FilterChipProps {
  /** Tên cột */
  label: string;
  /** Tóm tắt giá trị đang lọc, vd "3 giá trị", "Từ 01/01" */
  summary?: string;
  icon?: React.ReactNode;
  /** Bấm vào thân chip (nhảy tới card của cột) */
  onClick?: () => void;
  onRemove: () => void;
  className?: string;
}
