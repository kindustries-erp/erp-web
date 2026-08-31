import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

export function useHasPermission(
  collection: ErpResource | string,
  action: ErpAction | string = "read",
): boolean {
  const permissions = useAuthStore((s) => s.effectivePermissions);
  return permissions.some(
    (p) =>
      (p.collection === collection || p.collection === "*") &&
      (p.actions.includes(action) || p.actions.includes("*")),
  );
}

export function useHasAnyPermission(
  collections: Array<ErpResource | string>,
  action: ErpAction | string = "read",
): boolean {
  const permissions = useAuthStore((s) => s.effectivePermissions);
  return permissions.some(
    (p) =>
      ((collections as string[]).includes(p.collection) ||
        p.collection === "*") &&
      (p.actions.includes(action) || p.actions.includes("*")),
  );
}
