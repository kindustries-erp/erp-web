import type { V2ColumnPreferences } from "@/v2/shared/components/organisms/v2-standard-table/V2StandardTable.type";
import type { V2ViewPresetState } from "@/v2/shared/components/organisms/v2-standard-table/toolbar/V2StandardTable.toolbar.type";

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
