import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useInvoiceXmlImportMutation } from "./useInvoiceXmlImportMutation";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import type { FileEntry } from "./invoiceXmlUpload.type";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    bulkImportBuyerXml: vi.fn(),
    bulkImportSellerXml: vi.fn(),
    uploadPdfs: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

const pdfEntry: FileEntry = {
  file: new File([""], "a.pdf"),
  id: "p1",
  type: "pdf",
};

describe("useInvoiceXmlImportMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ghép PDF tay vào hóa đơn đã chọn, không gọi import XML tự động", async () => {
    vi.mocked(erpInvoicesCoreApi.uploadPdfs).mockResolvedValueOnce(
      undefined as any,
    );

    const { result } = renderHook(() => useInvoiceXmlImportMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      direction: "IN",
      targetFiles: [pdfEntry],
      manualMatches: { p1: "inv-1" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(erpInvoicesCoreApi.uploadPdfs).toHaveBeenCalledWith("inv-1", [
      pdfEntry.file,
    ]);
    expect(erpInvoicesCoreApi.bulkImportBuyerXml).not.toHaveBeenCalled();
    expect(result.current.data?.pdfAttached).toEqual([
      expect.objectContaining({
        filename: "a.pdf",
        invoiceId: "inv-1",
        invoiceNo: "Ghép thủ công",
      }),
    ]);
  });

  it("ghi lỗi vào kết quả khi ghép tay thất bại", async () => {
    vi.mocked(erpInvoicesCoreApi.uploadPdfs).mockRejectedValueOnce(
      new Error("boom"),
    );

    const { result } = renderHook(() => useInvoiceXmlImportMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      direction: "IN",
      targetFiles: [pdfEntry],
      manualMatches: { p1: "inv-1" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.errors).toEqual([
      expect.objectContaining({ filename: "a.pdf" }),
    ]);
  });

  it("import XML tự động theo chiều hóa đơn", async () => {
    vi.mocked(erpInvoicesCoreApi.bulkImportSellerXml).mockResolvedValueOnce({
      importId: "imp-9",
      direction: "OUT",
      total: 1,
      created: 1,
      skipped: [],
      errors: [],
    } as any);

    const xmlEntry: FileEntry = {
      file: new File([""], "b.xml"),
      id: "x1",
      type: "xml",
    };

    const { result } = renderHook(() => useInvoiceXmlImportMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ direction: "OUT", targetFiles: [xmlEntry] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(erpInvoicesCoreApi.bulkImportSellerXml).toHaveBeenCalledWith([
      xmlEntry.file,
    ]);
    expect(result.current.data?.importId).toBe("imp-9");
  });
});
