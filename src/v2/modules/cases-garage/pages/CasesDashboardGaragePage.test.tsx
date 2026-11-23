import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CasesDashboardGaragePage } from "./CasesDashboardGaragePage";
import { useCasesDashboardGarage } from "../hooks/useCasesDashboardGarage";
import { useViewport } from "@/v2/shared/hooks/useViewport";

vi.mock("../hooks/useCasesDashboardGarage", () => ({
  useCasesDashboardGarage: vi.fn(),
}));
vi.mock("@/v2/shared/hooks/useViewport", () => ({
  useViewport: vi.fn(),
}));

const kpi = (vehicles: number, cases: number, amount: number) => ({
  totalVehicles: vehicles,
  totalCases: cases,
  totalAmountWithTax: amount,
});

const bucket = {
  totalVehicles: 4,
  totalCases: 6,
  totalAmount: 900,
  stages: {
    quotation: { vehicles: 1, amount: 100, rate: 25 },
    inProgress: { vehicles: 1, amount: 100, rate: 25 },
    completed: { vehicles: 2, amount: 600, rate: 50 },
    cancelled: { vehicles: 0, amount: 0, rate: 0 },
  },
};

const data = {
  kpi: {
    month: kpi(4, 6, 900),
    week: kpi(2, 3, 300),
    day: kpi(1, 1, 100),
    projectedToday: { totalVehicles: 1, totalAmount: 50, classifications: {} },
    projectedMonth: { totalVehicles: 3, totalAmount: 150, classifications: {} },
  },
  funnel: {
    overall: bucket,
    byMonth: {},
    byClassification: {
      SUA_CHUA_CHUNG: bucket,
      KY_GUI_NOI_BO: bucket,
      OJ_NGOAI: bucket,
      KHAC: bucket,
    },
  },
};

function hook(overrides: Record<string, unknown> = {}) {
  return {
    kpi: data.kpi,
    funnel: data.funnel,
    isLoading: false,
    hasError: false,
    selectedStage: null,
    openStage: vi.fn(),
    closeStage: vi.fn(),
    vehicles: undefined,
    vehiclesLoading: false,
    page: 1,
    setPage: vi.fn(),
    ...overrides,
  };
}

describe("trang dashboard garage V2", () => {
  beforeEach(() => {
    vi.mocked(useCasesDashboardGarage).mockReturnValue(hook() as never);
    vi.mocked(useViewport).mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });

  it("desktop: render bố cục desktop với thẻ tháng và dự thu", () => {
    render(<CasesDashboardGaragePage />);

    expect(screen.getByTestId("cases-dashboard-desktop")).toBeTruthy();
    expect(screen.queryByTestId("cases-dashboard-mobile")).toBeNull();
    expect(screen.getByTestId("kpi-month")).toBeTruthy();
    expect(screen.getByTestId("projected-month")).toBeTruthy();
  });

  it("mobile: chọn bố cục mobile khi viewport hẹp", () => {
    vi.mocked(useViewport).mockReturnValue({
      width: 390,
      height: 844,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });
    render(<CasesDashboardGaragePage />);

    expect(screen.getByTestId("cases-dashboard-mobile")).toBeTruthy();
    expect(screen.queryByTestId("cases-dashboard-desktop")).toBeNull();
  });

  it("bấm một giai đoạn của phễu gọi openStage với đúng khóa", () => {
    const h = hook();
    vi.mocked(useCasesDashboardGarage).mockReturnValue(h as never);
    render(<CasesDashboardGaragePage />);

    const row = screen.getByTestId("funnel-row-completed");
    fireEvent.click(row.querySelector("button") as HTMLButtonElement);

    expect(h.openStage).toHaveBeenCalledWith("completed");
  });

  it("khi đã chọn giai đoạn thì hiện danh sách xe (mỗi xe một dòng)", () => {
    vi.mocked(useCasesDashboardGarage).mockReturnValue(
      hook({
        selectedStage: "completed",
        vehicles: {
          items: [
            {
              vehicleKey: "51A12345",
              licensePlate: "51A12345",
              customerName: "Khách A",
              caseCount: 2,
              caseCodes: ["PH-001", "PH-002"],
              amount: 600,
              latestAt: null,
              cases: [],
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            next: null,
            previous: null,
          },
        },
      }) as never,
    );
    render(<CasesDashboardGaragePage />);

    expect(screen.getByTestId("cases-dashboard-cases-list")).toBeTruthy();
    expect(screen.getByText("PH-001, PH-002")).toBeTruthy();
    expect(screen.getByText("51A12345")).toBeTruthy();
  });

  it("lỗi tải thì hiện thông báo lỗi và không render số liệu", () => {
    vi.mocked(useCasesDashboardGarage).mockReturnValue(
      hook({ hasError: true, kpi: undefined, funnel: undefined }) as never,
    );
    render(<CasesDashboardGaragePage />);

    expect(screen.queryByTestId("kpi-month")).toBeNull();
    expect(screen.getByText(/Không tải được|Could not load/)).toBeTruthy();
  });
});
