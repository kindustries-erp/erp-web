// ERP core hiện chưa dùng Directus RBAC.
// Giữ API hook cũ để không vỡ component, nhưng luôn allow.

export function useHasPermission(
  _collection: string,
  _action = "read",
): boolean {
  return true;
}

export function useHasAnyPermission(
  _collections: string[],
  _action = "read",
): boolean {
  return true;
}
