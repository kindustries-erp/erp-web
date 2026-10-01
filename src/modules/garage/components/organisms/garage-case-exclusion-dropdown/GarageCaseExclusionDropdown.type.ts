import type React from "react";

export interface GarageCaseExclusionItem {
  id: string;
  soChungTu?: string | null;
  excludeFromReports?: boolean | null;
  excludeFromDebt?: boolean | null;
}

export interface GarageCaseExclusionDropdownProps {
  /** Thông tin vụ việc tại dòng hiện tại */
  caseItem: GarageCaseExclusionItem;
  /** Quyền sửa cấu hình/loại trừ (mặc định true) */
  canUpdate?: boolean;
  /** Callback mở Drawer cấu hình chi tiết */
  onOpenDrawer?: () => void;
  /** ClassName bổ sung */
  className?: string;
}

export interface ExclusionOptionItem {
  key: "excludeFromReports" | "excludeFromDebt";
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  activeBorderClass: string;
  checked: boolean;
}
