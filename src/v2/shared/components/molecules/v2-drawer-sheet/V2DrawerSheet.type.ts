import type * as React from "react";
import type { SheetContentProps } from "@/v2/shared/ui/sheet";

export interface V2DrawerSheetProps {
  open: boolean;
  /** Yêu cầu đóng (Esc, bấm nền); đi qua luồng đóng của drawer (có thể hỏi xác nhận) */
  onRequestClose: () => void;
  side: NonNullable<SheetContentProps["side"]>;
  /** Tiêu đề cho trình đọc màn hình (sr-only), do bên gọi đã dịch */
  title: string;
  className?: string;
  style?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  children: React.ReactNode;
}
