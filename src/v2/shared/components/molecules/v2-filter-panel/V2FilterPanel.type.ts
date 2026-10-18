import type * as React from "react";

export interface V2FilterPanelProps {
  /** Số cột đang lọc; > 0 hiện `(N)` và nút xóa tất cả */
  activeCount: number;
  onResetAll: () => void;
  onClose: () => void;
  search: string;
  onSearchChange: (text: string) => void;
  /** Số cột sau khi tìm, hiện ở tiêu đề danh sách */
  columnCount: number;
  /** Vùng chip "Đang lọc" */
  chips?: React.ReactNode;
  /** Bộ lọc tùy biến theo trang (kỳ, tag...) đặt trên danh sách cột */
  extraContent?: React.ReactNode;
  /** Các `V2FilterCard` */
  children: React.ReactNode;
  className?: string;
}
