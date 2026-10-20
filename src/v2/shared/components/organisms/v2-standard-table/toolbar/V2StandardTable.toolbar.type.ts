import type { ReactNode } from "react";
import type { V2DropdownGroup } from "@/v2/shared/components/molecules/v2-dropdown";
import type {
  V2FilterGroup,
  V2ViewModeItem,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";

/** Cấu hình chế độ xem tùy chỉnh (tên + cột hiển thị + thứ tự cột), lưu qua `V2ViewPresetStorage` */
export interface V2ViewPreset {
  key: string;
  label: string;
  /** Preset hệ thống dùng làm nền; chọn view này thì consumer nhận đúng key này */
  baseKey: string;
  visibility: Record<string, boolean>;
  order: string[];
}

export interface V2ViewPresetState {
  customViews: V2ViewPreset[];
  /** Chế độ xem đang chọn (hệ thống hoặc tùy chỉnh) */
  activeKey?: string;
  /** Key của filter group đang chọn */
  filterKey?: string;
}

export interface V2ViewPresetStorage {
  load: (tableId: string) => V2ViewPresetState | null;
  save: (tableId: string, state: V2ViewPresetState) => void;
  clear: (tableId: string) => void;
}

export interface V2TableToolbarConfig {
  /** Nhóm lọc nhanh nằm trong popover chế độ xem; thay thế pill tabs cũ */
  filterGroup?: V2FilterGroup;
  /** Chế độ xem hệ thống. Tạo/sửa/xóa tùy chỉnh do bảng tự xử lý và lưu lại */
  viewModes?: {
    items: V2ViewModeItem[];
    activeKey: string;
    onSelect: (key: string) => void;
  };
  /** Menu của chip `(N)` khi có dòng được chọn */
  bulkActions?: V2DropdownGroup[];
  /** Bật panel lọc theo cột bên phải; nút Lọc tự mở/đóng panel */
  filterPanel?: V2TableFilterPanelConfig;
  /** Có handler thì hiện nút Lọc (badge = số cột đang lọc) */
  onFilterToggle?: () => void;
  onRefresh?: () => void;
  /** Ô tìm kiếm toàn cục trên mọi cột, kết quả nằm ở `query.search` */
  search?: { placeholder?: string };
  /** Mặc định true; bỏ qua trên mobile */
  enableFullscreen?: boolean;
  create?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    actions?: V2DropdownGroup[];
  };
}

export interface V2TableFilterPanelConfig {
  /** Controlled; bỏ trống thì bảng tự giữ trạng thái mở/đóng */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Bộ lọc tùy biến theo trang (kỳ, tag...) đặt trên danh sách cột */
  extraContent?: ReactNode;
}
