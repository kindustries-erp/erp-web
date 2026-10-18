import type * as React from "react";
import type { ColumnValueType } from "@/v2/shared/types/v2-table";

export interface V2FilterCardProps {
  /** Khóa cột; dùng làm id `filter-card-<columnKey>` để cuộn tới */
  columnKey: string;
  title: string;
  valueType: ColumnValueType;
  /** Cột đang có bộ lọc */
  active?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chỉ được render khi card mở */
  children: React.ReactNode;
  className?: string;
}
