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

  it("reserves room on the trigger for the clear button and chevron cluster", () => {
    render(
      <V2Combobox
        options={options}
        value="in"
        onValueChange={vi.fn()}
        clearable
      />,
    );
    expect(screen.getByRole("combobox").className).toContain("pr-16");
    const clear = screen.getByRole("button", { name: "Bỏ lựa chọn" });
    // Nút X là V2Button ghost icon-xs, không phải <button> thuần
    expect(clear.className).toContain("h-5 w-5");
    expect(clear.className).toContain("pointer-events-auto");
  });

  it("does not reserve clear space when not clearable", () => {
    render(<V2Combobox options={options} value="in" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("pr-9");
    expect(trigger.className).not.toContain("pr-16");
    expect(screen.queryByRole("button", { name: "Bỏ lựa chọn" })).toBeNull();
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

  it("shows fallbackLabel when value is not in options", () => {
    render(
      <V2Combobox
        options={options}
        value="unknown-val"
        fallbackLabel="Phiếu dự phòng #999"
        onValueChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Phiếu dự phòng #999",
    );
  });

  it("triggers onScrollBottom when scrolled near bottom", () => {
    const handleScrollBottom = vi.fn();
    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={vi.fn()}
        onScrollBottom={handleScrollBottom}
      />,
    );
    open();
    const listbox = screen.getByRole("listbox");
    Object.defineProperty(listbox, "scrollHeight", {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(listbox, "clientHeight", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(listbox, "scrollTop", {
      value: 90,
      configurable: true,
    });

    fireEvent.scroll(listbox);
    expect(handleScrollBottom).toHaveBeenCalled();
  });

  it("renders V2BottomSheet on mobile without auto-focusing search input", () => {
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 375,
      height: 812,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });
    const onValueChange = vi.fn();

    render(
      <V2Combobox
        options={options}
        value={null}
        onValueChange={onValueChange}
        placeholder="Phương thức"
      />,
    );
    open();

    expect(screen.getByTestId("v2-bottom-sheet-content")).toBeInTheDocument();
    const searchInput = screen.getByRole("textbox");
    expect(document.activeElement).not.toBe(searchInput);

    const opt = screen.getByRole("option", { name: /Hóa đơn bán ra/ });
    expect(opt.className).toContain("min-h-[44px]");
    fireEvent.click(opt);

    expect(onValueChange).toHaveBeenCalledWith("out");
    expect(
      screen.queryByTestId("v2-bottom-sheet-content"),
    ).not.toBeInTheDocument();
  });
});
