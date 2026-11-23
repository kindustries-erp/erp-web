import type * as React from "react";
import type { V2TabComboboxItem } from "@/v2/shared/components/molecules/v2-tab-combobox";

/** Biến thể hiển thị của tiêu đề trang V2 */
export enum V2PageHeaderVariant {
  FLAT = "flat",
  CARD = "card",
}

export interface V2PageHeaderProps {
  title: string;
  description?: string;
  /** Icon hiển thị trước tiêu đề, bọc trong V2PageIcon */
  icon?: React.ReactNode;
  /** Biến thể bố cục tiêu đề (`FLAT` mặc định, `CARD` dạng khung card bo góc) */
  variant?: V2PageHeaderVariant;
  /** Cụm nút bên phải (làm mới, tạo mới, ...) */
  actions?: React.ReactNode;
  /** Khóa các tab; mỗi tab có một V2PageToolbarSlot riêng */
  tabKeys?: string[];
  /** Tab đang chọn: chỉ slot của tab này hiển thị */
  activeKey?: string;
  /** Đăng ký DOM của slot toolbar, dùng để portal bảng vào header */
  register?: (key: string, el: HTMLElement | null) => void;
  /** Tab trang trên mobile (nếu có): render V2TabCombobox ngay trước actions */
  pageTabs?: V2TabComboboxItem[];
  /** Khóa tab trang đang kích hoạt */
  activePageTab?: string;
  /** Callback chuyển tab trang */
  onPageTabSelect?: (key: string) => void;
}
