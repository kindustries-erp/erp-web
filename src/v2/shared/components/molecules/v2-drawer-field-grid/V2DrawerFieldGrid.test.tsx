import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { V2DrawerFieldGrid } from "./V2DrawerFieldGrid";

const fields = [
  { key: "a", label: "Trường A", render: () => <span>giá trị A</span> },
  {
    key: "b",
    label: "Trường B",
    required: true,
    error: "Lỗi B",
    className: "sm:col-span-2",
    render: () => <span>giá trị B</span>,
  },
];

describe("V2DrawerFieldGrid", () => {
  it("render mỗi trường với nhãn, nội dung, dấu bắt buộc và lỗi", () => {
    render(<V2DrawerFieldGrid fields={fields} />);
    expect(screen.getByText("Trường A")).toBeInTheDocument();
    expect(screen.getByText("giá trị A")).toBeInTheDocument();
    expect(screen.getByText("Trường B")).toBeInTheDocument();
    expect(screen.getByText("Lỗi B")).toBeInTheDocument();
  });

  it("lưới 1 cột bỏ class riêng của ô (không span 2 cột)", () => {
    const { container } = render(
      <V2DrawerFieldGrid fields={fields} columns={1} />,
    );
    expect(container.querySelector(".sm\\:col-span-2")).toBeNull();
    expect(container.firstElementChild?.className).toContain("grid-cols-1");
  });

  it("lưới 2 cột giữ class riêng để ô có thể span", () => {
    const { container } = render(<V2DrawerFieldGrid fields={fields} />);
    expect(container.querySelector(".sm\\:col-span-2")).not.toBeNull();
  });
});
