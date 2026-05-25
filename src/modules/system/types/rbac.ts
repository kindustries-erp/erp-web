export interface Role {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  admin_access?: boolean;
  app_access?: boolean;
  /** May be a count, an array of user IDs, or user objects from RBAC APIs. */
  users?: number | Array<string | RoleUserSummary>;
}

export interface RoleUserSummary {
  id?: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export type CrudAction = "create" | "read" | "update" | "delete";

export interface PermissionFieldDef {
  field: string;
  name?: string;
  type?: string;
  hidden?: boolean;
  readonly?: boolean;
}

export interface PermissionEditorPayload {
  permission: Permission;
  availableFields: PermissionFieldDef[];
  isAllFields: boolean;
}

export interface Permission {
  id?: string;
  policy?: string;
  collection: string;
  action: CrudAction;
  access: boolean;
  fields?: string[] | "*";
  permissions?: Record<string, unknown> | null;
  validation?: Record<string, unknown> | null;
  presets?: Record<string, unknown> | null;
}

export interface PermissionConfig {
  isAllFields: boolean;
  fields: string[];
  permissions: Record<string, unknown> | null;
  validation: Record<string, unknown> | null;
  presets: Record<string, unknown> | null;
}

export type PermissionConfigMap = Record<
  string,
  Record<CrudAction, PermissionConfig>
>;

export interface SavePermissionsDto {
  permissions: Permission[];
}

export interface CollectionDef {
  collection: string;
  label: string;
  group: string;
}

export const RBAC_COLLECTIONS: CollectionDef[] = [
  // Tài chính
  {
    collection: "payment_vouchers",
    label: "Phiếu thu/chi",
    group: "Tài chính",
  },
  {
    collection: "payment_voucher_attachments",
    label: "Đính kèm chứng từ",
    group: "Tài chính",
  },
  {
    collection: "payment_voucher_approval_logs",
    label: "Nhật ký duyệt phiếu thu/chi",
    group: "Tài chính",
  },
  { collection: "cash_funds", label: "Quỹ tiền mặt", group: "Tài chính" },
  {
    collection: "company_bank_accounts",
    label: "TK NH công ty",
    group: "Tài chính",
  },
  { collection: "erp_branches", label: "Chi nhánh", group: "Tài chính" },
  {
    collection: "erp_chart_of_accounts",
    label: "Sơ đồ tài khoản",
    group: "Tài chính",
  },
  {
    collection: "accounting_accounts",
    label: "Tài khoản kế toán",
    group: "Tài chính",
  },
  {
    collection: "opening_balances",
    label: "Số dư đầu kỳ",
    group: "Tài chính",
  },
  {
    collection: "voucher_numbering_configs",
    label: "Cấu hình số chứng từ",
    group: "Tài chính",
  },
  {
    collection: "partner_ledger_items",
    label: "Công nợ phải thu/phải trả",
    group: "Tài chính",
  },
  {
    collection: "partner_ledger_settlements",
    label: "Bù trừ công nợ",
    group: "Tài chính",
  },
  // Nhân sự
  { collection: "erp_employees", label: "Nhân viên", group: "Nhân sự" },
  { collection: "departments", label: "Phòng ban", group: "Nhân sự" },
  { collection: "positions", label: "Chức danh", group: "Nhân sự" },
  // Đối tác
  { collection: "erp_business_partners", label: "Đối tác", group: "Đối tác" },
  {
    collection: "erp_business_partner_roles",
    label: "Vai trò đối tác",
    group: "Đối tác",
  },
  {
    collection: "erp_business_partner_contacts",
    label: "Liên hệ đối tác",
    group: "Đối tác",
  },
  {
    collection: "erp_business_partner_bank_accounts",
    label: "TK NH đối tác",
    group: "Đối tác",
  },
  // Hệ thống
  {
    collection: "directus_roles",
    label: "Vai trò hệ thống",
    group: "Hệ thống",
  },
];

export const CRUD_ACTIONS: { action: CrudAction; label: string }[] = [
  { action: "create", label: "Tạo" },
  { action: "read", label: "Xem" },
  { action: "update", label: "Sửa" },
  { action: "delete", label: "Xóa" },
];

export type PermissionMap = Record<string, Record<CrudAction, boolean>>;
