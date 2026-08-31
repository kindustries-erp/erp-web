import type { ListParams } from "@/shared/types/pagination";

/**
 * Global standard cache duration: 1 phút 30 giây (90,000ms)
 * Đảm bảo Zero-latency Tab Switching khi người dùng chuyển đổi qua lại giữa các tab dữ liệu.
 */
export const DEFAULT_STALE_TIME = 90_000;

/**
 * Chuẩn hóa tập trung Enum Query Key cho toàn bộ hệ thống Liouni ERP (erp-web).
 * Bắt buộc sử dụng ErpQueryKey trong toàn bộ useQuery / useMutation / invalidateQueries.
 */
export enum ErpQueryKey {
  // 1. Phân hệ Hóa Đơn Điện Tử (ERP Invoices)
  INVOICES_LIST = "erp-invoices-list",
  INVOICE_ITEMS_LIST = "erp-invoice-items-list",
  INVOICE_DETAIL = "erp-invoice",
  INVOICE_STATS = "erp-invoices-stats",
  INVOICE_DASHBOARD_STATS = "invoice-dashboard-stats",
  INVOICE_PARTNER_LIST = "erp-invoices-partner-list",
  INVOICE_PARTNER_ITEM_LINES = "erp-invoices-partner-item-lines",
  INVOICE_PARTNER_STATS = "erp-invoices-partner-stats",
  INVOICE_EXPORT_HISTORY = "invoice-export-history",
  INVOICE_SMART_NETOFF_SUGGESTIONS = "invoice-smart-netoff-suggestions",
  INVOICE_TRACEABILITY_GRAPH = "erp-invoice-traceability-graph",

  // 2. Phân hệ Phụ Tùng VinFast (Vinfast Parts)
  VINFAST_PARTS_STOCK = "vinfast-parts-stock",
  VINFAST_PARTS_DASHBOARD = "vinfast-parts-dashboard",
  VINFAST_PARTS_TRACKING = "vinfast-parts",
  VINFAST_PARTS_DETAILS = "vinfast-parts-details",
  VINFAST_PARTS_LEDGER = "vinfast-parts-ledger",
  VINFAST_PARTS_STOCK_OPTIONS = "vinfast-parts-stock-options",

  // 3. Phân hệ Tồn Kho & Master Kho (Inventory & Warehouse)
  INVENTORY_ITEMS_LIST = "inventory-items",
  INVENTORY_STOCK_LIST = "operational-list",
  INVENTORY_SERIALS_LIST = "inventory-serials",
  INVENTORY_MASTERS = "inventory-masters",
  INVENTORY_DASHBOARD_STATS = "inventory-dashboard-stats",
  WAREHOUSE_VOUCHERS = "warehouse-vouchers",
  INVENTORY_ADJUSTMENTS = "inventory-adjustments",
  INVENTORY_FLAT_LEDGER = "inventory-flat-ledger",

  // 4. Đối Tác Kinh Doanh & Khách Hàng (Business Partners)
  BUSINESS_PARTNERS_LIST = "business-partners-list",
  BUSINESS_PARTNER_DETAIL = "business-partner",
  BUSINESS_PARTNER_STATS = "business-partner-stats",

  // 5. Ngân Hàng & Sổ Quỹ (Bank Transactions & Cashflow)
  BANK_STATEMENTS = "bank-statements",
  BANK_ACCOUNTS = "bank-accounts",
  CASH_BOOKS = "cash-books",
  CASHFLOW_VOUCHERS = "cashflow-vouchers",
  CASHFLOW_DASHBOARD = "cashflow-dashboard",

  // 6. Kế Toán Sổ Cái (Accounting Core)
  CHART_OF_ACCOUNTS = "chart-of-accounts",
  JOURNAL_ENTRIES = "journal-entries",
  JOURNAL_ENTRY_DETAIL = "journal-entry",

  // 7. Mua Hàng & Bán Hàng (Purchasing & Sales)
  PURCHASE_ORDERS = "purchase-orders",
  PURCHASING_DASHBOARD = "purchasing-dashboard",
  SALES_ORDERS = "sales-orders",
  SALES_DASHBOARD = "sales-dashboard",
  AFTER_SALES = "after-sales",

  // 8. Dịch Vụ Garage (Garage Core)
  GARAGE_CASES = "garage-cases",
  GARAGE_CUSTOMERS = "garage-customers",
  GARAGE_PARTNERS = "garage-partners",
  GARAGE_DASHBOARD = "garage-dashboard",
  GARAGE_OPEX = "operating-expenses",

  // 9. Sản Xuất & Thành Phẩm (Manufacturing & Finished Goods)
  PRODUCTION_ORDERS = "production-orders",
  FINISHED_GOODS = "finished-goods",

  // 10. Hệ Thống & Cấu Hình (System, Branches, RBAC & Tags)
  BRANCHES = "branches",
  USERS = "users",
  ROLES = "roles",
  PERMISSIONS = "permissions",
  SYS_TAGS = "sys-tags",
  CUSTOM_FIELDS_CATEGORIES = "module-config-categories",
  AUDIT_LOGS = "audit-logs",
  COMPANY_PROFILE = "company-profile",
  APP_CONFIG = "app-config",
}

/**
 * Chuẩn hóa Enum cho Scope / Action (phần tử thứ 2 trong queryKey array).
 * Tránh hoàn toàn việc sử dụng chuỗi string tự do ("list", "receipts", "issues", v.v.).
 */
export enum ErpQueryScope {
  LIST = "list",
  DETAIL = "detail",
  RECEIPTS = "receipts",
  ISSUES = "issues",
  UNIFIED = "unified",
  STATS = "stats",
  DASHBOARD = "dashboard",
  OPTIONS = "options",
  LEDGER = "ledger",
  GRAPH = "graph",
  HISTORY = "history",
  SUGGESTIONS = "suggestions",
}

/**
 * Chuẩn hóa phân loại danh mục master kho
 */
export enum InventoryMasterKind {
  UOMS = "uoms",
  ITEM_TYPES = "item-types",
  TRACKING_CATEGORIES = "tracking-categories",
}

export interface InventoryItemListFilters extends ListParams {
  status?: string;
  itemType?: string;
}

export interface WarehouseVoucherListFilters extends ListParams {
  search?: string;
}

export function createInventoryItemsListKey(filters: InventoryItemListFilters) {
  return [
    ErpQueryKey.INVENTORY_ITEMS_LIST,
    ErpQueryScope.LIST,
    normalizeFilters(filters),
  ] as const;
}

export function createInventoryMastersKey(
  kind:
    | InventoryMasterKind
    | "uoms"
    | "item-types"
    | "tracking-categories"
    | string,
  params?: ListParams & { isActive?: boolean },
) {
  return [
    ErpQueryKey.INVENTORY_MASTERS,
    kind,
    normalizeFilters(params ?? {}),
  ] as const;
}

export function createWarehouseReceiptsKey(
  filters: WarehouseVoucherListFilters,
) {
  return [
    ErpQueryKey.WAREHOUSE_VOUCHERS,
    ErpQueryScope.RECEIPTS,
    normalizeFilters(filters),
  ] as const;
}

export function createWarehouseIssuesKey(filters: WarehouseVoucherListFilters) {
  return [
    ErpQueryKey.WAREHOUSE_VOUCHERS,
    ErpQueryScope.ISSUES,
    normalizeFilters(filters),
  ] as const;
}

export interface SalesOrderListFilters extends ListParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  notFullyIssued?: boolean;
  column_search?: string;
  column_filters?: string;
  sortField?: string;
  sortOrder?: string;
}

export function createSalesOrdersKey(filters: SalesOrderListFilters) {
  return [
    ErpQueryKey.SALES_ORDERS,
    ErpQueryScope.LIST,
    normalizeFilters(filters),
  ] as const;
}

export interface AfterSalesListFilters extends ListParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortOrder?: string;
  dealerId?: string;
  column_search?: string;
  column_filters?: string;
}

export function createAfterSalesKey(filters: AfterSalesListFilters) {
  return [
    ErpQueryKey.AFTER_SALES,
    ErpQueryScope.LIST,
    normalizeFilters(filters),
  ] as const;
}

function normalizeFilters<T extends Record<string, unknown>>(filters: T): T {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      )
      .sort(([a], [b]) => a.localeCompare(b)),
  ) as T;
}
