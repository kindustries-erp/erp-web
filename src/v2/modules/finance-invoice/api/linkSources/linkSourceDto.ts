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

/** Giao dịch sao kê dùng để cấn trừ; số tiền backend trả về dạng chuỗi */
export interface BankTransactionLinkDto {
  id: string;
  transDate?: string | null;
  referenceNumber?: string | null;
  correspondentName?: string | null;
  debitAmount?: string | number | null;
  creditAmount?: string | number | null;
  netOffAmount?: string | number | null;
}

/** Mức khớp của một gợi ý cấn trừ (theo backend) */
export type NetOffSuggestionBadge =
  | "PERFECT"
  | "HIGH"
  | "LIKELY"
  | "POSSIBLE"
  | "NOTICE_STRONG"
  | "NOTICE";

/** Gợi ý cấn trừ cho một hóa đơn: giao dịch và mức khớp */
export interface NetOffSuggestionDto {
  txn: {
    id: string;
    transDate: string;
    referenceNumber?: string | null;
    correspondentName?: string | null;
    debitAmount: number;
    creditAmount: number;
    remainingAmount: number;
  };
  score: {
    score: number;
    badge: NetOffSuggestionBadge;
  };
}
