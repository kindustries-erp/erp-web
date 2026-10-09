import type * as React from "react";
import type {
  V2TabBarVariant,
  V2TabItemData,
} from "@/v2/shared/components/molecules/v2-tab-bar";

/**
 * `tabbed` (mặc định): có tab bar, toolbar của mỗi tab nằm trên header.
 * `fullpage`: không có tab bar, bảng chiếm toàn bộ vùng nội dung; toolbar vẫn trên header.
 */
export type V2SpreadsheetLayout = "tabbed" | "fullpage";

export interface V2TabbedSpreadsheetPageProps {
  /** Bố cục trang, mặc định `tabbed` */
  layout?: V2SpreadsheetLayout;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** Cụm nút bên phải tiêu đề (làm mới, tạo mới, ...) */
  actions?: React.ReactNode;
  tabs?: V2TabItemData[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  /** Giao diện tab trang: gạch chân (`page`, mặc định) hoặc pill tối (`header`) */
  tabVariant?: Extract<V2TabBarVariant, "header" | "page">;
  hideHeader?: boolean;
  /** Vùng nội dung chiếm hết chiều cao còn lại, thường là `V2StandardTable` */
  children: React.ReactNode;
  className?: string;
}
