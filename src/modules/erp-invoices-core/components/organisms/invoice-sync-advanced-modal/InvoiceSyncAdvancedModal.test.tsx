import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { InvoiceSyncAdvancedModal } from "./InvoiceSyncAdvancedModal";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    syncAdvanced: vi.fn(),
    getOriginalPdfSyncStatus: vi.fn(),
  },
}));

// Trả về chuỗi mặc định tiếng Việt để giữ nguyên các assertion theo nhãn
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) =>
      typeof fallback === "string"
        ? fallback
        : ((fallback as { defaultValue?: string })?.defaultValue ?? key),
  }),
}));

const renderModal = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};

describe("InvoiceSyncAdvancedModal Organism", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal form when open is true", () => {
    renderModal(
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
        "Đồng bộ từ GDT và tự động tải PDF gốc có chữ ký số từ nhà cung cấp.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render modal content when open is false", () => {
    renderModal(<InvoiceSyncAdvancedModal open={false} onClose={vi.fn()} />);

    expect(
      screen.queryByText("Đồng Bộ Hóa Đơn & Tải PDF Gốc"),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onCloseMock = vi.fn();

    renderModal(
      <InvoiceSyncAdvancedModal
        open={true}
        onClose={onCloseMock}
        defaultCompanyTaxCode="0101234567"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Hủy/i }));

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("chặn gửi khi thiếu mã số thuế", () => {
    renderModal(<InvoiceSyncAdvancedModal open={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Bắt Đầu Đồng Bộ/i }));

    expect(erpInvoicesCoreApi.syncAdvanced).not.toHaveBeenCalled();
  });

  it("submits syncAdvanced payload and shows progress info on success", async () => {
    const onSuccessMock = vi.fn();
    (erpInvoicesCoreApi.syncAdvanced as any).mockResolvedValue({
      syncId: "sync-uuid-12345678",
      totalFound: 15,
      status: "in_progress",
    });
    (erpInvoicesCoreApi.getOriginalPdfSyncStatus as any).mockResolvedValue({
      id: "sync-uuid-12345678",
      status: "completed",
      totalFound: 15,
      totalPdfSuccess: 15,
      totalPdfFailed: 0,
      errorMessage: null,
    });

    renderModal(
      <InvoiceSyncAdvancedModal
        open={true}
        onClose={vi.fn()}
        defaultCompanyTaxCode="0101234567"
        onSuccess={onSuccessMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Bắt Đầu Đồng Bộ/i }));

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

  it("hỏi trạng thái PDF theo đúng mã đồng bộ sau khi gửi", async () => {
    (erpInvoicesCoreApi.syncAdvanced as any).mockResolvedValue({
      syncId: "sync-uuid-12345678",
      totalFound: 3,
      status: "in_progress",
    });
    (erpInvoicesCoreApi.getOriginalPdfSyncStatus as any).mockResolvedValue({
      id: "sync-uuid-12345678",
      status: "completed",
      totalFound: 3,
      totalPdfSuccess: 3,
      totalPdfFailed: 0,
      errorMessage: null,
    });

    renderModal(
      <InvoiceSyncAdvancedModal
        open={true}
        onClose={vi.fn()}
        defaultCompanyTaxCode="0101234567"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Bắt Đầu Đồng Bộ/i }));

    await waitFor(() => {
      expect(erpInvoicesCoreApi.getOriginalPdfSyncStatus).toHaveBeenCalledWith(
        "sync-uuid-12345678",
      );
    });
  });
});
