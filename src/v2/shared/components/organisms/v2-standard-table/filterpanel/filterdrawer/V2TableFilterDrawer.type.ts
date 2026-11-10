import type * as React from "react";
import type { V2FilterPreset } from "../../toolbar/V2StandardTable.toolbar.type";
import type { V2HeaderFilters } from "../../hooks/V2StandardTable.filter.hook";
import type { V2TableState } from "../../hooks/V2StandardTable.state.hook";
import type { V2Column } from "../../V2StandardTable.type";
import type { V2FilterPanelController } from "../V2StandardTable.filterpanel.hook";

/** Phần preset của bảng đưa vào drawer: chỉ chọn/bỏ chọn; tạo và sửa vẫn ở thanh công cụ */
export interface V2TableFilterDrawerPresets {
  presets: V2FilterPreset[];
  activeKey?: string;
  onSelect: (key: string) => void;
  onClearActive: () => void;
}

export interface V2TableFilterDrawerProps<T> {
  panel: V2FilterPanelController<T>;
  columns: V2Column<T>[];
  state: V2TableState;
  filters: V2HeaderFilters;
  extraContent?: React.ReactNode;
  /** Undefined khi bảng không bật bộ lọc đã lưu: không hiện tab Bộ lọc đã lưu */
  presets?: V2TableFilterDrawerPresets;
}
