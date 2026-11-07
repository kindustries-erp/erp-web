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

  it("áp dụng class responsive: giảm height mobile h-11 sm:h-14, hiện item cuối breadcrumb trên mobile, avatar order-1, breadcrumb order-2, notification order-3", () => {
    const { container } = render(
      <V2Header
        breadcrumbs={[
          { label: "Trang chủ", href: "/home" },
          { label: "Bán hàng" },
        ]}
        userName="Admin"
        notificationNode={<div data-testid="bell">Bell</div>}
      />,
    );

    const header = screen.getByTestId("v2-header");
    expect(header).toHaveClass("h-11");
    expect(header).toHaveClass("sm:h-14");

    const breadcrumbContainer = container.querySelector("nav")?.parentElement;
    expect(breadcrumbContainer).toHaveClass("flex");
    expect(breadcrumbContainer).toHaveClass("order-2");
    expect(breadcrumbContainer).toHaveClass("sm:order-1");

    // Parent item "Trang chủ" is hidden on mobile
    const parentCrumbWrapper = screen.getByText("Trang chủ").closest("div");
    expect(parentCrumbWrapper).toHaveClass("hidden");
    expect(parentCrumbWrapper).toHaveClass("sm:inline-flex");

    // Last item "Bán hàng" is visible on mobile (not hidden)
    const lastCrumbWrapper = screen.getByText("Bán hàng").closest("div");
    expect(lastCrumbWrapper).not.toHaveClass("hidden");
    expect(lastCrumbWrapper).toHaveClass("truncate");

    const avatarContainer = screen.getByText("AD").closest(".order-1");
    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer).toHaveClass("sm:order-3");

    const notificationContainer = screen.getByTestId("bell").parentElement;
    expect(notificationContainer).toHaveClass("order-3");
    expect(notificationContainer).toHaveClass("sm:order-2");
  });
});
