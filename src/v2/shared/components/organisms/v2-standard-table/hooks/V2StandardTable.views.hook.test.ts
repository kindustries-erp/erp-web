import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import {
  createViewStorage,
  renderViews,
  viewModes,
} from "../mocks/V2StandardTable.views.fixture";

describe("useV2ViewPresets: hiển thị và chọn", () => {
  it("không gọi onSelect hay ghi storage lúc mount", () => {
    const { storage, modes } = renderViews();
    expect(modes.onSelect).not.toHaveBeenCalled();
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("ghép view hệ thống (isSystem) với view tùy chỉnh đã lưu", () => {
    const { result } = renderViews({
      storage: createViewStorage({
        customViews: [
          {
            key: "custom_1",
            label: "Của tôi",
            baseKey: "audit",
            visibility: { code: true },
            order: [],
          },
        ],
      }),
    });
    expect(result.current.viewModes?.items).toEqual([
      { key: "overview", label: "Tổng quan", isSystem: true },
      { key: "audit", label: "Kiểm toán", isSystem: true },
      { key: "custom_1", label: "Của tôi" },
    ]);
  });

  it("chọn view tùy chỉnh áp cột và gửi view nền cho consumer", () => {
    const { result, prefs, modes } = renderViews({
      modes: { ...viewModes(), activeKey: "audit" },
      storage: createViewStorage({
        customViews: [
          {
            key: "custom_1",
            label: "Của tôi",
            baseKey: "audit",
            visibility: { name: false },
            order: ["qty"],
          },
        ],
      }),
    });
    act(() => result.current.viewModes?.onSelect("custom_1"));
    expect(prefs.applyView).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: { name: false } }),
    );
    expect(modes.onSelect).toHaveBeenCalledWith("audit");
  });

  it("chọn view hệ thống chỉ gọi onSelect, không đụng cột", () => {
    const { result, prefs, modes } = renderViews();
    act(() => result.current.viewModes?.onSelect("audit"));
    expect(modes.onSelect).toHaveBeenCalledWith("audit");
    expect(prefs.applyView).not.toHaveBeenCalled();
  });

  it("khôi phục view tùy chỉnh đã chọn khi trang đang ở đúng view nền", () => {
    const { result } = renderViews({
      storage: createViewStorage({
        customViews: [
          {
            key: "custom_1",
            label: "Của tôi",
            baseKey: "audit",
            visibility: {},
            order: [],
          },
        ],
        activeKey: "custom_1",
      }),
      modes: { ...viewModes(), activeKey: "audit" },
    });
    expect(result.current.viewModes?.activeKey).toBe("custom_1");
  });

  it("ghi filter đang chọn vào storage khi trang đổi filter", () => {
    const storage = createViewStorage();
    const { rerender } = renderViews({ storage, filterKey: "all" });
    storage.save.mockClear();
    rerender({ filterActive: "new" });
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({ filterKey: "new" }),
    );
  });

  it("không có viewModes (mobile): không có danh sách view nhưng vẫn ghi filter", () => {
    const storage = createViewStorage();
    const { result, rerender } = renderViews({
      storage,
      withViewModes: false,
      filterKey: "all",
    });
    expect(result.current.viewModes).toBeUndefined();
    storage.save.mockClear();
    rerender({ filterActive: "new" });
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({ filterKey: "new" }),
    );
  });
});
