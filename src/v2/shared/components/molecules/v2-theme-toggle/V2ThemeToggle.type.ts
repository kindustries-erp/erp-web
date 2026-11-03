import type { V2BaseProps } from "@/v2/shared/types";

export interface V2ThemeToggleProps extends V2BaseProps<HTMLButtonElement> {
  /**
   * Trạng thái đang ở Dark Mode hay không.
   * Nếu không truyền, component có thể tự đọc từ document.documentElement hoặc prop.
   */
  isDark?: boolean;
  /**
   * Callback khi người dùng click chuyển đổi theme
   */
  onToggle?: () => void;
  /**
   * Kích thước nút bấm (mặc định: "xs")
   */
  size?: "xs" | "sm" | "md";
  /**
   * Tooltip hiển thị khi hover
   */
  tooltip?: string;
}
