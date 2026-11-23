import type {
  V2ColumnPreferences,
  V2ViewPresetState,
} from "@/v2/shared/components";

/** Cấu hình V2 của một bảng: cột đang hiển thị và chế độ xem (hệ thống + tùy chỉnh) */
export interface V2TablePreferenceEntry {
  columns?: V2ColumnPreferences;
  views?: V2ViewPresetState;
}

/** Bản ghi cũ của V1 (`erp_preferences`), chỉ đọc để migrate */
export interface V1TablePreference {
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
  columnSizing?: Record<string, number>;
  views?: Array<{
    key: string;
    label: string;
    columnVisibility?: Record<string, boolean>;
    isCustom?: boolean;
  }>;
  activeView?: string;
}

/** Một dòng trả về từ `GET /api/v2/table-preferences` */
export interface V2TablePreferenceItem extends V2TablePreferenceEntry {
  tableId: string;
  updatedAt: string;
}

/** Response danh sách v2: không phong bì `{message,data}`, không phân trang */
export interface V2TablePreferenceListResponse {
  items: V2TablePreferenceItem[];
}
