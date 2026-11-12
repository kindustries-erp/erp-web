import type * as React from "react";
import { V2PageHeaderVariant } from "@/v2/shared/components/molecules/v2-page-header";
import {
  V2TabBarVariant,
  type V2TabItemData,
} from "@/v2/shared/components/molecules/v2-tab-bar";
import type { V2StandardTableProps } from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2SummaryMetric, V2TableQuery } from "@/v2/shared/types/v2-table";
import type { V2TabComboboxItem } from "@/v2/shared/components/molecules/v2-tab-combobox";

/** Biến thể tổng thể của trang module V2 (preset Header + TabBar) */
export enum V2ModulePageVariant {
  DEFAULT = "default",
  CARD = "card",
}

/** Biến thể thanh tab dùng được trong trang module V2 */
export enum V2ModulePageTabVariant {
  HEADER = "header",
  PAGE = "page",
  PILL = "pill",
}

export const V2_MODULE_PAGE_HEADER_VARIANTS = [
  V2PageHeaderVariant.FLAT,
  V2PageHeaderVariant.CARD,
] as const;

export const V2_MODULE_PAGE_TAB_VARIANTS = [
  V2ModulePageTabVariant.HEADER,
  V2ModulePageTabVariant.PAGE,
  V2ModulePageTabVariant.PILL,
] as const;

export const V2_MODULE_PAGE_TAB_TO_BAR_VARIANT: Record<
  V2ModulePageTabVariant,
  V2TabBarVariant
> = {
  [V2ModulePageTabVariant.HEADER]: V2TabBarVariant.HEADER,
  [V2ModulePageTabVariant.PAGE]: V2TabBarVariant.PAGE,
  [V2ModulePageTabVariant.PILL]: V2TabBarVariant.PILL,
};

type V2ModuleTabBase = Omit<V2TabItemData, "key" | "content">;

/** Kết quả hook nghiệp vụ của một tab `list` */
export interface V2ModuleListData<T> {
  items: T[];
  total: number;
  loading: boolean;
  /** Có thì khung tự gắn vào nút Làm mới của toolbar (trừ khi toolbar đã có `onRefresh`) */
  refetch?: () => void;
  /**
   * Số liệu tổng theo khóa cột (theo `summary_keys` đã gửi). `null` = API không tính được key đó.
   * Dùng cho hàng tổng khi bảng ở chế độ server.
   */
  summaries?: Record<string, V2SummaryMetric | null>;
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
  /** Preset bố cục tổng thể (`DEFAULT`: phẳng + tab gạch chân; `CARD`: header card + pill tabs) */
  variant?: V2ModulePageVariant;
  /** Ghi đè biến thể Header (`FLAT` | `CARD`) */
  headerVariant?: V2PageHeaderVariant;
  /** Ghi đè biến thể thanh tab (`HEADER` | `PAGE` | `PILL`) */
  tabVariant?: V2ModulePageTabVariant;
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
  /** Drawer, modal do page quản lý */
  overlays?: React.ReactNode;
  className?: string;
  /** Tab trang (ví dụ chuyển giữa các trang liên quan PR / PO) */
  pageTabs?: V2TabComboboxItem[];
  /** Khóa tab trang đang kích hoạt */
  activePageTab?: string;
  /** Callback chuyển tab trang */
  onPageTabSelect?: (key: string) => void;
}
