import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2ComboboxList } from "./V2ComboboxList";
import type { V2ComboboxOption } from "./V2Combobox.type";

const baseProps = {
  value: null,
  activeIndex: -1,
  emptyLabel: "Trống",
  loadingText: "Đang tải",
  onSelect: vi.fn(),
  onHoverIndex: vi.fn(),
};

const options: V2ComboboxOption[] = [
  {
    value: "1",
    label: "Kỳ 1",
    tooltip: "Đã trả gốc 10.000.000",
  },
  {
    value: "2",
    label: "Kỳ 2 [Đã trả]",
    disabled: true,
    tooltip: "Đã trả lãi 1.000.000",
  },
  { value: "3", label: "Kỳ 3" },
];

describe("V2ComboboxList tooltip", () => {
  it("option disabled có aria-disabled và class không cho bấm", () => {
    render(<V2ComboboxList {...baseProps} options={options} />);

    const disabledRow = screen.getByRole("option", { name: /Kỳ 2/ });
    expect(disabledRow).toHaveAttribute("aria-disabled", "true");
    expect(disabledRow.className).toContain("cursor-not-allowed");
  });

  it("desktop: nội dung tooltip không hiện sẵn trong DOM", () => {
    render(<V2ComboboxList {...baseProps} options={options} />);
    expect(screen.queryByText("Đã trả gốc 10.000.000")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Kỳ 1/ })).toBeInTheDocument();
  });

  it("mobile: tooltip hiện thành dòng phụ dưới nhãn", () => {
    render(<V2ComboboxList {...baseProps} options={options} isMobile={true} />);
    expect(screen.getByText("Đã trả gốc 10.000.000")).toBeInTheDocument();
    expect(screen.getByText("Đã trả lãi 1.000.000")).toBeInTheDocument();
  });

  it("option không có tooltip render như cũ (không có dòng phụ mobile)", () => {
    render(
      <V2ComboboxList
        {...baseProps}
        options={[{ value: "3", label: "Kỳ 3" }]}
        isMobile={true}
      />,
    );
    expect(screen.getByRole("option", { name: "Kỳ 3" })).toBeInTheDocument();
    expect(screen.queryByText(/Đã trả/)).not.toBeInTheDocument();
  });
});
