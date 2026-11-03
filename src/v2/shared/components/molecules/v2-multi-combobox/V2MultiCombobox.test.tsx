import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2MultiCombobox } from "./V2MultiCombobox";

const options = [
  { value: "b1", label: "Chi nhánh Đông Thành" },
  { value: "b2", label: "Chi nhánh Phú Quang" },
  { value: "b3", label: "Chi nhánh Cũ", disabled: true },
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

describe("V2MultiCombobox", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("shows placeholder when nothing selected (empty array is valid)", () => {
    render(
      <V2MultiCombobox
        options={options}
        value={[]}
        onValueChange={() => {}}
        placeholder="Chọn chi nhánh"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Chọn chi nhánh");
  });

  it("shows first label and +N badge for multiple selections", () => {
    render(
      <V2MultiCombobox
        options={options}
        value={["b1", "b2"]}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Chi nhánh Đông Thành",
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("+1");
  });

  it("adds an option to the selection when clicked", () => {
    const onValueChange = vi.fn();
    render(
      <V2MultiCombobox
        options={options}
        value={["b1"]}
        onValueChange={onValueChange}
      />,
    );
    open();
    fireEvent.click(screen.getByRole("option", { name: /Phú Quang/ }));
    expect(onValueChange).toHaveBeenCalledWith(["b1", "b2"]);
  });

  it("removes an option when it is already selected", () => {
    const onValueChange = vi.fn();
    render(
      <V2MultiCombobox
        options={options}
        value={["b1", "b2"]}
        onValueChange={onValueChange}
      />,
    );
    open();
    fireEvent.click(screen.getByRole("option", { name: /Đông Thành/ }));
    expect(onValueChange).toHaveBeenCalledWith(["b2"]);
  });

  it("does not select disabled options", () => {
    const onValueChange = vi.fn();
    render(
      <V2MultiCombobox
        options={options}
        value={[]}
        onValueChange={onValueChange}
      />,
    );
    open();
    fireEvent.click(screen.getByRole("option", { name: /Cũ/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears all selections with the clear button", () => {
    const onValueChange = vi.fn();
    render(
      <V2MultiCombobox
        options={options}
        value={["b1", "b2"]}
        onValueChange={onValueChange}
        clearable
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Bỏ lựa chọn" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("reserves room for the clear button so it does not overlap the chevron", () => {
    render(
      <V2MultiCombobox
        options={options}
        value={["b1"]}
        onValueChange={() => {}}
        clearable
      />,
    );
    expect(screen.getByRole("combobox")).toHaveClass("pr-14");
  });

  it("opens the list instead of clearing when the trigger is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <V2MultiCombobox
        options={options}
        value={["b1"]}
        onValueChange={onValueChange}
        clearable
      />,
    );
    open();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("filters options by search text", () => {
    render(
      <V2MultiCombobox options={options} value={[]} onValueChange={() => {}} />,
    );
    open();
    fireEvent.change(screen.getByPlaceholderText("Tìm kiếm..."), {
      target: { value: "phu quang" },
    });
    expect(
      screen.getByRole("option", { name: /Phú Quang/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Đông Thành/ })).toBeNull();
  });
});
