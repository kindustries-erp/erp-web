import type * as React from "react";

export interface V2TabPanelProps {
  /** Khóa tab, trùng `key` trong `tabs` của template */
  tabKey: string;
  /** Chỉ mount khi tab được mở lần đầu (mặc định true) */
  lazy?: boolean;
  /** Giữ mounted khi chuyển tab khác, chỉ ẩn bằng CSS (mặc định true) */
  keepAlive?: boolean;
  className?: string;
  children: React.ReactNode;
}
