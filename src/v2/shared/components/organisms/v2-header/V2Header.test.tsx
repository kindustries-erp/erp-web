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

  it("không hiển thị nút quay lại V1 trong header chuẩn V2", () => {
    render(<V2Header />);
    expect(
      screen.queryByRole("button", { name: /Quay lại ERP V1/i }),
    ).not.toBeInTheDocument();
  });

  it("gọi onBranchClick khi click vào badge công ty/chi nhánh", () => {
    const handleBranch = vi.fn();
    render(
      <V2Header
        userName="Admin"
        tenantName="Greenway Corp"
        onBranchClick={handleBranch}
      />,
    );

    const companyEl = screen.getByText("Greenway Corp");
    fireEvent.click(companyEl);
    expect(handleBranch).toHaveBeenCalledTimes(1);
  });
});
