import * as React from "react";

export interface V2DropdownItem {
  key?: string;
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
  loading?: boolean;
  preventClose?: boolean;
  hidden?: boolean;
}

export interface V2DropdownGroup {
  groupLabel?: string;
  items: V2DropdownItem[];
  hidden?: boolean;
}

export type V2DropdownEntry = V2DropdownItem | V2DropdownGroup;

export interface V2DropdownProps {
  /** Nút hoặc phần tử kích hoạt Dropdown */
  trigger?: React.ReactNode;
  /** Children đóng vai trò Trigger nếu không truyền prop trigger */
  children?: React.ReactNode;
  /** Danh sách items phẳng hoặc hỗn hợp */
  items?: V2DropdownEntry[];
  /** Danh sách nhóm items (tiện dụng) */
  groups?: V2DropdownGroup[];
  /** Trạng thái mở (Controlled) */
  open?: boolean;
  /** Callback khi trạng thái mở/đóng thay đổi */
  onOpenChange?: (open: boolean) => void;
  /** Canh lề (Desktop): 'start' | 'center' | 'end' */
  align?: "start" | "center" | "end";
  /** Vị trí hiển thị (Desktop): 'top' | 'right' | 'bottom' | 'left' */
  side?: "top" | "right" | "bottom" | "left";
  /** Khoảng cách từ trigger đến dropdown panel (px) */
  sideOffset?: number;
  /** Tiêu đề dropdown (hữu ích cho Mobile Bottom Sheet) */
  title?: React.ReactNode;
  /** ClassName cho Content */
  className?: string;
  /** ClassName cho Trigger */
  triggerClassName?: string;
  /** Chế độ modal */
  modal?: boolean;
}
