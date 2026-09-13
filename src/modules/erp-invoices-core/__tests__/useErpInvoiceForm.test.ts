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
  },
}));

// Mock today
vi.mock("@/shared/utils/format", () => ({
  today: () => "2023-10-01",
  money: (val: number) => val.toString(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultString: string) => defaultString || key,
  }),
}));

describe.skip("useErpInvoiceForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReload = vi.fn();

  it("should initialize with default closed state", () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    expect(result.current.infoDrawerOpen).toBe(false);
    expect(result.current.detailInvoice).toBeNull();
    expect(result.current.editMode).toBe(false);
  });

  it("should open form for new invoice", () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));

    act(() => {
      result.current.openNew("IN");
    });

    expect(result.current.infoDrawerOpen).toBe(true);
    expect(result.current.editMode).toBe(true);
    expect(result.current.detailInvoice).toBeNull();
    expect(result.current.form.direction).toBe("IN");
    expect(result.current.form.invoiceDate).toBe("2023-10-01");
  });

  it("should open form for detail view", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "1",
      invoiceNo: "INV-01",
      direction: "OUT",
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    expect(result.current.infoDrawerOpen).toBe(true);
    expect(result.current.editMode).toBe(false);
    expect(result.current.detailInvoice).toEqual(mockInvoice);
  });

  it("should enter edit mode with populated form", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "1",
      invoiceNo: "INV-01",
      direction: "OUT",
      status: "DRAFT",
      invoiceDate: "2023-10-01",
      preVatAmount: 100,
      vatRate: 0.1,
      vatAmount: 10,
      discountAmount: 0,
      totalAmount: 110,
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    act(() => {
      result.current.startEdit();
    });

    expect(result.current.editMode).toBe(true);
    expect(result.current.form.invoiceNo).toBe("INV-01");
    expect(result.current.form.totalAmount).toBe(110);
  });

  it("should validate before saving", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));

    act(() => {
      result.current.openNew("IN");
    });

    await act(async () => {
      await result.current.handleSave("CONFIRMED");
    });

    expect(result.current.formError).toBe("Số hóa đơn là bắt buộc.");
    expect(erpInvoicesCoreApi.create).not.toHaveBeenCalled();
  });

  it("should create a new invoice", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));

    act(() => {
      result.current.openNew("IN");
      result.current.setForm({
        ...result.current.form,
        invoiceNo: "INV-01",
        invoiceDate: "2023-10-01",
      });
    });

    await act(async () => {
      await result.current.handleSave("CONFIRMED");
    });

    expect(erpInvoicesCoreApi.create).toHaveBeenCalled();
    expect(mockReload).toHaveBeenCalled();
    expect(result.current.infoDrawerOpen).toBe(false);
  });

  it("should update an existing invoice", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "1",
      invoiceNo: "INV-01",
      direction: "OUT",
      status: "DRAFT",
      invoiceDate: "2023-10-01",
      preVatAmount: 0,
      vatRate: 0,
      vatAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      sellerName: "",
      buyerName: "",
      sellerTaxCode: "",
      buyerTaxCode: "",
      sellerAddress: "",
      buyerAddress: "",
      description: "",
      items: [],
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    act(() => {
      result.current.startEdit();
    });

    await act(async () => {
      await result.current.handleSave("CONFIRMED");
    });

    expect(erpInvoicesCoreApi.update).toHaveBeenCalledWith(
      "1",
      expect.any(Object),
    );
    expect(mockReload).toHaveBeenCalled();
    expect(result.current.editMode).toBe(false);
  });

  it("should delete an invoice", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "1",
      invoiceNo: "INV-01",
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(erpInvoicesCoreApi.remove).toHaveBeenCalledWith("1");
    expect(result.current.infoDrawerOpen).toBe(false);
    expect(mockReload).toHaveBeenCalled();
  });

  it("should cancel an invoice", async () => {
    const { result } = renderHook(() => useErpInvoiceForm(mockReload));
    const mockInvoice = {
      id: "1",
      invoiceNo: "INV-01",
    } as unknown as ErpInvoice;

    await act(async () => {
      vi.mocked(erpInvoicesCoreApi.get).mockResolvedValue(mockInvoice);
      await result.current.openDetail(mockInvoice);
    });

    await act(async () => {
      await result.current.handleCancel();
    });

    expect(erpInvoicesCoreApi.update).toHaveBeenCalledWith("1", {
      status: "CANCELLED",
    });
    expect(mockReload).toHaveBeenCalled();
  });
});
