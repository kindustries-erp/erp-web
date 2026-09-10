import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Combobox } from "../Combobox";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    const map: Record<string, string> = {
      "common.select": "— Chọn —",
    };
    return map[key] ?? fallback ?? key;
  },
}));

describe("Combobox deduplication & i18n placeholder", () => {
  it("renders default i18n placeholder when placeholder is not provided", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        options={[
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
        ]}
        value=""
        onChange={onChange}
      />,
    );

    expect(screen.getByText("— Chọn —")).toBeInTheDocument();
  });

  it("filters out empty value option when allowClear is true to prevent double '— Chọn —'", () => {
    const onChange = vi.fn();
    const optionsWithManualEmpty = [
      { value: "", label: "— Chọn —" },
      { value: "damaged", label: "Hàng hỏng" },
      { value: "lost", label: "Thất thoát" },
    ];

    render(
      <Combobox
        options={optionsWithManualEmpty}
        value=""
        onChange={onChange}
        allowClear={true}
      />,
    );

    // Open dropdown
    const trigger = screen.getByRole("button", { name: /— Chọn —/i });
    fireEvent.click(trigger);

    // Dropdown items with label '— Chọn —' should appear only ONCE (the clear button)
    const emptyOptionElements = screen.getAllByText("— Chọn —");
    // 1 in trigger button, 1 in dropdown clear button -> exactly 2 occurrences in document
    expect(emptyOptionElements).toHaveLength(2);

    // Normal options still rendered
    expect(screen.getByText("Hàng hỏng")).toBeInTheDocument();
    expect(screen.getByText("Thất thoát")).toBeInTheDocument();
  });

  it("calls onChange with empty string when clear option is clicked", () => {
    const onChange = vi.fn();
    const options = [
      { value: "damaged", label: "Hàng hỏng" },
      { value: "lost", label: "Thất thoát" },
    ];

    render(
      <Combobox
        options={options}
        value="damaged"
        onChange={onChange}
        allowClear={true}
      />,
    );

    // Open dropdown
    const trigger = screen.getByRole("button", { name: /Hàng hỏng/i });
    fireEvent.click(trigger);

    // Click the clear option button
    const clearBtn = screen.getByText("— Chọn —");
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith("");
  });
});
