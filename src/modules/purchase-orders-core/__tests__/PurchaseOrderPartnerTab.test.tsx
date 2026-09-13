import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  PurchaseOrderPartnerTab,
  PurchaseOrderPartnerRightPanel,
} from "../components/PurchaseOrderPartnerTab";
import { PurchaseOrderFinancialsTab } from "../components/PurchaseOrderFinancialsTab";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback || key,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("../api/purchaseOrdersCoreApi", () => ({
  purchaseOrdersCoreApi: {
    list: vi.fn().mockResolvedValue({
      items: [
        {
          id: "po-1",
          poNo: "PO-202609-001",
          orderDate: "2026-09-01T00:00:00.000Z",
          expectedDate: "2026-09-10T00:00:00.000Z",
          status: "CONFIRMED",
          totalAmount: 150000000,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }),
    getItemsList: vi.fn().mockResolvedValue({
      items: [
        {
          id: "item-1",
          purchaseOrderId: "po-1",
          poNo: "PO-202609-001",
          orderDate: "2026-09-01T00:00:00.000Z",
          itemCode: "SKU-PIN-01",
          itemName: "Pin Lithium 72V",
          qtyOrdered: "10",
          qtyReceived: "8",
          unitPrice: "15000000",
          amount: "150000000",
          status: "CONFIRMED",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }),
    getColumnOptions: vi.fn().mockResolvedValue({
      items: ["PO-202609-001"],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }),
    getItemsColumnOptions: vi.fn().mockResolvedValue({
      items: ["SKU-PIN-01"],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    }),
    getSupplierStats: vi.fn().mockResolvedValue({
      supplierId: "sup-1",
      totalOrders: 5,
      totalSpend: 500000000,
      totalReceivedAmount: 400000000,
      pendingAmount: 100000000,
      completionRate: 80.0,
      lastOrderDate: "2026-09-01T00:00:00.000Z",
    }),
    getLinkedInvoices: vi.fn().mockResolvedValue([
      {
        id: "inv-1",
        invoiceNo: "HD-001",
        invoiceDate: "2026-09-02",
        sellerName: "Công ty Phụ tùng ABC",
        preVatAmount: 100000000,
        vatAmount: 10000000,
        totalAmount: 110000000,
        status: "CONFIRMED",
      },
    ]),
  },
}));

vi.mock("@/modules/business-partners-core/api/businessPartnersCoreApi", () => ({
  businessPartnersCoreApi: {
    get: vi.fn().mockResolvedValue({
      id: "sup-1",
      code: "NCC-001",
      name: "Công ty TNHH Phụ tùng ABC",
      taxCode: "0101234567",
      phone: "0987654321",
      email: "contact@abc.vn",
      address: "123 Đường Mua Hàng, Hà Nội",
    }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("PurchaseOrderPartnerTab & FinancialsTab", () => {
  it("renders PurchaseOrderPartnerTab with PillTabs and DrawerSection table", async () => {
    render(
      <PurchaseOrderPartnerTab
        supplierId="sup-1"
        supplierName="Công ty TNHH Phụ tùng ABC"
      />,
      { wrapper: createWrapper() },
    );

    expect(
      screen.getAllByText("Danh sách Đơn mua hàng").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Chi tiết Dòng hàng đã mua")).toBeDefined();
  });

  it("toggles to lines view on button click", async () => {
    render(
      <PurchaseOrderPartnerTab
        supplierId="sup-1"
        supplierName="Công ty TNHH Phụ tùng ABC"
      />,
      { wrapper: createWrapper() },
    );

    const linesBtn = screen.getByText("Chi tiết Dòng hàng đã mua");
    fireEvent.click(linesBtn);
    expect(linesBtn).toBeDefined();
  });

  it("renders PurchaseOrderFinancialsTab correctly", async () => {
    render(
      <PurchaseOrderFinancialsTab
        purchaseOrder={{
          id: "po-1",
          total_amount: 150000000,
          document_date: "2026-09-01",
          status: "CONFIRMED",
          settled_amount: 0,
          open_amount: 150000000,
        }}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Tổng giá trị đơn đặt (PO)")).toBeDefined();
    expect(screen.getByText("Đã xuất Hóa đơn VAT")).toBeDefined();
  });

  it("renders PurchaseOrderPartnerRightPanel with 4 metric cards and supplier details", async () => {
    render(
      <PurchaseOrderPartnerRightPanel
        supplierId="sup-1"
        purchaseOrder={{
          id: "po-1",
          total_amount: 150000000,
          document_date: "2026-09-01",
          status: "CONFIRMED",
          settled_amount: 0,
          open_amount: 150000000,
        }}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Thông tin Nhà cung cấp")).toBeDefined();
    expect(screen.getByText("Tổng quan & Chỉ số Mua hàng")).toBeDefined();
    expect(screen.getByText("Tổng chi tiêu")).toBeDefined();
    expect(screen.getByText("Tổng đơn đặt")).toBeDefined();
    expect(screen.getByText("Đã nhận")).toBeDefined();
    expect(screen.getByText("Hoàn tất")).toBeDefined();
  });
});
