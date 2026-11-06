import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2MultiSelect } from "./V2MultiSelect";

const mockOptions = [
  { value: "u1", label: "admin@liouni.com", description: "Admin" },
  { value: "u2", label: "sales@liouni.com", description: "Bán hàng" },
  {
    value: "u3",
    label: "tech@liouni.com",
    description: "Kỹ thuật",
    disabled: true,
  },
];

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

describe("V2MultiSelect", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("shows placeholder when value is empty", () => {
    render(
      <V2MultiSelect
        options={mockOptions}
        value={[]}
        placeholder="Chọn người dùng..."
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Chọn người dùng...",
    );
  });

  it("renders badge tags for selected values", () => {
    render(<V2MultiSelect options={mockOptions} value={["u1", "u2"]} />);
    expect(screen.getByText("admin@liouni.com")).toBeInTheDocument();
    expect(screen.getByText("sales@liouni.com")).toBeInTheDocument();
  });

  it("removes tag when clicking the remove button", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    render(
      <V2MultiSelect
        options={mockOptions}
        value={["u1", "u2"]}
        onValueChange={onValueChange}
        onChange={onChange}
      />,
    );

    const removeBtn = screen.getByLabelText("Bỏ chọn admin@liouni.com");
    fireEvent.click(removeBtn);

    expect(onValueChange).toHaveBeenCalledWith(["u2"]);
    expect(onChange).toHaveBeenCalledWith(["u2"]);
  });

  it("opens popover and toggles selection on option click", () => {
    const onValueChange = vi.fn();

    render(
      <V2MultiSelect
        options={mockOptions}
        value={["u1"]}
        onValueChange={onValueChange}
      />,
    );

    // Open popover
    fireEvent.click(screen.getByRole("combobox"));

    // Click sales@liouni.com to add it
    const salesOption = screen.getByRole("option", {
      name: /sales@liouni\.com/i,
    });
    fireEvent.click(salesOption);

    expect(onValueChange).toHaveBeenCalledWith(["u1", "u2"]);
  });

  it("filters options when typing search query", () => {
    render(
      <V2MultiSelect
        options={mockOptions}
        value={[]}
        searchPlaceholder="Tìm email..."
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Tìm email...");
    fireEvent.change(searchInput, { target: { value: "sales" } });

    expect(screen.getByText("sales@liouni.com")).toBeInTheDocument();
    expect(screen.queryByText("admin@liouni.com")).not.toBeInTheDocument();
  });

  it("clears all selections when clicking Xóa hết in footer", () => {
    const onValueChange = vi.fn();

    render(
      <V2MultiSelect
        options={mockOptions}
        value={["u1", "u2"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const clearBtn = screen.getByText("Xóa hết");
    fireEvent.click(clearBtn);

    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("does not allow interaction when disabled", () => {
    const onValueChange = vi.fn();

    render(
      <V2MultiSelect
        options={mockOptions}
        value={["u1"]}
        disabled
        onValueChange={onValueChange}
      />,
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.queryByLabelText("Bỏ chọn admin@liouni.com"),
    ).not.toBeInTheDocument();
  });
});
