import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SinvoiceConfigDrawer } from "../SinvoiceConfigDrawer";
import * as sinvoiceDraftApi from "@/modules/accounting/api/sinvoiceDraftApi";

vi.mock("@/modules/accounting/api/sinvoiceDraftApi", () => ({
  getSinvoiceConfigApi: vi.fn(),
  saveSinvoiceConfigApi: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SinvoiceConfigDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sinvoiceDraftApi.getSinvoiceConfigApi as any).mockResolvedValue({
      apiUrl:
        "https://api-vinvoice.viettel.vn/services/einvoiceapplication/api/",
      supplierTaxCode: "0318334886",
      username: "test_user",
      password: "secret_password",
      environment: "production",
    });
  });

  it("renders drawer and loads existing config", async () => {
    render(<SinvoiceConfigDrawer open={true} onClose={vi.fn()} />);

    expect(screen.getByText("Cấu hình Viettel SInvoice")).toBeInTheDocument();

    await waitFor(() => {
      expect(sinvoiceDraftApi.getSinvoiceConfigApi).toHaveBeenCalled();
    });

    const taxInput = screen.getByPlaceholderText(
      "0318334886...",
    ) as HTMLInputElement;
    expect(taxInput.value).toBe("0318334886");
  });

  it("saves updated config when submitting form", async () => {
    (sinvoiceDraftApi.saveSinvoiceConfigApi as any).mockResolvedValue({
      success: true,
    });
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <SinvoiceConfigDrawer
        open={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await waitFor(() => {
      expect(sinvoiceDraftApi.getSinvoiceConfigApi).toHaveBeenCalled();
    });

    const taxInput = screen.getByPlaceholderText(
      "0318334886...",
    ) as HTMLInputElement;
    fireEvent.change(taxInput, { target: { value: "0318334886-001" } });

    const saveBtn = screen.getByRole("button", { name: /Lưu cấu hình/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(sinvoiceDraftApi.saveSinvoiceConfigApi).toHaveBeenCalledWith(
        expect.objectContaining({
          supplierTaxCode: "0318334886-001",
        }),
      );
      expect(onClose).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
