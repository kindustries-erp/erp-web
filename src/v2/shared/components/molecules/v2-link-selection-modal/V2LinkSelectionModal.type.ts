import type * as React from "react";

export interface V2LinkSelectionModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Nội dung: ô tìm kiếm, bảng chọn, phân trang */
  children: React.ReactNode;
  /** Nút phụ bên phải Hủy (ví dụ "Xác nhận" khi chọn nhiều dòng) */
  footerActions?: React.ReactNode;
}
