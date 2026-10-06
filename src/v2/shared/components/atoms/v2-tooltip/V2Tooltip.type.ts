import * as React from "react";

export interface V2TooltipProps {
  /** Nội dung tooltip hiển thị (text hoặc ReactNode) */
  content: React.ReactNode;
  /** Phần tử nhận sự kiện hover/focus */
  children: React.ReactNode;
  /** Vị trí hiển thị: 'top' | 'right' | 'bottom' | 'left' (mặc định: 'top') */
  side?: "top" | "right" | "bottom" | "left";
  /** Canh lề: 'start' | 'center' | 'end' (mặc định: 'center') */
  align?: "start" | "center" | "end";
  /** Khoảng cách từ trigger đến panel tooltip (px) (mặc định: 6) */
  sideOffset?: number;
  /** Độ trễ trước khi hiện (ms) (mặc định: 200) */
  delayDuration?: number;
  /** Vô hiệu hóa tooltip */
  disabled?: boolean;
  /** Hiển thị mũi tên arrow chỉ vào trigger (mặc định: true) */
  arrow?: boolean;
  /** ClassName tùy chỉnh cho TooltipContent */
  className?: string;
  /** Cho phép asChild trên trigger */
  asChild?: boolean;
}
