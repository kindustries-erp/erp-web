import type { ReactNode } from "react";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface V2BreadcrumbProps extends V2BaseProps<HTMLElement> {
  items: V2BreadcrumbItem[];
  separator?: ReactNode;
  /**
   * Chế độ hiển thị trên màn hình nhỏ di động (< sm):
   * - "last-only" (mặc định): chỉ hiện item cuối cùng (màn hình hiện hành), ẩn các cấp cha và separator.
   * - "full": hiện đầy đủ mọi cấp trên cả mobile và desktop.
   */
  mobileMode?: "last-only" | "full";
}
