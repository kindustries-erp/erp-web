import type * as React from "react";
import type { V2PermissionRequirement } from "@/v2/shared/hooks/useV2HasPermission";

export interface PermissionGuardProps {
  /** Không truyền nghĩa là không đòi quyền */
  permission?: V2PermissionRequirement;
  /** Nội dung thay thế khi thiếu quyền; mặc định là thông báo không đủ quyền */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
