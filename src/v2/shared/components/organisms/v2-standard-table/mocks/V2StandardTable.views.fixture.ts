import { vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type {
  V2ViewPresetState,
  V2ViewPresetStorage,
} from "../toolbar/V2StandardTable.toolbar.type";
import { useV2ViewPresets } from "../hooks/V2StandardTable.views.hook";

export const viewModes = () => ({
  items: [
    { key: "overview", label: "Tổng quan" },
    { key: "audit", label: "Kiểm toán" },
  ],
  activeKey: "overview",
  onSelect: vi.fn(),
});

export const createViewStorage = (initial: V2ViewPresetState | null = null) =>
  ({
    load: vi.fn(() => initial),
    save: vi.fn(),
    clear: vi.fn(),
  }) satisfies V2ViewPresetStorage;

export const createViewPrefs = () => ({
  orderedKeys: ["code", "name", "qty"],
  applyView: vi.fn(),
});

export type ViewModesFixture = ReturnType<typeof viewModes>;
export type ViewPrefsFixture = ReturnType<typeof createViewPrefs>;

/** Dựng hook chế độ xem với filter group có thể đổi qua `rerender({ filterActive })` */
export const renderViews = ({
  storage = createViewStorage(),
  modes = viewModes(),
  withViewModes = true,
  prefs = createViewPrefs(),
  filterKey,
}: {
  storage?: V2ViewPresetStorage;
  modes?: ViewModesFixture;
  /** false: như mobile, không có danh sách chế độ xem */
  withViewModes?: boolean;
  prefs?: ViewPrefsFixture;
  filterKey?: string;
} = {}) => {
  const hook = renderHook(
    (props: { filterActive?: string }) =>
      useV2ViewPresets({
        tableId: "t",
        viewModes: withViewModes ? modes : undefined,
        filterGroup: props.filterActive
          ? {
              items: [
                { key: "all", label: "Tất cả" },
                { key: "new", label: "Mới" },
              ],
              activeKey: props.filterActive,
              onChange: vi.fn(),
            }
          : undefined,
        prefs,
        storage,
      }),
    { initialProps: { filterActive: filterKey } },
  );
  return { ...hook, storage, modes, prefs };
};
