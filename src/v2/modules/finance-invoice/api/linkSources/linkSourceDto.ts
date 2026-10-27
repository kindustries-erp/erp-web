/** Dòng đơn mua hàng dùng để ghép nối với hóa đơn (hình dạng backend, không phụ thuộc V1) */
export interface PurchaseOrderLinkDto {
  id: string;
  poNo: string;
  supplierName?: string | null;
  orderDate: string;
  status?: string | null;
}

export interface LinkPageDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Tham số phân trang dùng chung cho các danh sách chọn để ghép nối */
export interface LinkPageQuery {
  page: number;
  pageSize: number;
  search?: string;
}

/** Dòng đơn bán hàng dùng để ghép nối với hóa đơn bán ra */
export interface SalesOrderLinkDto {
  id: string;
  soNo: string;
  customerName?: string | null;
  orderDate: string;
  status?: string | null;
}
