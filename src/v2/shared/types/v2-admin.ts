/** Định danh các tuyến đường thuộc Cổng Quản trị V2 */
export enum V2AdminRouteId {
  DASHBOARD = "admin-dashboard",
  SALES_REPORTS = "admin-sales-reports",
  INVENTORY_REPORTS = "admin-inventory-reports",
  USERS = "admin-users",
  PERMISSIONS = "admin-permissions",
  AUDIT_LOGS = "admin-audit-logs",
  SETTINGS = "admin-settings",
}

/** Nhóm phân loại điều hướng trên thanh Menu Admin */
export enum V2AdminSectionId {
  OVERVIEW = "admin-overview",
  REPORTS = "admin-reports",
  ACCESS = "admin-access",
  SYSTEM = "admin-system",
}

/** Không gian làm việc của hệ thống ERP V2 */
export enum V2WorkspaceMode {
  OPS = "ops",
  ADMIN = "admin",
}

/** Biến thể màu sắc ngữ cảnh cho thẻ chỉ số KPI */
export enum V2AdminStatVariant {
  DEFAULT = "default",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}

/** Kỳ thời gian lọc số liệu Dashboard */
export enum V2DashboardPeriod {
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}
