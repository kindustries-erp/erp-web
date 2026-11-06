import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { V2Button } from "@/v2/shared/components/atoms";
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

  it("render userMenuNode và notificationNode khi được truyền vào", () => {
    render(
      <V2Header
        userMenuNode={
          <V2Button data-testid="custom-user-menu">User Menu</V2Button>
        }
        notificationNode={
          <V2Button data-testid="custom-notification">Bell</V2Button>
        }
      />,
    );

    expect(screen.getByTestId("custom-user-menu")).toBeInTheDocument();
    expect(screen.getByTestId("custom-notification")).toBeInTheDocument();
  });

  it("áp dụng class responsive: ẩn breadcrumbs trên mobile, avatar order-1 và notification order-2", () => {
    const { container } = render(
      <V2Header
        breadcrumbs={[{ label: "Trang chủ" }]}
        userName="Admin"
        notificationNode={<div data-testid="bell">Bell</div>}
      />,
    );

    const breadcrumbContainer = container.querySelector("nav")?.parentElement;
    expect(breadcrumbContainer).toHaveClass("hidden");
    expect(breadcrumbContainer).toHaveClass("sm:flex");

    const avatarContainer = screen.getByText("AD").closest(".order-1");
    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer).toHaveClass("sm:order-3");

    const notificationContainer = screen.getByTestId("bell").parentElement;
    expect(notificationContainer).toHaveClass("order-2");
  });
});
