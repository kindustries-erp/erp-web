import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getOriginalPdfLookupInfo: vi.fn(),
    downloadOriginalPdf: vi.fn(),
    uploadManualPdf: vi.fn(),
  },
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { useOriginalPdfLookupInfo } from "./useOriginalPdfLookupInfo";
import { useDownloadOriginalPdf } from "./useDownloadOriginalPdf";
import { useManualUploadPdf } from "./useManualUploadPdf";

const wrapperFor = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("original PDF hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useOriginalPdfLookupInfo loads lookup info for an invoice", async () => {
    vi.mocked(erpInvoicesCoreApi.getOriginalPdfLookupInfo).mockResolvedValue({
      invoiceId: "inv-1",
      lookupCode: "M1-26",
      hints: [],
    } as any);

    const { result } = renderHook(() => useOriginalPdfLookupInfo("inv-1"), {
      wrapper: wrapperFor(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(erpInvoicesCoreApi.getOriginalPdfLookupInfo).toHaveBeenCalledWith(
      "inv-1",
    );
    expect(result.current.data?.lookupCode).toBe("M1-26");
  });

  it("useOriginalPdfLookupInfo does not fetch without an invoice id", () => {
    renderHook(() => useOriginalPdfLookupInfo(null), { wrapper: wrapperFor() });
    expect(erpInvoicesCoreApi.getOriginalPdfLookupInfo).not.toHaveBeenCalled();
  });

  it("useDownloadOriginalPdf calls the download endpoint", async () => {
    vi.mocked(erpInvoicesCoreApi.downloadOriginalPdf).mockResolvedValue({
      success: true,
      pdfError: null,
    } as any);

    const { result } = renderHook(() => useDownloadOriginalPdf(), {
      wrapper: wrapperFor(),
    });
    await act(async () => {
      await result.current.mutateAsync("inv-2");
    });

    expect(erpInvoicesCoreApi.downloadOriginalPdf).toHaveBeenCalledWith(
      "inv-2",
    );
  });

  it("useManualUploadPdf uploads the file for the invoice", async () => {
    vi.mocked(erpInvoicesCoreApi.uploadManualPdf).mockResolvedValue({
      invoiceId: "inv-3",
      pdfFileKey: "invoices/pdf/inv-3.pdf",
      pdfSource: "manual_upload",
    });
    const file = new File(["%PDF-1.4"], "hd.pdf", { type: "application/pdf" });

    const { result } = renderHook(() => useManualUploadPdf(), {
      wrapper: wrapperFor(),
    });
    await act(async () => {
      await result.current.mutateAsync({ invoiceId: "inv-3", file });
    });

    expect(erpInvoicesCoreApi.uploadManualPdf).toHaveBeenCalledWith(
      "inv-3",
      file,
    );
  });
});
