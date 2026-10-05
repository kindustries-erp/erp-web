import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2Header } from "./V2Header";

describe("V2Header Organism", () => {
  it("render breadcrumbs và user name", () => {
    render(
      <V2Header
        breadcrumbs={[
          { label: "Trang chủ", href: "/v2" },
          { label: "Bán hàng" },
        ]}
        userName="Nguyen Van A"
        userRole="Kế toán"
      />,
    );

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
  });

  it("gọi onReturnToV1 khi click nút quay lại V1", () => {
    const handleReturn = vi.fn();
    render(<V2Header onReturnToV1={handleReturn} />);

    const returnBtn = screen.getByRole("button", {
      name: /Quay lại ERP V1/i,
    });
    fireEvent.click(returnBtn);
    expect(handleReturn).toHaveBeenCalledTimes(1);
  });
});
