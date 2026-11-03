export type V2SubtotalVariant = "qty" | "amount" | "count" | "label";

/** `page`: hiển thị subtotal trang hiện tại; `total`: hiển thị tổng toàn bộ trang */
export type V2SubtotalDisplayMode = "page" | "total";

export interface V2SubtotalSummaryCellProps {
  /** Loại số liệu: số lượng, thành tiền, số dòng hoặc nhãn "Tổng cộng" */
  variant: V2SubtotalVariant;
  /** Giá trị của trang hiện tại (hoặc số dòng trang hiện tại nếu variant='label') */
  pageValue?: number;
  /** Tổng toàn bộ (grand total) trên mọi trang (hoặc tổng số dòng nếu variant='label') */
  totalValue?: number;
  /** Nhãn tùy chọn khi variant === 'label', mặc định "Tổng cộng:" */
  label?: string;
  /** Trang hiện tại, mặc định 1 */
  page?: number;
  /** Tổng số trang, mặc định 1 (không phân trang) */
  totalPages?: number;
  /** Lũy kế từ trang 1 đến trang hiện tại; không truyền thì tự tính khi ở trang 1 */
  cumulativeValue?: number;
  /** Chế độ hiển thị trên cell, mặc định `page` */
  displayMode?: V2SubtotalDisplayMode;
  /** Tiêu đề chỉ số trong popover, ví dụ "SL nhập kho" */
  metricTitle?: string;
  /** Đơn vị hiển thị sau số lượng, ví dụ "kg", "SKU", "dòng" */
  unit?: string;
  /** Locale định dạng số, mặc định vi-VN */
  locale?: string;
  className?: string;
}
