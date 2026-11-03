import type * as React from "react";
import type { V2ColumnSelectorGroup } from "@/v2/shared/components/molecules/v2-column-selector";

export interface V2ExportExcelDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;

  /** Nhóm cột xuất, ví dụ "Tổng hợp" / "Sổ cái" */
  columnGroups: V2ColumnSelectorGroup[];
  selectedColumns: string[];
  defaultColumns: string[];
  onColumnsChange: (keys: string[]) => void;
  columnsTitle: string;

  historyTitle: string;
  /** Nút làm mới lịch sử, hiển thị cạnh tiêu đề mục lịch sử */
  historyExtra?: React.ReactNode;
  history: React.ReactNode;

  /** Cột phải: điều kiện xuất và nút bắt đầu */
  conditions: React.ReactNode;
}
