import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseServicesSection } from "../components/GarageCaseServicesSection";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("../store/garageStore", () => ({
  useGarageStore: () => ({
    selectedBranchId: "branch-test-1",
  }),
}));

vi.mock("../api/garageApi", () => ({
  garageApi: {
    getCaseServicesList: vi.fn().mockResolvedValue({
      data: [
        {
          id: "svc-1",
          soChungTu: "GR-PDV-2026-0001",
          bienSoXe: "51K-123.45",
          khachHangName: "Nguyễn Văn A",
          loaiSanPhamCode: "PT",
          sanPhamCode: "OIL-5W30",
          sanPhamName: "Nhớt động cơ 5W30",
          donViTinhText: "Lít",
          soLuongHoaDon: 4,
          donGia: 250000,
          tienChuaThue: 1000000,
          thueSuat: 10,
          tienCoThue: 1100000,
          tienDichVu: 0,
          tienPhuTung: 1000000,
          giaVonPhuTung: 700000,
          tienChietKhauCt: 0,
          branchName: "Chi nhánh Nam Sài Gòn",
          statusName: "Đã hoàn thành",
          classification: "Sửa chữa chung",
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
      totals: {
        grandTotal: {
          soLuongHoaDon: 4,
          tienChuaThue: 1000000,
          tienCoThue: 1100000,
          tienDichVu: 0,
          tienPhuTung: 1000000,
          giaVonPhuTung: 700000,
          tienChietKhauCt: 0,
          tienPhuPhi: 0,
        },
      },
    }),
    getCaseServiceColumnOptions: vi.fn().mockResolvedValue({
      items: ["OIL-5W30"],
      total: 1,
      page: 1,
      totalPages: 1,
    }),
    exportCaseServicesExcel: vi
      .fn()
      .mockResolvedValue("Chi_tiet_phieu_dich_vu_20260924.xlsx"),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("GarageCaseServicesSection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SpreadsheetPageTemplate with title, columns, and PillTabs for service types", async () => {
    render(<GarageCaseServicesSection />, { wrapper: createWrapper() });

    // Verify service type filter tabs are present
    expect(screen.getByText("Tất cả hạng mục")).toBeDefined();
    expect(screen.getByText("Công dịch vụ")).toBeDefined();
    expect(screen.getByText("Phụ tùng")).toBeDefined();
  });
});
