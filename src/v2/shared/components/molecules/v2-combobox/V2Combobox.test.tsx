import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2Combobox } from "./V2Combobox";

const options = [
  { value: "in", label: "Hóa đơn mua vào" },
  { value: "out", label: "Hóa đơn bán ra" },
  { value: "draft", label: "Hóa đơn nháp", disabled: true },
];

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

const open = () => fireEvent.click(screen.getByRole("combobox"));

describe("V2Combobox", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("shows the placeholder and the selected label", () => {
    const { rerender } = render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        placeholder="Loại hóa đơn"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Loại hóa đơn");
    rerender(
      <V2Combobox options={options} value="out" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Hóa đơn bán ra");
  });

  it("opens the list and selects an option", () => {
    const onValueChange = vi.fn();
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={onValueChange}
      />,
    );
    open();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    fireEvent.click(screen.getByRole("option", { name: /Hóa đơn bán ra/ }));
    expect(onValueChange).toHaveBeenCalledWith("out");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters while typing, ignoring diacritics", () => {
    render(
      <V2Combobox options={options} value={null} onValueChange={vi.fn()} />,
    );
    open();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ban ra" },
    });
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("shows the empty label when nothing matches", () => {
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        emptyLabel="Không có kết quả"
      />,
    );
    open();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "zzz" } });
    expect(screen.getByText("Không có kết quả")).toBeInTheDocument();
  });

  it("selects with the keyboard", () => {
    const onValueChange = vi.fn();
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={onValueChange}
      />,
    );
    open();
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("out");
  });

  it("does not select a disabled option", () => {
    const onValueChange = vi.fn();
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={onValueChange}
      />,
    );
    open();
    fireEvent.click(screen.getByRole("option", { name: /nháp/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("can be cleared when clearable", () => {
    const onValueChange = vi.fn();
    render(
      <V2Combobox
        options={options}
        value="in"
        onValueChange={onValueChange}
        clearable
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Bỏ lựa chọn" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("hides the search box when not searchable", () => {
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        searchable={false}
      />,
    );
    open();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("does not open when disabled", () => {
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
