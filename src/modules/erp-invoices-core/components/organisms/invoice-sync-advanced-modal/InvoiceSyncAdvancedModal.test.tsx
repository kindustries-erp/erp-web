import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { InvoiceSyncAdvancedModal } from "./InvoiceSyncAdvancedModal";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    syncAdvanced: vi.fn(),
    getOriginalPdfSyncStatus: vi.fn(),
  },
}));

describe("InvoiceSyncAdvancedModal Organism", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal form when open is true", () => {
    render(
      <InvoiceSyncAdvancedModal
        open={true}
        onClose={vi.fn()}
        defaultCompanyTaxCode="0101234567"
      />,
    );

    expect(
      screen.getByText("Đồng Bộ Hóa Đơn & Tải PDF Gốc"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("VD: 0101234567")).toHaveValue(
      "0101234567",
    );
    expect(
      screen.getByText(
        "Tự động tải PDF gốc nhà cung cấp (VinFast, MISA, Viettel...)",
      ),
    ).toBeInTheDocument();
  });

  it("does not render modal content when open is false", () => {
    render(<InvoiceSyncAdvancedModal open={false} onClose={vi.fn()} />);

    expect(
      screen.queryByText("Đồng Bộ Hóa Đơn & Tải PDF Gốc"),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onCloseMock = vi.fn();

    render(
      <InvoiceSyncAdvancedModal
        open={true}
        onClose={onCloseMock}
        defaultCompanyTaxCode="0101234567"
      />,
    );

    const cancelBtn = screen.getByRole("button", { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("submits syncAdvanced payload and shows progress info on success", async () => {
    const onSuccessMock = vi.fn();
    (erpInvoicesCoreApi.syncAdvanced as any).mockResolvedValue({
      syncId: "sync-uuid-12345678",
      totalFound: 15,
      status: "in_progress",
    });

    render(
      <InvoiceSyncAdvancedModal
        open={true}
        onClose={vi.fn()}
        defaultCompanyTaxCode="0101234567"
        onSuccess={onSuccessMock}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: /Bắt Đầu Đồng Bộ/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(erpInvoicesCoreApi.syncAdvanced).toHaveBeenCalledWith(
        expect.objectContaining({
          companyTaxCode: "0101234567",
          syncType: "purchase",
        }),
      );
      expect(onSuccessMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Đã tạo tiến trình đồng bộ/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Tìm thấy: 15/i)).toBeInTheDocument();
    });
  });
});
