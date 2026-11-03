import React from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInvoiceDebtsExportHistory } from "./InvoiceDebtsExportDrawer.history.hook";
import { invoiceDebtsExportApi } from "../api/invoiceDebtsExportApi";

vi.mock("../api/invoiceDebtsExportApi", () => ({
  invoiceDebtsExportApi: {
    listBackgroundHistory: vi.fn(),
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

describe("useInvoiceDebtsExportHistory", () => {
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

  it("fetches history when open is true", async () => {
    vi.mocked(
      invoiceDebtsExportApi.listBackgroundHistory,
    ).mockResolvedValueOnce({
      items: [
        {
          jobId: "job-1",
          fileName: "file.xlsx",
          status: "COMPLETED",
          current: 10,
          total: 10,
          message: "ok",
          createdAt: "2026-10-26T10:00:00.000Z",
          canDownload: true,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const { result } = renderHook(
      () =>
        useInvoiceDebtsExportHistory({
          open: true,
          page: 1,
          pageSize: 10,
        }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(result.current.historyItems.length).toBe(1);
    });

    expect(result.current.historyItems[0].fileName).toBe("file.xlsx");
    expect(result.current.historyItems[0].statusTone).toBe("ready");
  });
});
