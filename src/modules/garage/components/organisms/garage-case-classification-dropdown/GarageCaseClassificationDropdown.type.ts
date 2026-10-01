import type React from "react";
import type { CategoryObject } from "../../GarageCaseClassificationBadge";

export interface GarageCaseClassificationItem {
  id: string;
  soChungTu?: string | null;
  classification?: string | null;
  categoryId?: string | null;
  category?: CategoryObject | null;
  excludeFromReports?: boolean;
  excludeFromDebt?: boolean;
}

export interface GarageCaseClassificationDropdownProps {
  /** Thông tin vụ việc tại dòng hiện tại */
  caseItem: GarageCaseClassificationItem;
  /** Quyền sửa phân loại (nếu false sẽ hiển thị view-only hoặc mở drawer) */
  canUpdate?: boolean;
  /** Callback khi người dùng muốn mở Drawer chi tiết để cấu hình sâu */
  onOpenDrawer?: () => void;
  /** ClassName bổ sung cho component */
  className?: string;
}

export interface ClassificationOptionItem {
  id: string;
  code: string | null;
  categoryId: string | null;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  isUnclassified?: boolean;
}
