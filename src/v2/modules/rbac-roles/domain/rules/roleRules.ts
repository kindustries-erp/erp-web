import type { Role, RoleFormValue } from "../entities/role";

export const validateRoleForm = (form: RoleFormValue): string | null => {
  if (!form.name.trim()) return "name";
  return null;
};

export const isRoleFormDirty = (
  current: RoleFormValue,
  initial: RoleFormValue,
): boolean =>
  current.name.trim() !== initial.name.trim() ||
  current.description.trim() !== initial.description.trim();

export const canDeleteRole = (role?: Role | null): boolean => {
  if (!role) return false;
  return !role.isSystem;
};

export const isRoleInactive = (status?: string | boolean | null): boolean => {
  if (typeof status === "boolean") return !status;
  return status === "INACTIVE" || status === "false";
};
