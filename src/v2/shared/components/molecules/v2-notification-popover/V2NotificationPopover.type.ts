import type { ReactNode } from "react";
import type { CoreNotification } from "@/core/api/notifications";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2NotificationPopoverProps extends V2BaseProps {
  /**
   * Danh sách thông báo.
   * Nếu để trống (undefined), component sẽ tự động truy vấn từ API qua queryKey ["notifications"].
   */
  notifications?: CoreNotification[];

  /** Trigger phần tử bọc mở Popover */
  children?: ReactNode;

  /** Trigger tùy chọn thay thế cho children */
  trigger?: ReactNode;

  /** Số lượng chưa đọc (dùng hiển thị badge nếu trigger tự quản lý) */
  unreadCount?: number;

  /** Vị trí panel so với trigger (mặc định 'top' trong sidebar) */
  side?: "top" | "right" | "bottom" | "left";

  /** Căn lề panel (mặc định 'start') */
  align?: "start" | "center" | "end";

  /** Khoảng cách cách trigger (px) */
  sideOffset?: number;

  /** Chu kỳ tự làm mới dữ liệu khi tự query (ms, mặc định 30000ms) */
  refetchInterval?: number;

  /** Callback tùy chọn khi click vào một thông báo */
  onNotificationClick?: (notification: CoreNotification) => void;
}
