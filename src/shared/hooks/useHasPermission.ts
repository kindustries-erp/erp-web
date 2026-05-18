import { useAuthStore } from "@/modules/auth/domain/authStore";

/**
 * Returns true when the current session has `action` on `collection`.
 * When effectivePermissions is empty (loading), returns true to avoid
 * hiding items before data is available.
 */
export function useHasPermission(collection: string, action = "read"): boolean {
  return useAuthStore((s) => {
    if (s.effectivePermissions.length === 0) return true;
    return s.effectivePermissions.some(
      (p) => p.collection === collection && p.actions.includes(action),
    );
  });
}

/**
 * Returns true when the current session has `action` on at least one of
 * the given collections.
 */
export function useHasAnyPermission(
  collections: string[],
  action = "read",
): boolean {
  return useAuthStore((s) => {
    if (s.effectivePermissions.length === 0) return true;
    return collections.some((col) =>
      s.effectivePermissions.some(
        (p) => p.collection === col && p.actions.includes(action),
      ),
    );
  });
}
