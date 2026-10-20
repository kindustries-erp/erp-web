import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MultiCombobox } from "./MultiCombobox";

const options = [
  { value: "a", label: "Báo cáo" },
  { value: "b", label: "Báo cáo lợi nhuận" },
  { value: "c", label: "Công nợ phải thu" },
];

describe("MultiCombobox - trigger một dòng", () => {
  it("không chọn gì thì hiện placeholder", () => {
    render(
      <MultiCombobox
        options={options}
        value={[]}
        onChange={vi.fn()}
        placeholder="Loại báo cáo"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Loại báo cáo" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it("chọn nhiều mục: chỉ hiện chip đầu và badge +N, không dùng flex-wrap", () => {
    render(
      <MultiCombobox
        options={options}
        value={["a", "b", "c"]}
        onChange={vi.fn()}
        placeholder="Loại báo cáo"
      />,
    );
    const trigger = screen.getByRole("button", { name: /3 mục đã chọn/ });
    expect(trigger.className).not.toContain("flex-wrap");
    expect(trigger.className).toContain("h-9");
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.queryByText("Công nợ phải thu")).toBeNull();
  });

  it("chọn đúng một mục thì không có badge", () => {
    render(
      <MultiCombobox options={options} value={["a"]} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Báo cáo")).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it("nút X ở chip đầu bỏ mục đó và không mở popover", () => {
    const onChange = vi.fn();
    const { container } = render(
      <MultiCombobox
        options={options}
        value={["a", "b"]}
        onChange={onChange}
      />,
    );
    const removeIcon = container.querySelector("svg.cursor-pointer") as Element;
    fireEvent.click(removeIcon);
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("hover/focus vào nút: tooltip liệt kê đủ các mục đã chọn", async () => {
    render(
      <MultiCombobox
        options={options}
        value={["a", "b", "c"]}
        onChange={vi.fn()}
      />,
    );
    fireEvent.focus(screen.getByRole("button", { name: /3 mục đã chọn/ }));
    await waitFor(() => {
      expect(screen.getAllByText("Báo cáo lợi nhuận").length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText("Công nợ phải thu").length).toBeGreaterThan(0);
    });
  });
});
