import type * as React from "react";
import type { V2BaseProps } from "@/v2/shared/types";
import type { V2MobileTabMode } from "@/v2/shared/types";
import type { V2TabComboboxItem } from "@/v2/shared/components/molecules/v2-tab-combobox";

export type V2PageLayoutTabItem = V2TabComboboxItem;

export interface V2PageLayoutProps extends Omit<
  V2BaseProps<HTMLDivElement>,
  "title"
> {
  /** Tiêu đề trang */
  title: React.ReactNode;
  /** Mô tả ngắn dưới tiêu đề (ẩn trên mobile để tiết kiệm diện tích) */
  desc?: React.ReactNode;
  /** Icon đại diện cho trang */
  icon?: React.ReactNode;
  /** Cụm nút thao tác (Làm mới, Thao tác, Thêm mới...) */
  actions?: React.ReactNode;
  /** Nội dung nằm giữa header và tabs (ví dụ filter bar) */
  middleContent?: React.ReactNode;
  /** Danh sách tabs */
  tabs?: V2PageLayoutTabItem[];
  /** Tab hiện đang active */
  activeTab?: string;
  /** Callback khi người dùng chuyển tab */
  onTabChange?: (value: string) => void;
  /** Kiểu hiển thị tab: "underline" (mặc định) hoặc "pill" */
  tabVariant?: "underline" | "pill";
  /** Chế độ tab trên mobile: DROPDOWN (mặc định) hoặc SCROLL */
  mobileTabMode?: V2MobileTabMode | `${V2MobileTabMode}`;
  /** Ẩn dải tab */
  hideTabs?: boolean;
  /** Ẩn toàn bộ header (dùng cho view lồng nhau) */
  hideHeader?: boolean;
  /** Nội dung chính của trang */
  children: React.ReactNode;
}
