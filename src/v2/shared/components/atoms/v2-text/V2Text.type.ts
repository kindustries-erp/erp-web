import type { TextProps } from "@/v2/shared/ui";

export interface V2TextProps extends TextProps {
  /** Cắt ngắn văn bản: true = 1 dòng (truncate), 1/2/3 = line-clamp-N */
  truncate?: boolean | 1 | 2 | 3;
  /** Cho phép copy nội dung vào clipboard khi click */
  copyable?: boolean;
  /** Đánh dấu trường bắt buộc (hiển thị dấu * màu đỏ phía sau) */
  required?: boolean;
}
