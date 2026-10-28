import React from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInvoiceDebtsExportDrawer } from "./InvoiceDebtsExportDrawer.hook";
import { invoiceDebtsExportApi } from "../api/invoiceDebtsExportApi";

vi.mock("../api/invoiceDebtsExportApi", () => ({
  invoiceDebtsExportApi: {
    listBackgroundHistory: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    startBackgroundExport: vi.fn(),
    downloadBackgroundFile: vi.fn(),
  },
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: any) =>
      typeof fallback === "object"
        ? fallback.defaultValue || _key
        : fallback || _key,
  }),
}));

describe("useInvoiceDebtsExportDrawer", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("initializes with initial partnerType and default columns", () => {
    const { result } = renderHook(
      () =>
        useInvoiceDebtsExportDrawer({
          open: true,
          initialPartnerType: "CUSTOMER",
        }),
      { wrapper },
    );

    expect(result.current.partnerType).toBe("CUSTOMER");
    expect(result.current.selectedColumns.length).toBeGreaterThan(0);
    expect(result.current.columnGroups.length).toBe(2);
  });

  it("starts export and calls startBackgroundExport", async () => {
    vi.mocked(
      invoiceDebtsExportApi.startBackgroundExport,
    ).mockResolvedValueOnce({
      jobId: "job-100",
      message: "Started",
      reused: false,
    });

    const { result } = renderHook(
      () =>
        useInvoiceDebtsExportDrawer({
          open: true,
          initialPartnerType: "CUSTOMER",
          buildBaseQuery: () => ({ search: "Test" }),
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.handleStartExport();
    });

    expect(invoiceDebtsExportApi.startBackgroundExport).toHaveBeenCalled();
  });
});
