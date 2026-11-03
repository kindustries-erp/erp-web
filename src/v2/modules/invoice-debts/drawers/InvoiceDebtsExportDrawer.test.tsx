import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceDebtsExportDrawer } from "./InvoiceDebtsExportDrawer";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: any) =>
      typeof fallback === "object"
        ? fallback.defaultValue || _key
        : fallback || _key,
  }),
}));

vi.mock("../api/invoiceDebtsExportApi", () => ({
  invoiceDebtsExportApi: {
    listBackgroundHistory: vi.fn().mockResolvedValue({
      items: [
        {
          jobId: "job-101",
          fileName: "Bao_cao_cong_no.xlsx",
          status: "COMPLETED",
          current: 10,
          total: 10,
          message: "Ready",
          createdAt: "2026-10-26T10:00:00.000Z",
          canDownload: true,
        },
      ],
      total: 1,
    }),
    startBackgroundExport: vi.fn(),
    downloadBackgroundFile: vi.fn(),
  },
}));

describe("InvoiceDebtsExportDrawer (V2)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <InvoiceDebtsExportDrawer
          open={true}
          onClose={vi.fn()}
          initialPartnerType="CUSTOMER"
          buildBaseQuery={() => ({ search: "abc" })}
        />
      </QueryClientProvider>,
    );

  it("renders export drawer with title, tabs, and action button", async () => {
    renderComponent();

    expect(screen.getByText("Xuất Excel báo cáo công nợ")).toBeDefined();
    expect(screen.getByText("Tất cả")).toBeDefined();
    expect(screen.getByText("Khách hàng")).toBeDefined();
    expect(screen.getByText("Nhà cung cấp")).toBeDefined();
    expect(screen.getByRole("button", { name: /Xuất Excel/i })).toBeDefined();
  });
});
