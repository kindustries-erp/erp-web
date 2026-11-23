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
  /** Chế độ modal của Radix Dialog. Mặc định true. Đặt false khi có drawer/modal/popover con mở chồng lên để không khóa scroll ngoài. */
  modal?: boolean;
  children: React.ReactNode;
}
