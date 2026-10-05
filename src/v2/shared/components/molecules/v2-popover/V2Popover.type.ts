import * as React from "react";

export interface V2PopoverProps {
  /** Nút hoặc phần tử kích hoạt Popover */
  trigger?: React.ReactNode;
  /** Children đóng vai trò Trigger nếu không truyền prop trigger */
  children?: React.ReactNode;
  /** Nội dung hiển thị bên trong Popover */
  content: React.ReactNode;
  /** Trạng thái mở (Controlled) */
  open?: boolean;
  /** Callback khi trạng thái mở/đóng thay đổi */
  onOpenChange?: (open: boolean) => void;
  /** Vị trí hiển thị (Desktop): 'top' | 'right' | 'bottom' | 'left' */
  side?: "top" | "right" | "bottom" | "left";
  /** Canh lề (Desktop): 'start' | 'center' | 'end' */
  align?: "start" | "center" | "end";
  /** Khoảng cách từ trigger đến panel (px) */
  sideOffset?: number;
  /** Bật hiệu ứng kính mờ (glassmorphism) */
  glass?: boolean;
  /** Hiển thị mũi tên arrow chỉ vào trigger */
  arrow?: boolean;
  /** Tiêu đề popover (hữu ích cho Mobile Bottom Sheet) */
  title?: React.ReactNode;
  /** Ẩn nút đóng [X] */
  hideCloseButton?: boolean;
  /** Nhãn aria cho nút đóng */
  closeAriaLabel?: string;
  /** ClassName cho PopoverContent */
  className?: string;
  /** ClassName cho Trigger wrapper */
  triggerClassName?: string;
  /** Chế độ modal chặn tương tác nền */
  modal?: boolean;
}
