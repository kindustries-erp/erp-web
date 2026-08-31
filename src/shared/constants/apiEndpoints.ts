/**
 * Chuẩn hóa tập trung Enum URL API Endpoints cho toàn bộ hệ thống Liouni ERP (erp-web).
 * Bắt buộc sử dụng ErpApiEndpoint thay vì viết chuỗi string tự do ("/api/v1/...").
 */
export enum ErpApiEndpoint {
  // 1. Phân hệ Xác thực & Người dùng (Auth & Users)
  AUTH_LOGIN = "/api/v1/auth/login",
  AUTH_LOGOUT = "/api/v1/auth/logout",
  AUTH_REFRESH = "/api/v1/auth/refresh",
  AUTH_ME = "/api/v1/auth/me",
  USERS = "/api/v1/users",
  EMPLOYEES = "/api/v1/employees",

  // 2. Cấu hình Ứng dụng & Tùy chọn Người dùng (App Config & Preferences)
  APP_CONFIG = "/api/v1/app-config",
  USER_PREFERENCES = "/api/v1/users/preferences",
  USER_TABLE_PREFERENCES = "/api/v1/users/preferences/table",
  COMPANY_PROFILE = "/api/v1/company-profile",
  MODULE_CONFIG_CATEGORIES = "/api/v1/module-config/categories",
  MODULE_CONFIG_ATTRIBUTE_DEFS = "/api/v1/module-config/attribute-defs",

  // 3. Phân hệ Hóa Đơn Điện Tử & Thuế (ERP Invoices & Drafts)
  ERP_INVOICES = "/api/v1/erp-invoices-core/invoices",
  ERP_INVOICE_ITEMS = "/api/v1/erp-invoices-core/invoice-items",
  ERP_INVOICE_STATS = "/api/v1/erp-invoices-core/stats",
  ERP_INVOICE_DASHBOARD_STATS = "/api/v1/erp-invoices-core/dashboard-stats",
  ERP_INVOICE_PARTNERS = "/api/v1/erp-invoices-core/partners",
  ERP_INVOICE_EXPORT_EXCEL = "/api/v1/erp-invoices-core/export/excel",
  ERP_INVOICE_IMPORT_XML = "/api/v1/erp-invoices-core/invoices/import-xml",
  ERP_INVOICE_SYNC_GDT = "/api/v1/erp-invoices-core/sync-gdt",
  SINVOICE_DRAFTS = "/api/v1/sinvoice-drafts",
  SINVOICE_DRAFTS_SYNC = "/api/v1/sinvoice-drafts/sync",
  SINVOICE_DRAFTS_COLUMN_OPTIONS = "/api/v1/sinvoice-drafts/column-options",

  // 4. Phân hệ Phụ Tùng VinFast (VinFast Parts & Stock)
  VINFAST_PARTS = "/api/v1/vinfast-parts",
  VINFAST_PARTS_STOCK = "/api/v1/vinfast-parts/stock",
  VINFAST_PARTS_STOCK_OPTIONS = "/api/v1/vinfast-parts/stock/column-options",
  VINFAST_PARTS_DETAILS = "/api/v1/vinfast-parts/details",
  VINFAST_PARTS_LEDGER = "/api/v1/vinfast-parts/ledger",
  VINFAST_PARTS_SYNC = "/api/v1/vinfast-parts/sync",
  VINFAST_PARTS_EXPORT = "/api/v1/vinfast-parts/export",
  VINFAST_PARTS_DASHBOARD = "/api/v1/reports/vinfast-parts-dashboard",

  // 5. Phân hệ Tồn Kho, Master Kho & Serial Định Danh (Inventory & Tracking)
  INVENTORY_ITEMS = "/api/v1/inventory/items",
  INVENTORY_BALANCES = "/api/v1/inventory/balances",
  INVENTORY_OPERATIONAL_STOCK = "/api/v1/inventory/operational-stock",
  INVENTORY_MOVEMENTS = "/api/v1/inventory/movements",
  INVENTORY_FLAT_LEDGER = "/api/v1/inventory/flat-ledger",
  INVENTORY_SERIALS = "/api/v1/inventory/serials",
  INVENTORY_SERIALS_COLUMN_OPTIONS = "/api/v1/inventory/serials/column-options",
  INVENTORY_SERIALS_GENERATE = "/api/v1/inventory/serials/generate",
  INVENTORY_UOM = "/api/v1/inventory/uom",
  INVENTORY_ITEM_TYPES = "/api/v1/inventory/item-types",
  INVENTORY_TRACKING_CATEGORIES = "/api/v1/inventory/tracking-categories",
  WAREHOUSE_VOUCHERS = "/api/v1/warehouse-vouchers",
  WAREHOUSE_RECEIPTS = "/api/v1/warehouse-receipts",
  WAREHOUSE_ISSUES = "/api/v1/warehouse-issues",
  INVENTORY_ADJUSTMENTS = "/api/v1/inventory-adjustments",

  // 6. Phân hệ Sản Xuất & Thành Phẩm Xe (Manufacturing & Finished Goods)
  PRODUCTION_ORDERS = "/api/v1/production/orders",
  BOM = "/api/v1/bom",
  FINISHED_GOODS = "/api/v1/finished-goods",

  // 7. Đối Tác Kinh Doanh & Phân Hệ Mua/Bán Hàng (Partners, Purchasing & Sales)
  BUSINESS_PARTNERS = "/api/v1/business-partners",
  PURCHASE_ORDERS = "/api/v1/purchasing/orders",
  SALES_ORDERS = "/api/v1/sales-orders",
  AFTER_SALES = "/api/v1/after-sales",

  // 8. Ngân Hàng & Sổ Quỹ (Bank Transactions & Cashflow)
  BANK_TRANSACTIONS = "/api/v1/bank-transactions-core/transactions",
  BANK_TRANSACTIONS_COLUMN_OPTIONS = "/api/v1/bank-transactions-core/transactions/column-options",
  BANK_ACCOUNTS = "/api/v1/bank-transactions-core/bank-accounts",
  CASH_BOOKS = "/api/v1/bank-transactions-core/cash-books",
  BANK_STATEMENT_FILES = "/api/v1/bank-transactions-core/statement-files",
  CASHFLOW_VOUCHERS = "/api/v1/cashflow-vouchers",

  // 9. Kế Toán Sổ Cái (Accounting Core)
  CHART_OF_ACCOUNTS = "/api/v1/accounting/chart-of-accounts",
  JOURNAL_ENTRIES = "/api/v1/accounting/journal-entries",

  // 10. Dịch Vụ Garage (Garage Core)
  GARAGE_CASES = "/api/v1/garage/cases",
  GARAGE_SERVICES = "/api/v1/garage/services",
  GARAGE_CUSTOMERS = "/api/v1/garage/customers",
  GARAGE_OPEX = "/api/v1/garage/operating-expenses",
  GARAGE_DASHBOARD = "/api/v1/garage/dashboard",

  // 11. Hệ Thống, RBAC, Tags & Logs (System, RBAC, Audit)
  RBAC_ROLES = "/api/v1/roles",
  RBAC_PERMISSIONS = "/api/v1/permissions",
  SYS_TAGS = "/api/v1/tags",
  BRANCHES = "/api/v1/branches",
  AUDIT_LOGS = "/api/v1/audit-logs",
  ATTACHMENTS = "/api/v1/attachments",
  EMAIL_INBOX = "/api/v1/email/inbox",

  // 12. Báo Cáo & Dashboard Tổng Hợp (Reports & Dashboards)
  DASHBOARD_OVERVIEW = "/api/v1/dashboard-core/overview",
  DASHBOARD_CASHFLOW_FORECAST = "/api/v1/dashboard-core/cashflow-forecast",
  DASHBOARD_INVENTORY = "/api/v1/inventory/dashboard-stats",
  REPORTS_SALES_DASHBOARD = "/api/v1/reports/sales-dashboard",
  REPORTS_PURCHASING_DASHBOARD = "/api/v1/reports/purchasing-dashboard",
}
