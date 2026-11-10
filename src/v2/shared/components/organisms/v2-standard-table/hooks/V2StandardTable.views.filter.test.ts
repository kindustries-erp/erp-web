import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import {
  createViewStorage,
  renderViews,
} from "../mocks/V2StandardTable.views.fixture";

const customView = (filterKey?: string) => ({
  key: "custom_1",
  label: "Của tôi",
  baseKey: "overview",
  visibility: {},
  order: [],
  ...(filterKey !== undefined && { filterKey }),
});

describe("useV2ViewPresets: bộ lọc có sẵn gắn với view", () => {
  it("tạo view không truyền filterKey: lấy bộ lọc đang chọn của trang", () => {
    const { result, storage } = renderViews({ filterKey: "new" });
    act(() => result.current.viewModes?.onCreate());
    act(() =>
      result.current.submitDialog({ name: "Mới", visibleKeys: ["code"] }),
    );
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({
        customViews: [expect.objectContaining({ filterKey: "new" })],
      }),
    );
  });

  it("tạo view với filterKey do dialog chọn thì dùng giá trị đó", () => {
    const { result, storage } = renderViews({ filterKey: "new" });
    act(() => result.current.viewModes?.onCreate());
    act(() =>
      result.current.submitDialog({
        name: "Tất cả",
        visibleKeys: ["code"],
        filterKey: "all",
      }),
    );
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({
        customViews: [expect.objectContaining({ filterKey: "all" })],
      }),
    );
  });

  it("chọn view có filterKey hợp lệ thì đổi bộ lọc của trang", () => {
    const { result, filterOnChange } = renderViews({
      filterKey: "all",
      storage: createViewStorage({ customViews: [customView("new")] }),
    });
    act(() => result.current.viewModes?.onSelect("custom_1"));
    expect(filterOnChange).toHaveBeenCalledWith("new");
  });

  it("chọn view không có filterKey (view cũ) thì giữ nguyên bộ lọc", () => {
    const { result, filterOnChange } = renderViews({
      filterKey: "all",
      storage: createViewStorage({ customViews: [customView()] }),
    });
    act(() => result.current.viewModes?.onSelect("custom_1"));
    expect(filterOnChange).not.toHaveBeenCalled();
  });

  it("filterKey không còn trong nhóm lọc thì bỏ qua, không đổi bộ lọc", () => {
    const { result, filterOnChange } = renderViews({
      filterKey: "all",
      storage: createViewStorage({ customViews: [customView("deleted")] }),
    });
    act(() => result.current.viewModes?.onSelect("custom_1"));
    expect(filterOnChange).not.toHaveBeenCalled();
  });

  it("filterKey đã là bộ lọc đang chọn thì không gọi onChange thừa", () => {
    const { result, filterOnChange } = renderViews({
      filterKey: "new",
      storage: createViewStorage({ customViews: [customView("new")] }),
    });
    act(() => result.current.viewModes?.onSelect("custom_1"));
    expect(filterOnChange).not.toHaveBeenCalled();
  });

  it("sửa view với filterKey mới thì cập nhật; không truyền thì giữ nguyên", () => {
    const { result, storage } = renderViews({
      storage: createViewStorage({ customViews: [customView("new")] }),
    });
    act(() => result.current.viewModes?.onEdit("custom_1"));
    act(() =>
      result.current.submitDialog({
        name: "Của tôi",
        visibleKeys: [],
        filterKey: "all",
      }),
    );
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({
        customViews: [expect.objectContaining({ filterKey: "all" })],
      }),
    );

    act(() => result.current.viewModes?.onEdit("custom_1"));
    act(() =>
      result.current.submitDialog({ name: "Đổi tên", visibleKeys: [] }),
    );
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({
        customViews: [expect.objectContaining({ filterKey: "all" })],
      }),
    );
  });
});
