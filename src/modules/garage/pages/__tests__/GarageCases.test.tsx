import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCases } from "../GarageCases";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

vi.mock("../../store/garageStore", () => ({
  useGarageStore: () => ({
    selectedBranchId: "BRANCH_1",
    setSelectedBranchId: vi.fn(),
  }),
}));

vi.mock("../../components/organisms/garage-cases-table", () => ({
  GarageCasesTable: (props: any) => (
    <div data-testid="garage-cases-table">
      <span>GarageCasesTable Mounted</span>
      <button onClick={() => props.onOpenDetail("CASE-101")}>
        Open Detail
      </button>
      <button onClick={() => props.onExportExcel({ q: "abc" })}>Export</button>
      <button onClick={() => props.onSyncGrossProfit()}>
        Sync Gross Profit
      </button>
      <button onClick={() => props.onOpenWorkflow?.()}>View Workflow</button>
    </div>
  ),
}));

vi.mock("../../components/GarageCaseStandaloneDrawer", () => ({
  GarageCaseStandaloneDrawer: (props: any) =>
    props.isOpen ? (
      <div data-testid="standalone-drawer">{props.caseCode}</div>
    ) : null,
}));

vi.mock("../../components/GarageCaseSyncDrawer", () => ({
  GarageCaseSyncDrawer: (props: any) =>
    props.open ? <div data-testid="sync-drawer" /> : null,
}));

vi.mock("../../components/GarageCaseViewConfigDrawer", () => ({
  GarageCaseViewConfigDrawer: (props: any) =>
    props.open ? <div data-testid="view-config-drawer" /> : null,
}));

vi.mock("../../components/GarageExportDrawer", () => ({
  GarageExportDrawer: (props: any) =>
    props.open ? (
      <div
        data-testid="export-drawer"
        data-report-type={props.defaultReportType}
      />
    ) : null,
}));

vi.mock("../../components/GarageWorkflowDrawer", () => ({
  GarageWorkflowDrawer: (props: any) =>
    props.open ? <div data-testid="workflow-drawer" /> : null,
}));

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("@/shared/hooks/usePageViewPresets", () => ({
  usePageViewPresets: () => ({
    presets: [{ key: "overview", label: "Tổng quan" }],
    activePreset: { key: "overview", label: "Tổng quan" },
    selectView: vi.fn(),
    saveView: vi.fn(),
    deleteView: vi.fn(),
    resetView: vi.fn(),
  }),
}));

describe("GarageCases Page (L5)", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("renders GarageCases page and mounts GarageCasesTable organism", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCases />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("garage-cases-table")).toBeDefined();
    expect(screen.getByText("GarageCasesTable Mounted")).toBeDefined();
  });
  it("Xuất Excel mở drawer xuất chung, mặc định Bảng kê phiếu dịch vụ", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCases />
      </QueryClientProvider>,
    );
    expect(screen.queryByTestId("export-drawer")).toBeNull();
    fireEvent.click(screen.getByText("Export"));
    expect(
      screen.getByTestId("export-drawer").getAttribute("data-report-type"),
    ).toBe("cases-list");
  });

  it("Đồng bộ Lợi nhuận gộp mở drawer đồng bộ", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCases />
      </QueryClientProvider>,
    );
    expect(screen.queryByTestId("sync-drawer")).toBeNull();
    fireEvent.click(screen.getByText("Sync Gross Profit"));
    expect(screen.getByTestId("sync-drawer")).toBeDefined();
  });

  it("Xem sơ đồ quy trình mở GarageWorkflowDrawer", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageCases />
      </QueryClientProvider>,
    );
    expect(screen.queryByTestId("workflow-drawer")).toBeNull();
    fireEvent.click(screen.getByText("View Workflow"));
    expect(screen.getByTestId("workflow-drawer")).toBeDefined();
  });
});
