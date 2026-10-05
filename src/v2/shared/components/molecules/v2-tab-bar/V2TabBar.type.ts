import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import type { V2BaseProps } from "@/v2/shared/types";

export type V2TabBarVariant = "app" | "header" | "sub" | "button-group";

export interface V2TabItemData {
  /** Định danh của tab (hỗ trợ cả id và key) */
  id?: string;
  key?: string;
  /** Nhãn hiển thị của tab */
  label: React.ReactNode;
  /** Icon hiển thị cạnh nhãn */
  icon?: LucideIcon | React.ReactNode;
  /** Số lượng đếm badge hiển thị cạnh nhãn */
  badgeCount?: number;
  /** Trạng thái vô hiệu hóa tab */
  disabled?: boolean;
  /** Cho phép đóng tab (chỉ dùng cho variant="app") */
  isClosable?: boolean;
  /** Nội dung panel tương ứng của tab */
  content?: React.ReactNode;
  /** Ẩn cột thông tin bên phải khi tab này active */
  hideRightPanel?: boolean;
  /** Hiển thị chấm tròn trạng thái (dot) */
  dot?: boolean;
  /** Màu sắc chấm tròn trạng thái */
  dotColor?: "emerald" | "amber" | "rose" | "primary";
  /** Luôn hiển thị icon ngay cả khi tab không active (dành cho variant="sub") */
  alwaysShowIcon?: boolean;
}

export type V2TabEntry = V2TabItemData;

export interface V2TabBarProps extends V2BaseProps<HTMLElement> {
  /** Danh sách các tab */
  tabs: V2TabItemData[];
  /** Tab đang được chọn (theo id) */
  activeTabId?: string;
  /** Tab đang được chọn (theo key, tương đương activeTabId) */
  activeTabKey?: string;
  /** Callback khi chọn tab (trả về id/key) */
  onTabSelect?: (id: string) => void;
  /** Callback khi chọn tab (tương đương onTabSelect) */
  onTabChange?: (key: string) => void;
  /** Callback khi đóng tab (variant="app") */
  onTabClose?: (id: string) => void;
  /** Biến thể giao diện của tab bar: "app" | "header" | "sub" | "button-group" */
  variant?: V2TabBarVariant;
  /** Cụm nút tiện ích hoặc actions hiển thị bên phải thanh tab */
  extra?: React.ReactNode;
  /** ClassName bổ sung cho container wrapper bên ngoài */
  containerClassName?: string;
  /** Nhãn aria-label hỗ trợ accessibility */
  ariaLabel?: string;
}

export interface TabBarPillViewProps {
  tabs: V2TabItemData[];
  variant: "header" | "button-group" | "sub";
  activeKey: string;
  onSelect: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}
