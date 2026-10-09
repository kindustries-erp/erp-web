import type * as React from "react";

export interface V2PageHeaderProps {
  title: string;
  description?: string;
  /** Icon hiển thị trước tiêu đề, bọc trong V2PageIcon */
  icon?: React.ReactNode;
  /** Cụm nút bên phải (làm mới, tạo mới, ...) */
  actions?: React.ReactNode;
  /** Khóa các tab; mỗi tab có một V2PageToolbarSlot riêng */
  tabKeys?: string[];
  /** Tab đang chọn: chỉ slot của tab này hiển thị */
  activeKey?: string;
  /** Đăng ký DOM của slot toolbar, dùng để portal bảng vào header */
  register?: (key: string, el: HTMLElement | null) => void;
}
