import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErpInvoiceForm } from "../hooks/useErpInvoiceForm";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    get: vi.fn().mockResolvedValue({ items: [] }),
    create: vi.fn().mockResolvedValue({ id: "999", invoiceNo: "INV-999" }),
    update: vi.fn().mockResolvedValue({ id: "999", invoiceNo: "INV-999" }),
    remove: vi.fn(),
    syncDetail: vi.fn().mockResolvedValue({ items: [] }),
    autoPostStandard: vi.fn().mockResolvedValue({ posted: true }),
    postInvoice: vi.fn().mockResolvedValue({ posted: true }),
  },
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    saveEntityValues: vi.fn().mockResolvedValue({}),
    getEntityValues: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/shared/utils/format", () => ({
  today: () => "2026-09-18",
  money: (val: number) => val.toString(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultString: string) => defaultString || key,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useErpInvoiceForm without branchId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReload = vi.fn();

  it("should successfully save invoice when branchId is null/undefined and accounting is not enabled", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "inv-1",
      invoiceNo: "0001234",
      serialNo: "1C26TGA",
      direction: "IN",
      status: "DRAFT",
      invoiceDate: "2026-09-18",
      preVatAmount: 1000000,
      vatRate: 0.1,
      vatAmount: 100000,
      discountAmount: 0,
      totalAmount: 1100000,
      branchId: null, // No branch assigned
      sellerName: "NCC Test",
      buyerName: "Cong ty Test",
      items: [],
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    act(() => {
      result.current.startEdit();
      // Ensure branchId is empty
      result.current.fieldSet("branchId", undefined);
      result.current.fieldSet("notes", "Cập nhật ghi chú không cần chi nhánh");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    // Expect update API to be called successfully
    expect(erpInvoicesCoreApi.update).toHaveBeenCalledWith(
      "inv-1",
      expect.objectContaining({
        notes: "Cập nhật ghi chú không cần chi nhánh",
        invoiceNo: "0001234",
      }),
    );
    expect(result.current.formError).toBeNull();
  });

  it("should block and show error only when accountingEnabled is true with posting lines but branchId is missing", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "inv-2",
      invoiceNo: "0005678",
      serialNo: "1C26TGA",
      direction: "IN",
      status: "DRAFT",
      invoiceDate: "2026-09-18",
      totalAmount: 500000,
      branchId: null,
      items: [],
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    act(() => {
      result.current.startEdit();
      result.current.fieldSet("branchId", undefined);
      result.current.fieldSet("accountingEnabled", true);
      result.current.postingState.setLines([
        {
          id: "line-1",
          accountId: "acc-1",
          debit: 500000,
          credit: 0,
          description: "Nợ 632",
        },
        {
          id: "line-2",
          accountId: "acc-2",
          debit: 0,
          credit: 500000,
          description: "Có 331",
        },
      ]);
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.formError).toBe(
      "Vui lòng chọn chi nhánh trước khi lưu và hạch toán kế toán.",
    );
    expect(erpInvoicesCoreApi.update).not.toHaveBeenCalled();
  });
});
