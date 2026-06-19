import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInvoiceXmlUpload } from "../hooks/useInvoiceXmlUpload";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    bulkImportBuyerXml: vi.fn(),
    bulkImportSellerXml: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultString: string) => defaultString || key,
  }),
}));

// Mock crypto
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => "mock-uuid",
  },
});

describe("useInvoiceXmlUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOnImported = vi.fn();

  it("should initialize in select step", () => {
    const { result } = renderHook(() => useInvoiceXmlUpload(mockOnImported));

    expect(result.current.step).toBe("select");
    expect(result.current.direction).toBe("IN");
    expect(result.current.files).toEqual([]);
    expect(result.current.result).toBeNull();
  });

  it("should add xml files only", () => {
    const { result } = renderHook(() => useInvoiceXmlUpload(mockOnImported));

    const xmlFile = new File([""], "test.xml", { type: "text/xml" });
    const txtFile = new File([""], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.addFiles([xmlFile, txtFile]);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].file.name).toBe("test.xml");
  });

  it("should remove file by id", () => {
    const { result } = renderHook(() => useInvoiceXmlUpload(mockOnImported));
    const xmlFile = new File([""], "test.xml", { type: "text/xml" });

    act(() => {
      result.current.addFiles([xmlFile]);
    });

    const fileId = result.current.files[0].id;

    act(() => {
      result.current.removeFile(fileId);
    });

    expect(result.current.files).toHaveLength(0);
  });

  it("should handle successful import", async () => {
    vi.mocked(erpInvoicesCoreApi.bulkImportBuyerXml).mockResolvedValueOnce({
      total: 1,
      created: 1,
      skipped: [],
      errors: [],
      importId: "import-123",
      direction: "IN",
    });

    const { result } = renderHook(() => useInvoiceXmlUpload(mockOnImported));
    const xmlFile = new File([""], "test.xml", { type: "text/xml" });

    act(() => {
      result.current.addFiles([xmlFile]);
    });

    await act(async () => {
      await result.current.handleImport();
    });

    expect(erpInvoicesCoreApi.bulkImportBuyerXml).toHaveBeenCalled();
    expect(result.current.step).toBe("result");
    expect(result.current.result?.created).toBe(1);
    expect(mockOnImported).toHaveBeenCalledWith("import-123", "IN");
  });

  it("should reset correctly", () => {
    const { result } = renderHook(() => useInvoiceXmlUpload(mockOnImported));

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.step).toBe("select");
    expect(result.current.files).toEqual([]);
    expect(result.current.result).toBeNull();
  });
});
