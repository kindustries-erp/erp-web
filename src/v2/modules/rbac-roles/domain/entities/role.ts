export interface RoleUserSummary {
  id?: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  status?: string;
  icon?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  isSystem?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  users?: RoleUserSummary[] | number;
}

export interface RoleFormValue {
  name: string;
  description: string;
}

export const emptyRoleForm = (): RoleFormValue => ({
  name: "",
  description: "",
});
