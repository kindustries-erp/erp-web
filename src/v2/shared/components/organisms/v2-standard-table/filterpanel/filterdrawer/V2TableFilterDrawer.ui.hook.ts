import { useState } from "react";

export type V2FilterDrawerTab = "columns" | "presets";

/** Tab đang chọn của drawer lọc; tab Bộ lọc đã lưu chỉ tồn tại khi bảng có preset */
export function useV2FilterDrawerTab(hasPresets: boolean) {
  const [tab, setTab] = useState<V2FilterDrawerTab>("columns");
  const activeTab: V2FilterDrawerTab =
    tab === "presets" && !hasPresets ? "columns" : tab;
  return { activeTab, setTab };
}
