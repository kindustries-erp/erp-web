import type * as React from "react";

export type V2ChatRole = "user" | "assistant";

export interface V2ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Người gửi: `user` căn phải nền primary, `assistant` căn trái nền surface */
  role?: V2ChatRole;
  /** Bỏ nền và padding để chứa nội dung dạng thẻ (bảng, danh sách) */
  plain?: boolean;
}
