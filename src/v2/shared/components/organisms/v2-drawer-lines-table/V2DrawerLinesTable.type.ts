import type * as React from "react";

/** Cột của bảng dòng chứng từ trong drawer. Độ rộng tính bằng px; cột `grow` nhận phần còn lại. */
export interface V2DrawerLinesColumn {
  id: string;
  header: React.ReactNode;
  /** Tooltip cho header khi bị cắt bớt */
  headerTitle?: string;
  /** Độ rộng cố định (px). Bỏ qua khi `grow` = true */
  width?: number;
  /** Cột co giãn lấy phần còn lại; `minWidth` làm sàn */
  grow?: boolean;
  minWidth?: number;
  align?: "left" | "center" | "right";
  /** Cho phép xuống dòng (tên, ghi chú). Mặc định: một dòng, cắt bằng ellipsis */
  wrap?: boolean;
}

export interface V2DrawerLinesTableProps<R> {
  ariaLabel: string;
  columns: V2DrawerLinesColumn[];
  rows: R[];
  getRowKey: (row: R, index: number) => string;
  renderCell: (
    column: V2DrawerLinesColumn,
    row: R,
    index: number,
  ) => React.ReactNode;
  /** Ô tổng ở chân bảng theo id cột; các cột trước cột đầu tiên có giá trị gộp vào nhãn */
  footerCells?: Record<string, React.ReactNode>;
  footerLabel?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  /** Chiều cao tối đa của vùng cuộn; header và chân bảng được dính khi cuộn */
  maxHeight?: string;
}

/** Kích thước và căn lề của một cột, dùng trong cấu hình cột của từng bảng dòng */
export type V2DrawerLinesLayout = Pick<
  V2DrawerLinesColumn,
  "width" | "grow" | "minWidth" | "align" | "wrap"
>;
