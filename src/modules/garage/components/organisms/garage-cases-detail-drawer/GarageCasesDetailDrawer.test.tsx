import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCasesDetailDrawer } from "./GarageCasesDetailDrawer";
import type { GarageCasesScope } from "./GarageCasesDetailDrawer.type";
import { monthItem } from "./GarageCasesDetailDrawer.fixtures";

vi.mock(
  "@/modules/garage/hooks/useGarageMonthReceivablesBreakdown",
  async () => {
    const fx = await import("./GarageCasesDetailDrawer.fixtures");
    return {
      useGarageMonthReceivablesBreakdown: () => fx.buildMonthBreakdownMock(),
    };
  },
);

vi.mock("@/modules/garage/api/garageDashboardApi", async () => {
  const fx = await import("./GarageCasesDetailDrawer.fixtures");
  return {
    garageDashboardApi: {
      getCheckpointVehicles: vi
        .fn()
        .mockResolvedValue(fx.checkpointVehiclesMock),
    },
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

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

    // Tiêu đề checkpoint & tab Danh sách xe & tab Tiến độ công việc
    expect(
      screen.getByText("Vụ việc Dịch vụ Garage · Tháng 11/2026"),
    ).toBeInTheDocument();
    expect(screen.getByText("Danh sách xe")).toBeInTheDocument();
    expect(screen.getByText("Tiến độ công việc")).toBeInTheDocument();
    expect(screen.getByText("Xuất Excel")).toBeInTheDocument();

    // Đã xóa nút Phải thu / Phải trả theo yêu cầu
    expect(screen.queryByText("Phải thu")).not.toBeInTheDocument();
    expect(screen.queryByText("Phải trả")).not.toBeInTheDocument();

    // Right panel Tiến độ Dịch vụ Xe & Dòng tiền Dịch vụ Xe
    expect(screen.getByText("Tiến độ Dịch vụ Xe")).toBeInTheDocument();
    expect(screen.getByText("Dòng tiền Dịch vụ Xe")).toBeInTheDocument();

    // Header bảng có các nhãn P&L
    expect(
      screen.getAllByText("Doanh thu thuần").length,
    ).toBeGreaterThanOrEqual(1);
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

  it("giữ overflow-y-auto (cho phép scroll) ở debt mode", () => {
    renderCasesScope({ kind: "month", item: monthItem }, false);

    const dialog = screen.getByRole("dialog");
    const scrollContainers = dialog.querySelectorAll(".overflow-y-auto");
    expect(scrollContainers.length).toBeGreaterThan(0);
    expect(dialog.querySelector(".overflow-hidden.p-3")).toBeNull();
  });

  it("chỉ bật overflow-hidden khi chuyển sang tab Kanban ở checkpoint mode", () => {
    renderCasesScope(
      {
        kind: "checkpoint",
        dateFrom: "2026-11-01",
        dateTo: "2026-11-30",
        periodLabel: "Tháng 11/2026",
      },
      true,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".overflow-hidden.p-3")).toBeNull();

    fireEvent.click(screen.getByText("Tiến độ công việc"));
    expect(dialog.querySelector(".overflow-hidden.p-3")).not.toBeNull();
  });
});
