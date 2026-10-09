import type * as React from "react";

export interface V2PanelProps {
  title?: string;
  /** Huy hiệu cạnh tiêu đề (số lượng, trạng thái) */
  badge?: React.ReactNode;
  /** Phần tử bên phải tiêu đề (bộ chuyển, nút) */
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
