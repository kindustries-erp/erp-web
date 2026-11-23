import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLinkedField } from "./V2LinkedField.hook";

const options = [
  { value: "b1", label: "Chi nhánh 1" },
  { value: "b2", label: "Chi nhánh 2" },
];

function setup(over: Partial<Parameters<typeof useLinkedField>[0]> = {}) {
  const onFkChange = vi.fn();
  const onLocalChange = vi.fn();
  const base = {
    options,
    fkValue: "b1",
    localValue: "Chi nhánh 1",
    sourceValue: "Chi nhánh 1",
    onFkChange,
    onLocalChange,
    ...over,
  };
  const hook = renderHook((p: typeof base) => useLinkedField(p), {
    initialProps: base,
  });
  return { ...hook, onFkChange, onLocalChange, base };
}

describe("useLinkedField", () => {
  it("chọn FK điền nhãn option vào ô song song và báo FK mới", () => {
    const { result, onFkChange, onLocalChange } = setup();
    act(() => result.current.select("b2"));
    expect(onFkChange).toHaveBeenCalledWith("b2");
    expect(onLocalChange).toHaveBeenCalledWith("Chi nhánh 2");
    expect(result.current.sourceText).toBe("Chi nhánh 2");
  });

  it("getSourceText quyết định giá trị nguồn điền vào ô song song", () => {
    const { result, onLocalChange } = setup({
      getSourceText: (o) => o.label.replace("Chi nhánh", "CN"),
    });
    act(() => result.current.select("b2"));
    expect(onLocalChange).toHaveBeenCalledWith("CN 2");
    expect(result.current.sourceText).toBe("CN 2");
  });

  it("sửa ô song song chỉ đổi giá trị cục bộ, không đổi FK", () => {
    const { result, onFkChange, onLocalChange } = setup();
    act(() => result.current.edit("Tên riêng"));
    expect(onLocalChange).toHaveBeenCalledWith("Tên riêng");
    expect(onFkChange).not.toHaveBeenCalled();
  });

  it("đã chỉnh khi giá trị khác nguồn, bỏ qua khoảng trắng đầu cuối", () => {
    const same = setup({ localValue: "  Chi nhánh 1 " });
    expect(same.result.current.overridden).toBe(false);
    const diff = setup({ localValue: "Tên riêng" });
    expect(diff.result.current.overridden).toBe(true);
    expect(diff.result.current.canRevert).toBe(true);
  });

  it("chưa biết nguồn (FK không có trong options): dùng cờ overridden của server", () => {
    const { result } = setup({
      sourceValue: undefined,
      fkValue: "b-khong-co-trong-options",
      localValue: "Tên riêng",
      overridden: true,
    });
    expect(result.current.overridden).toBe(true);
    expect(result.current.canRevert).toBe(false);
  });

  it("khôi phục đặt lại giá trị nguồn", () => {
    const { result, onLocalChange } = setup({ localValue: "Tên riêng" });
    act(() => result.current.revert());
    expect(onLocalChange).toHaveBeenCalledWith("Chi nhánh 1");
  });

  it("bỏ chọn FK giữ chữ đã nhập, không còn nguồn mới", () => {
    const { result, onFkChange, onLocalChange } = setup();
    act(() => result.current.select(null));
    expect(onFkChange).toHaveBeenCalledWith(null);
    expect(onLocalChange).not.toHaveBeenCalled();
  });

  it("refresh gọi handler và chỉ hiện khi có FK và handler", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = setup({ onRefresh });
    expect(result.current.canRefresh).toBe(true);
    await act(async () => result.current.refresh());
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    const none = setup({ onRefresh: undefined });
    expect(none.result.current.canRefresh).toBe(false);
    const noFk = setup({ onRefresh, fkValue: null });
    expect(noFk.result.current.canRefresh).toBe(false);
  });

  it("làm mới lỗi thì giữ nguồn vừa chọn và không ném lỗi ra ngoài", async () => {
    const onRefresh = vi.fn().mockRejectedValue(new Error("500"));
    const { result } = setup({ onRefresh });
    act(() => result.current.select("b2"));
    expect(result.current.sourceText).toBe("Chi nhánh 2");
    await act(async () => {
      result.current.refresh();
    });
    expect(onRefresh).toHaveBeenCalled();
    expect(result.current.sourceText).toBe("Chi nhánh 2");
    expect(result.current.isRefreshing).toBe(false);
  });

  it("làm mới thành công thì bỏ nguồn vừa chọn, dùng nguồn đã lưu", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = setup({ onRefresh, sourceValue: "Nguồn đã lưu" });
    act(() => result.current.select("b2"));
    await act(async () => {
      result.current.refresh();
    });
    expect(result.current.sourceText).toBe("Nguồn đã lưu");
  });

  it("phiếu cũ chưa có snapshot: so với nguồn của option FK để hiện đã chỉnh", () => {
    const { result } = setup({
      sourceValue: undefined,
      fkValue: "b1",
      localValue: "Tên tự sửa",
    });
    expect(result.current.sourceText).toBe("Chi nhánh 1");
    expect(result.current.overridden).toBe(true);
    expect(result.current.canRevert).toBe(true);
  });
});
