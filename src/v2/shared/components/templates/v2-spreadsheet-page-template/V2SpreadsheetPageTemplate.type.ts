import type * as React from "react";
import type {
  V2TabBarVariant,
  V2TabItemData,
} from "@/v2/shared/components/molecules/v2-tab-bar";

export interface V2SpreadsheetPageTemplateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** Cụm nút bên phải tiêu đề (làm mới, tạo mới, ...) */
  actions?: React.ReactNode;
  tabs?: V2TabItemData[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  /** Giao diện tab trang: pill tối (`header`, mặc định) hoặc gạch chân (`page`) */
  tabVariant?: Extract<V2TabBarVariant, "header" | "page">;
  hideHeader?: boolean;
  /** Vùng nội dung chiếm hết chiều cao còn lại, thường là `V2StandardTable` */
  children: React.ReactNode;
  className?: string;
}
