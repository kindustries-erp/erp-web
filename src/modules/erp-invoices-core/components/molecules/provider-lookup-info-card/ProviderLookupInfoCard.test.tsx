import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ProviderLookupInfoCard } from "./ProviderLookupInfoCard";

describe("ProviderLookupInfoCard Molecule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders provider details, lookup code, and badge correctly", () => {
    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        providerCode="VINFAST"
        providerName="VinFast Trading"
        lookupCode="VF-ABC-XYZ"
        lookupUrl="https://vinfastauto.com/lookup"
      />,
    );

    expect(screen.getByText("VinFast Trading")).toBeInTheDocument();
    expect(screen.getByText("VF-ABC-XYZ")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sao chép Mã tra cứu/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mở cổng tra cứu")).toBeInTheDocument();
  });

  it("copies lookup code to clipboard when copy button is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        providerCode="EASYINVOICE"
        lookupCode="FKEY-999"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Sao chép Mã tra cứu/i }),
    );

    expect(writeTextMock).toHaveBeenCalledWith("FKEY-999");
    await waitFor(() => {
      expect(screen.getByText("Đã chép")).toBeInTheDocument();
    });
  });

  it("renders extra hints as copyable rows", () => {
    render(
      <ProviderLookupInfoCard
        invoiceId="inv-4"
        providerCode="BKAV"
        hints={[{ label: "Mã CQT (MCCQT)", value: "M1-26-2JNWA-00000037338" }]}
      />,
    );

    expect(screen.getByText("M1-26-2JNWA-00000037338")).toBeInTheDocument();
    expect(screen.getByText("Mã CQT (MCCQT)")).toBeInTheDocument();
  });

  it("shows a notice when the invoice has no XML", () => {
    render(
      <ProviderLookupInfoCard
        invoiceId="inv-5"
        providerCode="OTHER"
        hasXml={false}
      />,
    );
    expect(
      screen.getByText(/Chưa có file XML trên hệ thống/i),
    ).toBeInTheDocument();
  });

  it("opens portal URL in new window when portal button is clicked", () => {
    const openMock = vi.fn();
    window.open = openMock;

    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        providerCode="MISA"
        lookupUrl="https://meinvoice.vn/tra-cuu"
      />,
    );

    fireEvent.click(screen.getByText("Mở cổng tra cứu"));

    expect(openMock).toHaveBeenCalledWith(
      "https://meinvoice.vn/tra-cuu",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("calls onDownloadPdf when download button is clicked", () => {
    const onDownloadMock = vi.fn();

    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        providerCode="VIETTEL"
        onDownloadPdf={onDownloadMock}
      />,
    );

    fireEvent.click(screen.getByText("Tải PDF gốc"));

    expect(onDownloadMock).toHaveBeenCalledWith("inv-123");
  });

  it("disables download button when isDownloading is true", () => {
    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        providerCode="VIETTEL"
        onDownloadPdf={vi.fn()}
        isDownloading={true}
      />,
    );

    expect(screen.getByRole("button", { name: /Tải PDF gốc/i })).toBeDisabled();
  });

  it("uploads a PDF chosen by the user", () => {
    const onUpload = vi.fn();
    const { container } = render(
      <ProviderLookupInfoCard
        invoiceId="inv-6"
        providerCode="OTHER"
        onUploadPdf={onUpload}
      />,
    );
    const file = new File(["%PDF-1.4"], "hd.pdf", { type: "application/pdf" });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith("inv-6", file);
  });

  it("rejects a non-PDF file without calling upload", () => {
    const onUpload = vi.fn();
    const { container } = render(
      <ProviderLookupInfoCard
        invoiceId="inv-7"
        providerCode="OTHER"
        onUploadPdf={onUpload}
      />,
    );
    const file = new File(["<html/>"], "hd.html", { type: "text/html" });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(onUpload).not.toHaveBeenCalled();
  });
});
