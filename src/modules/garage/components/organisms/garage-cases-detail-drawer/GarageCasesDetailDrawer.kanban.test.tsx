import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCasesDetailDrawer } from "./GarageCasesDetailDrawer";

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

vi.mock("@/v2/modules/cases-garage/api/caseProgressApi", () => ({
  caseProgressApi: {
    listAll: vi.fn().mockResolvedValue([]),
    updateStatus: vi.fn(),
    updateProgress: vi.fn(),
    revert: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, def?: string) => def || _k,
  }),
}));

describe("GarageCasesDetailDrawer: tab Tiến độ công việc", () => {
  it("chuyển sang tab Tiến độ công việc và hiển thị đủ 5 cột Kanban khi click", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCasesDetailDrawer
          open={true}
          onClose={vi.fn()}
          scope={{
            kind: "checkpoint",
            dateFrom: "2026-11-01",
            dateTo: "2026-11-30",
            periodLabel: "Tháng 11/2026",
          }}
          showProfitMetrics={true}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByText("Tiến độ công việc"));

    expect(screen.getByText("Tiếp nhận")).toBeInTheDocument();
    expect(screen.getAllByText("Đang làm").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Hoàn thành").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Hủy")).toBeInTheDocument();
  });
});
