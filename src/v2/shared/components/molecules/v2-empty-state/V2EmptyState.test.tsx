import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2EmptyState } from "./V2EmptyState";

describe("V2EmptyState", () => {
  it("uses the default title", () => {
    render(<V2EmptyState />);
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("renders a custom title, description and action", () => {
    render(
      <V2EmptyState
        title="Chưa có hóa đơn"
        description="Đồng bộ từ Cổng thuế để bắt đầu"
        action={<button type="button">Đồng bộ</button>}
      />,
    );
    expect(screen.getByText("Chưa có hóa đơn")).toBeInTheDocument();
    expect(
      screen.getByText("Đồng bộ từ Cổng thuế để bắt đầu"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đồng bộ" })).toBeInTheDocument();
  });

  it("renders a custom icon", () => {
    render(<V2EmptyState icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
