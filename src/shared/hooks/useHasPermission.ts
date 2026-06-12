import { useAuthStore } from "@/modules/auth/domain/authStore";

export function useHasPermission(collection: string, action = "read"): boolean {
  const permissions = useAuthStore((s) => s.effectivePermissions);
  return permissions.some(
    (p) =>
      (p.collection === collection || p.collection === "*") &&
      (p.actions.includes(action) || p.actions.includes("*")),
  );
}

export function useHasAnyPermission(
  collections: string[],
  action = "read",
): boolean {
  const permissions = useAuthStore((s) => s.effectivePermissions);
  return permissions.some(
    (p) =>
      (collections.includes(p.collection) || p.collection === "*") &&
      (p.actions.includes(action) || p.actions.includes("*")),
  );
}
