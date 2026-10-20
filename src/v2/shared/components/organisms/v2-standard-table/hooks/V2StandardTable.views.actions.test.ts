import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import {
  createViewStorage,
  renderViews,
  viewModes,
} from "../mocks/V2StandardTable.views.fixture";

describe("useV2ViewPresets: tạo, sửa, xóa", () => {
  it("tạo view: lưu tên, cột và thứ tự, áp cột và đổi về view nền", () => {
    const { result, storage, prefs, modes } = renderViews();
    act(() => result.current.viewModes?.onCreate());
    expect(result.current.dialog).toEqual({ mode: "create" });
    act(() =>
      result.current.submitDialog({ name: "Của tôi", visibleKeys: ["code"] }),
    );
    const created = result.current.viewModes?.items.slice(-1)[0];
    expect(created?.label).toBe("Của tôi");
    expect(result.current.viewModes?.activeKey).toBe(created?.key);
    expect(prefs.applyView).toHaveBeenCalledWith(
      expect.objectContaining({
        baseKey: "overview",
        visibility: { code: true, name: false, qty: false },
        order: ["code", "name", "qty"],
      }),
    );
    expect(storage.save).toHaveBeenLastCalledWith(
      "t",
      expect.objectContaining({ activeKey: created?.key }),
    );
    expect(result.current.dialog).toBeNull();
    expect(modes.onSelect).not.toHaveBeenCalled();
  });

  it("isNameTaken so khớp không phân biệt hoa thường và bỏ qua chính nó", () => {
    const { result } = renderViews();
    expect(result.current.isNameTaken("tổng QUAN")).toBe(true);
    expect(result.current.isNameTaken("Mới")).toBe(false);
    expect(result.current.isNameTaken("Tổng quan", "overview")).toBe(false);
  });

  it("sửa view: đổi tên và cột của view tùy chỉnh", () => {
    const view = {
      key: "custom_1",
      label: "Của tôi",
      baseKey: "overview",
      visibility: { code: true },
      order: [],
    };
    const { result } = renderViews({
      storage: createViewStorage({ customViews: [view] }),
    });
    act(() => result.current.viewModes?.onEdit("custom_1"));
    expect(result.current.dialog).toEqual({ mode: "edit", view });
    act(() =>
      result.current.submitDialog({ name: "Đã sửa", visibleKeys: ["qty"] }),
    );
    expect(result.current.viewModes?.items.slice(-1)[0]?.label).toBe("Đã sửa");
    expect(result.current.dialog).toBeNull();
  });

  it("xóa qua xác nhận; hủy thì giữ nguyên", () => {
    const { result } = renderViews({
      storage: createViewStorage({
        customViews: [
          {
            key: "custom_1",
            label: "Của tôi",
            baseKey: "overview",
            visibility: {},
            order: [],
          },
        ],
      }),
    });
    act(() => result.current.viewModes?.onDelete("custom_1"));
    expect(result.current.pendingDelete).toEqual({
      key: "custom_1",
      label: "Của tôi",
    });
    act(() => result.current.cancelDelete());
    expect(result.current.viewModes?.items).toHaveLength(3);
    expect(result.current.pendingDelete).toBeNull();
  });

  it("xóa view đang chọn thì quay về view hệ thống đầu tiên và báo cho trang", () => {
    const { result, modes } = renderViews({
      modes: { ...viewModes(), activeKey: "audit" },
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
    });
    act(() => result.current.viewModes?.onDelete("custom_1"));
    act(() => result.current.confirmDelete());
    expect(result.current.viewModes?.items).toHaveLength(2);
    expect(result.current.viewModes?.activeKey).toBe("overview");
    expect(modes.onSelect).toHaveBeenCalledWith("overview");
  });
});
