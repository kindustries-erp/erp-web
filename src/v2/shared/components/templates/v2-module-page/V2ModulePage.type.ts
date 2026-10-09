import type * as React from "react";
import type {
  V2TabBarVariant,
  V2TabItemData,
} from "@/v2/shared/components/molecules/v2-tab-bar";
import type { V2StandardTableProps } from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";

type V2ModuleTabBase = Omit<V2TabItemData, "key" | "content">;

/** Kết quả hook nghiệp vụ của một tab `list` */
export interface V2ModuleListData<T> {
  items: T[];
  total: number;
  loading: boolean;
  /** Có thì khung tự gắn vào nút Làm mới của toolbar (trừ khi toolbar đã có `onRefresh`) */
  refetch?: () => void;
  /** Tổng toàn bộ (mọi trang) theo khóa cột, dùng cho hàng tổng khi bảng ở chế độ server */
  summaries?: Record<string, number>;
}

/**
 * Tab bảng. Module chỉ cần viết `useData`: nhận query hiện tại, trả dữ liệu.
 * Khung giữ query (đồng bộ URL theo khóa tab) và chỉ gọi `useData` khi tab được mở lần đầu.
 */
export interface V2ModuleListTab<T> extends V2ModuleTabBase {
  key: string;
  kind: "list";
  table: Omit<
    V2StandardTableProps<T>,
    "items" | "total" | "loading" | "onQueryChange" | "initialQuery"
  >;
  useData: (query: V2TableQuery) => V2ModuleListData<T>;
  /** Query mặc định của tab; URL ghi đè lên đây */
  initialQuery?: Partial<V2TableQuery>;
  /** Đổi giá trị này thì tab được dựng lại từ đầu (ví dụ đổi pill tab thì về trang 1). Kèm `resetV2TableUrl(key)` để xóa query trên URL */
  resetKey?: string;
}

/** Tab dashboard: khung chỉ render `content` do page truyền vào */
export interface V2ModuleDashboardTab extends V2ModuleTabBase {
  key: string;
  kind: "dashboard";
  content: React.ReactNode;
}

export type V2ModuleTab<T> = V2ModuleListTab<T> | V2ModuleDashboardTab;

export interface V2ModulePageProps<T> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** Cụm nút bên phải tiêu đề (làm mới, tạo mới, ...) */
  actions?: React.ReactNode;
  tabs: V2ModuleTab<T>[];
  /** Tab đang chọn (controlled). Bỏ trống thì khung tự quản lý */
  activeTab?: string;
  /** Tab mở khi URL chưa có tab; mặc định là tab đầu tiên */
  defaultTab?: string;
  onTabChange?: (key: string) => void;
  /** Giữ tab đang mở trên URL (`?tab=`). Mặc định true; tắt trong story/test cần cô lập */
  syncUrl?: boolean;
  tabVariant?: Extract<V2TabBarVariant, "header" | "page">;
  /** Drawer, modal do page quản lý */
  overlays?: React.ReactNode;
  className?: string;
}
