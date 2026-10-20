export interface V2TablePaginationProps {
  /** Trang hiện tại (1-based) */
  page: number;
  /** Số dòng mỗi trang */
  pageSize: number;
  /** Tổng số bản ghi */
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Các mốc số dòng/trang (mặc định 20, 50, 100, 200) */
  pageSizeOptions?: readonly number[];
  className?: string;
}
