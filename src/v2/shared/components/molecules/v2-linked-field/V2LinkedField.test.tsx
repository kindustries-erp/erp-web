import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2LinkedField } from "./V2LinkedField";
import type { V2LinkedFieldProps } from "./V2LinkedField.type";

const options = [
  { value: "b1", label: "Chi nhánh 1" },
  { value: "b2", label: "Chi nhánh 2" },
];

function renderField(over: Partial<V2LinkedFieldProps> = {}) {
  const onFkChange = vi.fn();
  const onLocalChange = vi.fn();
  const props: V2LinkedFieldProps = {
    options,
    fkValue: "b1",
    localValue: "Chi nhánh 1",
    sourceValue: "Chi nhánh 1",
    fkLabel: "Chi nhánh",
    localLabel: "Tên chi nhánh",
    onFkChange,
    onLocalChange,
    ...over,
  };
  render(<V2LinkedField {...props} />);
  return { onFkChange, onLocalChange };
}

describe("V2LinkedField", () => {
  beforeEach(() => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("hiện dropdown FK và ô song song, chưa chỉnh thì không có nhãn", () => {
    renderField();
    expect(screen.getByRole("combobox")).toBeTruthy();
    expect(screen.getByLabelText("Tên chi nhánh")).toHaveProperty(
      "value",
      "Chi nhánh 1",
    );
    expect(screen.queryByText("Đã chỉnh")).toBeNull();
  });

  it("sửa ô song song chỉ gọi onLocalChange, không đổi FK", () => {
    const { onFkChange, onLocalChange } = renderField();
    fireEvent.change(screen.getByLabelText("Tên chi nhánh"), {
      target: { value: "Tên riêng" },
    });
    expect(onLocalChange).toHaveBeenCalledWith("Tên riêng");
    expect(onFkChange).not.toHaveBeenCalled();
  });

  it("khác nguồn thì hiện nhãn đã chỉnh, giá trị gốc và nút khôi phục", () => {
    const { onLocalChange } = renderField({ localValue: "Tên riêng" });
    expect(screen.getByText("Đã chỉnh")).toBeTruthy();
    expect(screen.getByText("Gốc: Chi nhánh 1")).toBeTruthy();
    fireEvent.click(screen.getByText("Khôi phục theo nguồn"));
    expect(onLocalChange).toHaveBeenCalledWith("Chi nhánh 1");
  });

  it("có handler thì hiện nút cập nhật từ nguồn và gọi khi bấm", () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    renderField({ onRefresh });
    fireEvent.click(screen.getByText("Cập nhật từ nguồn"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("disabled: không có nút thao tác", () => {
    renderField({
      localValue: "Tên riêng",
      disabled: true,
      onRefresh: vi.fn(),
    });
    expect(screen.queryByText("Khôi phục theo nguồn")).toBeNull();
    expect(screen.queryByText("Cập nhật từ nguồn")).toBeNull();
  });
});
