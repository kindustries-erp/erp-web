import * as React from "react";
import type {
  V2ViewPresetState,
  V2ViewPresetStorage,
} from "../toolbar/V2StandardTable.toolbar.type";

export interface UseV2ViewPresetSyncOptions {
  tableId: string;
  state: V2ViewPresetState;
  setState: React.Dispatch<React.SetStateAction<V2ViewPresetState>>;
  storage: V2ViewPresetStorage;
  /** Filter group đang chọn của trang */
  filterKey?: string;
  /** View hệ thống mà trang đang đặt */
  pageKey?: string;
}

/** Đồng bộ state view với storage: ghi khi đổi (không ghi lúc mount), nhớ filter, bỏ lựa chọn tùy chỉnh khi trang đổi view */
export function useV2ViewPresetSync({
  tableId,
  state,
  setState,
  storage,
  filterKey,
  pageKey,
}: UseV2ViewPresetSyncOptions) {
  const lastSaved = React.useRef(state);
  React.useEffect(() => {
    if (lastSaved.current === state) return;
    lastSaved.current = state;
    storage.save(tableId, state);
  }, [state, storage, tableId]);

  React.useEffect(() => {
    if (filterKey === undefined) return;
    setState((s) => (s.filterKey === filterKey ? s : { ...s, filterKey }));
  }, [filterKey, setState]);

  React.useEffect(() => {
    setState((s) => {
      if (s.activeKey === undefined) return s;
      const custom = s.customViews.find((v) => v.key === s.activeKey);
      const expected = custom ? custom.baseKey : s.activeKey;
      return expected === pageKey ? s : { ...s, activeKey: undefined };
    });
  }, [pageKey, setState]);
}
