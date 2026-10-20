import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useErpInvoiceDetailDrawer } from "../components/organisms/erp-invoice-detail-drawer/ErpInvoiceDetailDrawer.hook";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "vi" },
  }),
}));

const baseProps = {
  open: true,
  onClose: vi.fn(),
  editMode: false,
  detailInvoice: { id: "inv-1", invoiceNo: "1945", direction: "OUT" } as any,
  startEdit: vi.fn(),
  saving: false,
  handleSave: vi.fn(),
  cancelEdit: vi.fn(),
  children: null,
};

describe("useErpInvoiceDetailDrawer deep links", () => {
  it("activeTabKey='financials' chuyển sang linked_docs và mở drawer Sao kê", () => {
    const onTabChange = vi.fn();
    const { result } = renderHook(() =>
      useErpInvoiceDetailDrawer({
        ...baseProps,
        activeTabKey: "financials",
        onTabChange,
      } as any),
    );

    expect(onTabChange).toHaveBeenCalledWith("linked_docs");
    expect(result.current.showNetOffModal).toBe(true);
  });

  it("partnerViewMode='lines' mở main tab NCC/KH với sub-tab HHDV", () => {
    const onTabChange = vi.fn();
    const { result } = renderHook(() =>
      useErpInvoiceDetailDrawer({
        ...baseProps,
        activeTabKey: "invoice_details",
        partnerViewMode: "lines",
        onTabChange,
      } as any),
    );

    expect(onTabChange).toHaveBeenCalledWith("invoice_partner");
    expect(result.current.partnerDefaultSubTab).toBe("lines");
  });

  it("mặc định không tự chuyển tab", () => {
    const onTabChange = vi.fn();
    const { result } = renderHook(() =>
      useErpInvoiceDetailDrawer({
        ...baseProps,
        activeTabKey: "invoice_details",
        partnerViewMode: "details",
        onTabChange,
      } as any),
    );

    expect(onTabChange).not.toHaveBeenCalled();
    expect(result.current.showNetOffModal).toBe(false);
  });
});
