import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { V2GroupHeader } from "./V2GroupHeader";

describe("V2GroupHeader", () => {
  it("renders title and count in badge format", () => {
    render(<V2GroupHeader title="Kho & Tồn kho" count={5} />);
    expect(screen.getByText("Kho & Tồn kho")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
  });

  it("renders action slot when provided", () => {
    render(
      <V2GroupHeader
        title="Bán hàng"
        action={<button type="button">Chọn nhóm</button>}
      />,
    );
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chọn nhóm" }),
    ).toBeInTheDocument();
  });

  it("renders subtle variant without error", () => {
    render(<V2GroupHeader title="Tùy chọn" variant="subtle" />);
    expect(screen.getByText("Tùy chọn")).toBeInTheDocument();
  });

  it("renders horizontal divider line by default", () => {
    const { container } = render(<V2GroupHeader title="Báo cáo" />);
    expect(container.querySelector(".h-px")).toBeInTheDocument();
  });

  it("renders search input when search prop is provided", () => {
    render(
      <V2GroupHeader
        title="Dòng hàng"
        search={{
          value: "Lọc",
          onChange: () => {},
          placeholder: "Tìm kiếm...",
        }}
      />,
    );
    expect(screen.getByPlaceholderText("Tìm kiếm...")).toBeInTheDocument();
  });
});
