import { useCallback } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";

export interface V2PermissionRequirement {
  collection: string;
  /** Mặc định `read` */
  action?: string;
}

interface PermissionLike {
  collection: string;
  actions: string[];
}

/** Không có `requirement` nghĩa là không đòi quyền: luôn được phép */
export const hasV2Permission = (
  permissions: PermissionLike[],
  requirement?: V2PermissionRequirement,
): boolean => {
  if (!requirement) return true;
  const action = requirement.action ?? "read";
  return permissions.some(
    (p) =>
      (p.collection === requirement.collection || p.collection === "*") &&
      (p.actions.includes(action) || p.actions.includes("*")),
  );
};

export function useV2HasPermission(
  requirement?: V2PermissionRequirement,
): boolean {
  const permissions = useAuthStore((s) => s.effectivePermissions);
  return hasV2Permission(permissions, requirement);
}

/** Trả về hàm kiểm tra quyền, dùng khi cần lọc một danh sách (menu, tab) */
export function useV2PermissionChecker(): (
  requirement?: V2PermissionRequirement,
) => boolean {
  const permissions = useAuthStore((s) => s.effectivePermissions);
  return useCallback(
    (requirement?: V2PermissionRequirement) =>
      hasV2Permission(permissions, requirement),
    [permissions],
  );
}
