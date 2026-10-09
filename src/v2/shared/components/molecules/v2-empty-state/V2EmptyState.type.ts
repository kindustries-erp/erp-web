import type * as React from "react";

export interface V2EmptyStateProps {
  icon?: React.ReactNode;
  /** Mặc định là "Chưa có dữ liệu" */
  title?: string;
  description?: string;
  /** Nút hoặc liên kết hành động, ví dụ "Tạo mới" */
  action?: React.ReactNode;
  className?: string;
}
