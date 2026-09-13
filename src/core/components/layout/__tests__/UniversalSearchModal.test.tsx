import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UniversalSearchModal } from "../UniversalSearchModal";

// Mocks
const mockNavTo = vi.fn();
const mockOnClose = vi.fn();

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const map: Record<string, string> = {
      "nav.items.dashboard": "Tổng quan",
      "nav.sections.sales": "BÁN HÀNG",
      "nav.items.erpSalesOrders": "Đơn bán hàng",
      "nav.items.customers": "Khách hàng",
      "nav.sections.inventory": "KHO",
      "nav.items.erpInventoryStock": "Tồn kho",
      "nav.items.erpInventoryVouchers": "Chứng từ kho",
      "nav.universalSearch.placeholder": "Tìm kiếm menu...",
      "nav.universalSearch.noResults": "Không tìm thấy trang nào",
      "nav.universalSearch.hintNavigate": "di chuyển",
      "nav.universalSearch.hintOpen": "mở",
      "nav.universalSearch.hintClose": "đóng",
    };
    return map[key] ?? key;
  },
}));

vi.mock("../hooks/useNavItems", () => ({
  useNavItems: () => [
    {
      key: "dashboard",
      label: "Tổng quan",
      section: "Tổng quan",
      icon: <span>Icon-Dashboard</span>,
    },
    {
      key: "erp-sales-orders",
      label: "Đơn bán hàng",
      section: "BÁN HÀNG",
      icon: <span>Icon-Sales</span>,
    },
    {
      key: "erp-customers",
      label: "Khách hàng",
      section: "BÁN HÀNG",
      icon: <span>Icon-Customers</span>,
    },
    {
      key: "erp-inventory-stock",
      label: "Tồn kho",
      section: "KHO",
      icon: <span>Icon-Stock</span>,
    },
    {
      key: "erp-invoices-in",
      label: "Hóa đơn đầu vào",
      group: "Hóa đơn",
      section: "KẾ TOÁN",
      keywords: ["hoa don", "hóa đơn", "dau vao", "inbound"],
      icon: <span>Icon-Invoice</span>,
    },
  ],
}));

describe("UniversalSearchModal", () => {
  beforeEach(() => {
    mockNavTo.mockClear();
    mockOnClose.mockClear();
  });

  it("does not render content when open is false", () => {
    render(
      <UniversalSearchModal
        open={false}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    expect(screen.queryByPlaceholderText("Tìm kiếm menu...")).toBeNull();
  });

  it("renders search input and all nav items when open is true", () => {
    render(
      <UniversalSearchModal
        open={true}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    expect(screen.getByPlaceholderText("Tìm kiếm menu...")).toBeInTheDocument();
    expect(screen.getAllByText("Tổng quan").length).toBeGreaterThan(0);
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
    expect(screen.getByText("Tồn kho")).toBeInTheDocument();
  });

  it("filters items based on user input", () => {
    render(
      <UniversalSearchModal
        open={true}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu...");
    fireEvent.change(input, { target: { value: "bán" } });

    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.queryByText("Tồn kho")).toBeNull();
  });

  it("matches sub menu item when searching by group or keyword 'hóa đơn'", () => {
    render(
      <UniversalSearchModal
        open={true}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu...");
    fireEvent.change(input, { target: { value: "hóa đơn" } });

    expect(screen.getByText("Hóa đơn đầu vào")).toBeInTheDocument();
    expect(screen.getByText("• Hóa đơn")).toBeInTheDocument();
    expect(screen.queryByText("Tồn kho")).toBeNull();
  });

  it("shows empty state when no items match", () => {
    render(
      <UniversalSearchModal
        open={true}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu...");
    fireEvent.change(input, { target: { value: "xyznonexistent" } });

    expect(screen.getByText("Không tìm thấy trang nào")).toBeInTheDocument();
  });

  it("navigates and closes modal when item is clicked", () => {
    render(
      <UniversalSearchModal
        open={true}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    const item = screen.getByText("Đơn bán hàng");
    fireEvent.click(item);

    expect(mockNavTo).toHaveBeenCalledWith("erp-sales-orders");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("supports keyboard navigation with ArrowDown and Enter", () => {
    render(
      <UniversalSearchModal
        open={true}
        onClose={mockOnClose}
        navTo={mockNavTo}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu...");

    // Press ArrowDown to move to second item ("erp-sales-orders")
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Press Enter to select
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockNavTo).toHaveBeenCalledWith("erp-sales-orders");
    expect(mockOnClose).toHaveBeenCalled();
  });
});
