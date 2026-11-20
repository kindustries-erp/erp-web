import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { GarageCasesDetailDrawer } from "./GarageCasesDetailDrawer";
import type { GarageCasesScope } from "./GarageCasesDetailDrawer.type";

const emptyCategorized = {
  all: [],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: { billed: 0, paid: 0, remaining: 0, caseCount: 0, partnerCount: 0 },
};

const mockCategorizedWithCases = {
  all: [
    {
      key: "BH_01",
      payerType: "BH" as const,
      title: "Bảo hiểm PVI",
      buyerName: "Bảo hiểm PVI",
      billed: 500,
      paid: 200,
      remaining: 300,
      caseCount: 1,
      hasInvoice: true,
      invoiceNos: ["PVI-01"],
      hasVat: true,
      vatAmount: 50,
      vatWarning: false,
      cases: [
        {
          id: "c-101",
          soChungTu: "SC-101",
          bienSoXe: "30A-99999",
          khachHangName: "Bảo hiểm PVI",
          amount: 500,
          paid: 200,
          remaining: 300,
          cost: 200,
          paidCost: 50,
          remainingCost: 150,
          vatAmount: 50,
          vatWarning: false,
        },
      ],
    },
  ],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: {
    billed: 500,
    paid: 200,
    remaining: 300,
    caseCount: 1,
    partnerCount: 1,
  },
};

vi.mock("@/modules/garage/hooks/useGarageMonthReceivablesBreakdown", () => ({
  useGarageMonthReceivablesBreakdown: () => ({
    breakdown: { monthLabel: "Quá hạn 31-60 ngày" },
    trendItem: {
      label: "overdue31To60",
      tienCoThue: 1000,
      paid: 500,
      receivable: 500,
      collectionRate: 50,
      cost: 400,
      paidCost: 100,
      payableCost: 300,
      costPaymentRate: 25,
      caseCount: 2,
    },
    summary: {
      totalBilled: 1000,
      totalPaid: 500,
      totalRemaining: 500,
      collectionRate: 50,
      customer: {
        billed: 800,
        paid: 400,
        remaining: 400,
        rate: 50,
        caseCount: 1,
        withInvoiceAmount: 800,
        noInvoiceAmount: 0,
        vatWithoutInvoiceAmount: 0,
      },
      insurance: {
        billed: 200,
        paid: 100,
        remaining: 100,
        rate: 50,
        caseCount: 1,
        withInvoiceAmount: 200,
        noInvoiceAmount: 0,
        vatWithoutInvoiceAmount: 0,
      },
    },
    insuranceCategorized: mockCategorizedWithCases,
    enterpriseCategorized: emptyCategorized,
    individualCategorized: emptyCategorized,
    warning: undefined,
    isLoading: false,
  }),
}));

vi.mock("@/modules/garage/api/garageDashboardApi", () => ({
  garageDashboardApi: {
    getCheckpointVehicles: vi.fn().mockResolvedValue({
      items: [
        {
          vehicleKey: "51H97732",
          bienSoXe: "51H97732",
          khachHangName: "Anh Huỳnh Anh",
          classification: "KHAC",
          caseCount: 1,
          soChungTus: ["GR-PDV2611-0002"],
          cases: [
            {
              id: "cp-1",
              vehicleKey: "51H97732",
              soChungTu: "GR-PDV2611-0002",
              bienSoXe: "51H97732",
              khachHangCode: "KH001",
              khachHangName: "Anh Huỳnh Anh",
              tenTinhTrangDichVu: "Kết thúc",
              classification: "KHAC",
              doanhThu: 13800000,
              chiPhi: 2000000,
              loiNhuan: 11800000,
              tienCoThue: 16800000,
              tienDaThanhToan: 0,
              tienConPhaiThanhToan: 16800000,
              hasInvoice: false,
              ngayHoanThanhCongViec: "2026-11-05",
              ngayPhatSinh: "2026-11-01",
            },
          ],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      summary: {
        totalCount: 1,
        totalCases: 2,
        totalTienCoThue: 16800000,
        totalRevenue: 13800000,
        totalCost: 2000000,
        totalProfit: 11800000,
        totalPaid: 0,
        totalRemaining: 16800000,
        collectionRate: 0,
        paidCount: 0,
        remainingCount: 1,
        unpaidCount: 1,
      },
    }),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

const monthItem = {
  label: "2026-10",
  tienCoThue: 1000,
  paid: 500,
  receivable: 500,
  collectionRate: 50,
  cost: 400,
  paidCost: 100,
  payableCost: 300,
  costPaymentRate: 25,
  caseCount: 2,
} as GarageTrendItem;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderCasesScope(
  scope: GarageCasesScope | null,
  showProfitMetrics = false,
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <GarageCasesDetailDrawer
        open={true}
        onClose={vi.fn()}
        scope={scope}
        showProfitMetrics={showProfitMetrics}
      />
    </QueryClientProvider>,
  );
}

describe("GarageCasesDetailDrawer: Organism lõi dùng chung", () => {
  it("không render gì khi scope null", () => {
    const { container } = renderCasesScope(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("render đúng cấu trúc debt mode (3 tabs, ẩn 3 cột P&L, panel phải công nợ)", () => {
    renderCasesScope({ kind: "month", item: monthItem }, false);

    expect(screen.getByText("Tháng 10/2026")).toBeInTheDocument();
    expect(screen.getByText("Phiếu còn công nợ")).toBeInTheDocument();
    expect(screen.getByText("Phân loại theo đối tượng")).toBeInTheDocument();
    expect(screen.getByText("Phân loại Nghiệp vụ")).toBeInTheDocument();

    // Right panel công nợ
    expect(screen.getByText("Cơ cấu Thu KH vs Thu BH")).toBeInTheDocument();
    expect(screen.getByText("Chi phí phát sinh & Còn nợ")).toBeInTheDocument();

    // Không có cột Doanh thu thuần ở header bảng khi showProfitMetrics = false
    expect(screen.queryByText("Doanh thu thuần")).not.toBeInTheDocument();
  });

  it("render đúng cấu trúc checkpoint mode (có 3 cột P&L, Section P&L ở Right panel)", async () => {
    renderCasesScope(
      {
        kind: "checkpoint",
        dateFrom: "2026-11-01",
        dateTo: "2026-11-30",
        periodLabel: "Tháng 11/2026",
      },
      true,
    );

    // Tiêu đề checkpoint & tab Danh sách xe
    expect(
      screen.getByText("Vụ việc Dịch vụ Garage · Tháng 11/2026"),
    ).toBeInTheDocument();
    expect(screen.getByText("Danh sách xe")).toBeInTheDocument();
    expect(screen.getByText("Xuất Excel")).toBeInTheDocument();

    // Đã xóa nút Phải thu / Phải trả theo yêu cầu
    expect(screen.queryByText("Phải thu")).not.toBeInTheDocument();
    expect(screen.queryByText("Phải trả")).not.toBeInTheDocument();

    // Right panel P&L
    expect(screen.getByText("Hiệu quả kinh doanh (P&L)")).toBeInTheDocument();
    expect(screen.getByText("Tiến độ Thu tiền & Công nợ")).toBeInTheDocument();

    // Cả header bảng và Right Panel đều có các nhãn P&L
    expect(
      screen.getAllByText("Doanh thu thuần").length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Chi phí").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Lợi nhuận gộp").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("render đúng checkpoint mode khi có phân loại ERP (gọi API kèm classification và hiện subtitle)", async () => {
    const { garageDashboardApi } =
      await import("@/modules/garage/api/garageDashboardApi");

    renderCasesScope(
      {
        kind: "checkpoint",
        dateFrom: "2026-11-01",
        dateTo: "2026-11-30",
        periodLabel: "Tháng 11/2026 · Sửa chữa chung",
        classification: "SUA_CHUA_CHUNG",
        classificationName: "Sửa chữa chung",
      },
      true,
    );

    expect(
      screen.getByText(
        "Vụ việc Dịch vụ Garage · Tháng 11/2026 · Sửa chữa chung",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Khoảng thời gian: 2026-11-01 đến 2026-11-30 · Phân loại: Sửa chữa chung",
      ),
    ).toBeInTheDocument();
    // 1 xe (distinct biển số) nhưng 2 lệnh: hai số phải hiển thị tách bạch.
    // Số liệu checkpoint tải bất đồng bộ nên chờ nhãn xuất hiện.
    expect((await screen.findByTestId("cases-drawer-counts")).textContent).toBe(
      "1 xe · 2 lệnh",
    );

    expect(garageDashboardApi.getCheckpointVehicles).toHaveBeenCalledWith(
      expect.objectContaining({
        date_from: "2026-11-01",
        date_to: "2026-11-30",
        classification: "SUA_CHUA_CHUNG",
      }),
    );
  });
});
