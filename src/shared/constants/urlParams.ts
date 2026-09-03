/**
 * Chuẩn hóa tập trung Enum URL Query Parameter Keys cho toàn bộ hệ thống Liouni ERP (erp-web).
 * Bắt buộc sử dụng ErpUrlQueryParam thay cho chuỗi string tự do ("tab", "detail", "cf", "sorts", v.v.).
 */
export enum ErpUrlQueryParam {
  // 1. Điều hướng, Tab & Giao diện
  TAB = "tab",
  TAX_TAB = "tax_tab",
  STOCK_TAB = "stock_tab",
  VIEW_MODE = "view_mode",
  VIEW = "view",
  INSTANCE_INDEX = "_i",

  // 2. Bộ lọc bảng & Tìm kiếm nâng cao
  SEARCH = "search",
  STATUS = "status",
  DATE_FROM = "dateFrom",
  DATE_TO = "dateTo",
  PERIOD = "period",
  COLUMN_FILTERS = "cf",
  COLUMN_SEARCH = "cs",

  // 3. Sắp xếp & Phân trang
  SORTS = "sorts",
  SORT_BY = "sortBy",
  SORT_DIR = "sortDir",
  PAGE = "page",
  PAGE_SIZE = "pageSize",
  LIMIT = "limit",

  // 4. Chi tiết & Trạng thái Drawer / Modal
  DETAIL = "detail",
  DRAWER = "drawer",
  DRAWER_MODE = "dmode",
  VIEW_ID = "viewId",

  // 5. Bộ lọc chuyên biệt theo Domain
  SELLER_NAME = "seller_name",
  BUYER_NAME = "buyer_name",
  TAG_ID = "tag_id",
  SUBCATEGORY = "subcat",
  ITEM_TYPE = "itemType",
  TRACKING_POLICY = "trackingPolicy",
  MISSING_SERIAL = "missingSerial",
  VEHICLE_TYPE = "vehicleType",
  PARTNER_TAX_CODE = "partner_tax_code",
}
