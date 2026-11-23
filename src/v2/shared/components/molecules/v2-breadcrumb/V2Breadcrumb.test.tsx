import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { V2Breadcrumb } from "./V2Breadcrumb";

describe("V2Breadcrumb Molecule", () => {
  it("renders breadcrumb items and current page indicator", () => {
    const handleClick = vi.fn();
    const items = [
      { label: "Trang chủ", onClick: handleClick },
      { label: "Bán hàng" },
      { label: "Đơn bán hàng" },
    ];

    render(<V2Breadcrumb items={items} />);

    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(screen.getByText("Bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();

    const homeBtn = screen.getByRole("button", { name: "Trang chủ" });
    fireEvent.click(homeBtn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    const currentPage = screen.getByText("Đơn bán hàng");
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });

  it("mặc định mobileMode='last-only': ẩn cấp cha trên mobile và hiện item cuối cùng", () => {
    const items = [
      { label: "Kế toán", href: "/accounting" },
      { label: "Hóa đơn VAT" },
    ];

    const { container } = render(<V2Breadcrumb items={items} />);

    const parentWrapper = screen.getByText("Kế toán").closest("div");
    expect(parentWrapper).toHaveClass("hidden");
    expect(parentWrapper).toHaveClass("sm:inline-flex");

    const link = screen.getByRole("link", { name: "Kế toán" });
    expect(link).toHaveAttribute("href", "/accounting");

    const lastWrapper = screen.getByText("Hóa đơn VAT").closest("div");
    expect(lastWrapper).not.toHaveClass("hidden");
    expect(lastWrapper).toHaveClass("truncate");

    // Separator ẩn trên mobile
    const separator = container.querySelector("[aria-hidden='true']");
    expect(separator).toHaveClass("hidden");
    expect(separator).toHaveClass("sm:inline-flex");
  });

  it("khi mobileMode='full': hiển thị đầy đủ mọi cấp trên cả mobile", () => {
    const items = [{ label: "Hệ thống" }, { label: "Phân quyền" }];

    const { container } = render(
      <V2Breadcrumb items={items} mobileMode="full" />,
    );

    const parentWrapper = screen.getByText("Hệ thống").closest("div");
    expect(parentWrapper).not.toHaveClass("hidden");
    expect(parentWrapper).toHaveClass("inline-flex");

    const separator = container.querySelector("[aria-hidden='true']");
    expect(separator).not.toHaveClass("hidden");
  });

  it("returns null when items is empty", () => {
    const { container } = render(<V2Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
