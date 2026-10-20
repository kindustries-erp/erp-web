import * as React from "react";

export interface DrawerSectionProps {
  title?: React.ReactNode;
  titleExtra?: React.ReactNode;
  /** Số lượng hiển thị dạng (N) cạnh tiêu đề, ví dụ số dòng của bảng */
  count?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Giới hạn chiều cao theo viewport trên desktop; body tự cuộn bên trong */
  fitViewportHeight?: boolean;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  hideHeader?: boolean;
  hideTitle?: boolean;
}
