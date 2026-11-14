import type * as React from "react";

export interface V2FloatingChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  /** Nhãn của nút nổi mở khung chat */
  launcherLabel: string;
  launcherIcon?: React.ReactNode;
  /** Danh sách tin nhắn (thường là các `V2ChatBubble`) */
  children: React.ReactNode;
  /** Vùng cố định dưới cùng: thanh soạn tin hoặc nút hành động */
  footer?: React.ReactNode;
  /** Giá trị đổi mỗi khi có tin mới để tự cuộn xuống cuối */
  scrollKey?: string | number;
}
