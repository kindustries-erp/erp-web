export interface Role {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  admin_access?: boolean;
  app_access?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  createdAt?: string;
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

export enum ErpResource {
  SUPER_ADMIN = "*",
  ADMIN_USERS = "admin_users",
  EMPLOYEES = "employees",
  BUSINESS_PARTNERS = "business_partners",
  PURCHASE_ORDERS = "purchase_orders",
  SALES_ORDERS = "sales_orders",
  INVENTORY_ITEMS = "inventory_items",
  INVENTORY_VOUCHERS = "inventory_vouchers",
  GOODS_RECEIPTS = "goods_receipts",
  GOODS_ISSUES = "goods_issues",
  INVENTORY_ADJUSTMENTS = "inventory_adjustments",
  BOM = "bom",
  PRODUCTION = "production",
  ACTIVITY_LOGS = "activity_logs",
  EMAIL_INGEST = "email_ingest",
  JOURNAL_ENTRIES = "journal_entries",
  GARAGE = "garage",
  ACCOUNTING_CONFIGS = "accounting_configs",
  INVOICES = "invoices",
  SALES_REPORTS = "sales_reports",
  PURCHASING_REPORTS = "purchasing_reports",
  SYS_TAGS = "sys_tags",
  BANK_STATEMENTS = "bank_statements",
  CASH_STATEMENTS = "cash_statements",
  PURCHASE_REQUESTS = "purchase_requests",
  VEHICLES = "vehicles",
  VINFAST = "vinfast",
  PAYMENT_VOUCHERS = "payment_vouchers",
  CASHFLOW_VOUCHERS = "erp_cashflow_vouchers",
}

export enum ErpAction {
  ALL = "*",
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
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
  {
    collection: "bank_statements",
    label: "Ngân hàng (Tài khoản & Sao kê)",
    group: "Tài chính",
  },
  {
    collection: "cash_statements",
    label: "Tiền mặt (Sổ quỹ & Thu chi)",
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
  { collection: "erp_departments", label: "Phòng ban", group: "Nhân sự" },
  { collection: "erp_positions", label: "Chức danh", group: "Nhân sự" },
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
  {
    collection: "sys_tags",
    label: "Tags",
    group: "Hệ thống",
  },
  // Kế toán / Tài chính
  {
    collection: "invoices",
    label: "Hóa đơn",
    group: "Tài chính",
  },
];

export const CRUD_ACTIONS: { action: CrudAction; label: string }[] = [
  { action: "create", label: "Tạo" },
  { action: "read", label: "Xem" },
  { action: "update", label: "Sửa" },
  { action: "delete", label: "Xóa" },
];

export type PermissionMap = Record<string, Record<CrudAction, boolean>>;
