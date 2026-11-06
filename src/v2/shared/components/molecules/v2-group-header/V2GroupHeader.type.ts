import type * as React from "react";

export type V2GroupHeaderVariant = "badge" | "subtle" | "plain";

export interface V2GroupHeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface V2GroupHeaderProps {
  /** Tiêu đề của group */
  title: string;
  /** Số lượng item trong nhóm (tùy chọn) */
  count?: number | string;
  /** Biến thể hiển thị: 'badge' (mặc định - chuẩn Dashboard), 'subtle', 'plain' */
  variant?: V2GroupHeaderVariant;
  /** Icon hiển thị kèm tiêu đề (tùy chọn) */
  icon?: React.ReactNode;
  /** Ô tìm kiếm/lọc nhanh của nhóm (tùy chọn) */
  search?: V2GroupHeaderSearchProps;
  /** Action hoặc nút bấm bên phải (ví dụ: Chọn nhóm / Bỏ chọn nhóm, link) */
  action?: React.ReactNode;
  /** Có hiển thị đường kẻ divider ngang nối dài bên phải badge hay không (mặc định: true) */
  showDivider?: boolean;
  /** ClassName bổ sung cho container ngoài */
  className?: string;
  /** ClassName bổ sung cho badge tiêu đề */
  badgeClassName?: string;
}
