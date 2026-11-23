import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import * as React from "react";
import { consumePendingFilterPreset } from "../utils/v2PendingFilterPreset";
import { TableSortState } from "@/v2/shared/types/v2-table";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { V2FilterGroup } from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import type { V2FilterPreset } from "../toolbar/V2StandardTable.toolbar.type";
import { createInitialQuery } from "../utils/v2TableQuery";
import { V2_FILTER_PRESETS_MAX, toPresetQuery } from "../utils/v2FilterPresets";
import {
  useV2FilterPresets,
  type V2FilterPresetEditorSource,
} from "./V2StandardTable.filterpresets.hook";

const groupOf = (activeKey: string, onChange = vi.fn()): V2FilterGroup => ({
  items: [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
  ],
  activeKey,
  onChange,
});

const emptySource = (tableQuery: V2TableQuery): V2FilterPresetEditorSource => ({
  tableId: "t-1",
  columns: [],
  fetchOptionsForKey: () => undefined,
  filtersStrForQuery: () => undefined,
  tableQuery,
});

/** Giữ danh sách bộ lọc trong state như bảng thật, để create/remove thấy kết quả ngay */
const setup = (opts: {
  query?: V2TableQuery;
  group?: V2FilterGroup;
  initial?: V2FilterPreset[];
}) => {
  const applyQuery = vi.fn();
  const baseQuery = opts.query ?? createInitialQuery({ pageSize: 20 });
  const hook = renderHook(
    (props: { query: V2TableQuery; group?: V2FilterGroup }) => {
      const [presets, setPresetsState] = React.useState<V2FilterPreset[]>(
        opts.initial ?? [],
      );
      return useV2FilterPresets({
        tableId: "t-1",
        presets,
        setPresets: (update) => setPresetsState((c) => update(c)),
        filterGroup: props.group,
        query: props.query,
        applyQuery,
        editorSource: emptySource(props.query),
      });
    },
    {
      initialProps: {
        query: baseQuery,
        group: opts.group,
      },
    },
  );
  return { ...hook, applyQuery };
};

describe("useV2FilterPresets", () => {
  beforeEach(() => {
    consumePendingFilterPreset("t-1");
  });

  it("lưu bản nháp (tên, bộ lọc gốc, điều kiện) rồi suy ra bộ lọc đang chọn", () => {
    const query = createInitialQuery({
      pageSize: 20,
      search: "PO",
      sorts: [{ columnKey: "poNumber", direction: TableSortState.ASC }],
    });
    const { result } = setup({ query, group: groupOf("pending") });

    act(() => {
      expect(
        result.current.create({
          label: "  Chờ duyệt có PO  ",
          groupKey: "pending",
          query: toPresetQuery(query),
        }),
      ).toBe(true);
    });

    expect(result.current.presets).toHaveLength(1);
    const saved = result.current.presets[0];
    expect(saved.label).toBe("Chờ duyệt có PO");
    expect(saved.groupKey).toBe("pending");
    expect(saved.query).toEqual(toPresetQuery(query));
    expect(result.current.activeKey).toBe(saved.key);
  });

  it("mặc định bộ lọc gốc của bản nháp là nhóm đang chọn, hoặc Tất cả", () => {
    const withGroup = setup({ group: groupOf("approved") });
    expect(withGroup.result.current.defaultGroupKey).toBe("approved");

    const withoutGroup = setup({});
    expect(withoutGroup.result.current.defaultGroupKey).toBe("all");
  });

  it("chọn bộ lọc cùng nhóm thì áp điều kiện tại chỗ", () => {
    const onChange = vi.fn();
    const { result, applyQuery } = setup({
      group: groupOf("pending", onChange),
      initial: [
        { key: "p1", label: "PO", groupKey: "pending", query: { q: "PO" } },
      ],
    });

    act(() => result.current.select("p1"));

    expect(onChange).not.toHaveBeenCalled();
    expect(applyQuery).toHaveBeenCalledWith({ search: "PO" });
  });

  it("chọn bộ lọc khác nhóm thì đổi nhóm gốc trước, không áp ngay", () => {
    const onChange = vi.fn();
    const { result, applyQuery } = setup({
      group: groupOf("all", onChange),
      initial: [
        { key: "p1", label: "PO", groupKey: "pending", query: { q: "PO" } },
      ],
    });

    act(() => result.current.select("p1"));

    expect(onChange).toHaveBeenCalledWith("pending");
    expect(applyQuery).not.toHaveBeenCalled();
  });

  it("sau khi đổi nhóm, bảng mới đọc snapshot chờ và áp đủ điều kiện", () => {
    const onChange = vi.fn();
    const { result, rerender, applyQuery } = setup({
      group: groupOf("all", onChange),
      initial: [
        {
          key: "p1",
          label: "PO",
          groupKey: "pending",
          query: { q: "PO", sort: "poNumber" },
        },
      ],
    });
    act(() => result.current.select("p1"));

    // Bảng dựng lại với bộ lọc gốc mới
    rerender({
      query: createInitialQuery({ pageSize: 20 }),
      group: groupOf("pending"),
    });

    expect(applyQuery).toHaveBeenCalledWith({
      search: "PO",
      sorts: [{ columnKey: "poNumber", direction: TableSortState.ASC }],
    });
  });

  it("chọn bộ lọc không còn nhóm thì chỉ áp điều kiện", () => {
    const onChange = vi.fn();
    const { result, applyQuery } = setup({
      group: groupOf("all", onChange),
      initial: [
        { key: "p1", label: "PO", groupKey: "gone", query: { q: "PO" } },
      ],
    });

    act(() => result.current.select("p1"));

    expect(onChange).not.toHaveBeenCalled();
    expect(applyQuery).toHaveBeenCalledWith({ search: "PO" });
  });

  it("cập nhật bộ lọc bằng bản nháp mới, rồi xóa", () => {
    const { result } = setup({
      group: groupOf("all"),
      initial: [
        { key: "p1", label: "Cũ", groupKey: "pending", query: { q: "cũ" } },
      ],
    });
    const next = createInitialQuery({ pageSize: 20, search: "mới" });

    act(() =>
      result.current.update("p1", {
        label: "  Mới ",
        groupKey: "all",
        query: toPresetQuery(next),
      }),
    );
    expect(result.current.presets[0]).toMatchObject({
      label: "Mới",
      groupKey: "all",
      query: { q: "mới" },
    });

    act(() => result.current.remove("p1"));
    expect(result.current.presets).toHaveLength(0);
  });

  it("không cho tạo quá giới hạn và nhận diện trùng tên", () => {
    const full = Array.from({ length: V2_FILTER_PRESETS_MAX }, (_, i) => ({
      key: `p${i}`,
      label: `Bộ ${i}`,
      query: {},
    }));
    const { result } = setup({ group: groupOf("all"), initial: full });

    expect(result.current.canCreate).toBe(false);
    expect(result.current.isNameTaken("bộ 3")).toBe(true);
    act(() => {
      expect(result.current.create({ label: "Thêm", query: {} })).toBe(false);
    });
  });

  it("clearActive xóa toàn bộ điều kiện và sắp xếp của bảng", () => {
    const { result, applyQuery } = setup({ group: groupOf("all") });

    act(() => result.current.clearActive());

    expect(applyQuery).toHaveBeenCalledWith({});
  });

  it("clearActive rồi chọn bộ lọc gốc: bảng dựng lại áp query rỗng dù URL còn điều kiện", () => {
    const onChange = vi.fn();
    const { result, rerender, applyQuery } = setup({
      query: createInitialQuery({ pageSize: 20, search: "Demo" }),
      group: groupOf("all", onChange),
    });

    act(() => result.current.clearActive());
    applyQuery.mockClear();

    // Bảng dựng lại, đọc lại URL còn điều kiện cũ
    rerender({
      query: createInitialQuery({ pageSize: 20, search: "Demo" }),
      group: groupOf("pending"),
    });

    expect(applyQuery).toHaveBeenCalledTimes(1);
    expect(applyQuery).toHaveBeenCalledWith({});
  });

  it("clearActive không để snapshot rỗng sót khi bảng không dựng lại", () => {
    vi.useFakeTimers();
    try {
      const { result } = setup({ group: groupOf("all") });

      act(() => result.current.clearActive());
      vi.runAllTimers();

      expect(consumePendingFilterPreset("t-1")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
