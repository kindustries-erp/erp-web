import { Download, DownloadCloud } from "lucide-react";
import type { V2TableToolbarConfig } from "../V2StandardTable.type";

/**
 * Giá trị demo cho mọi key của `V2TableToolbarConfig`.
 * Kiểu `Required<...>` buộc khai báo đủ key: type gốc thêm key mà thiếu ở đây thì lỗi compile.
 */
const DEMO_TOOLBAR: Required<V2TableToolbarConfig> = {
  filterGroup: {
    title: "Bộ lọc dữ liệu",
    items: [
      { key: "all", label: "Tất cả" },
      { key: "new", label: "Mới", badgeCount: 4 },
      { key: "replace", label: "Thay thế" },
      { key: "adjust", label: "Điều chỉnh" },
    ],
    activeKey: "all",
    onChange: () => {},
  },
  viewModes: {
    items: [
      { key: "overview", label: "Tổng quan", isSystem: true },
      { key: "tax", label: "Thuế", isSystem: true },
    ],
    activeKey: "overview",
    onSelect: () => {},
  },
  bulkActions: [
    {
      groupLabel: "Tải & Xuất tệp",
      items: [{ label: "Tải ZIP", icon: <Download className="h-3.5 w-3.5" /> }],
    },
  ],
  filterPanel: { defaultOpen: false },
  onFilterToggle: () => {},
  onRefresh: () => {},
  search: { placeholder: "Tìm kiếm" },
  enableFullscreen: true,
  create: {
    label: "Đồng bộ",
    icon: <DownloadCloud className="h-4 w-4" />,
    onClick: () => {},
    actions: [{ items: [{ label: "Đồng bộ nâng cao" }] }],
  },
};

export type ToolbarKey = keyof V2TableToolbarConfig;

/** Công tắc bật/tắt từng key toolbar; tên `show<Key>` suy ra từ key của type gốc */
export type ToolbarToggleArgs = {
  [K in ToolbarKey as `show${Capitalize<K>}`]?: boolean;
};

const TOOLBAR_KEYS = Object.keys(DEMO_TOOLBAR) as ToolbarKey[];

const toggleName = (key: ToolbarKey) =>
  `show${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof ToolbarToggleArgs;

/** Mặc định: bật toàn bộ key */
export const TOOLBAR_TOGGLE_DEFAULTS = Object.fromEntries(
  TOOLBAR_KEYS.map((key) => [toggleName(key), true]),
) as ToolbarToggleArgs;

/** Khai báo control boolean cho từng công tắc; nhãn hiện đúng tên arg (`show<Key>`) */
export const TOOLBAR_TOGGLE_ARG_TYPES = Object.fromEntries(
  TOOLBAR_KEYS.map((key) => [toggleName(key), { control: "boolean" }]),
);

/** Ghép `V2TableToolbarConfig` từ các công tắc đang bật */
export const buildToolbar = (
  toggles: ToolbarToggleArgs,
): V2TableToolbarConfig => {
  const toolbar: Partial<Record<ToolbarKey, unknown>> = {};
  for (const key of TOOLBAR_KEYS) {
    if (toggles[toggleName(key)]) toolbar[key] = DEMO_TOOLBAR[key];
  }
  return toolbar as V2TableToolbarConfig;
};
