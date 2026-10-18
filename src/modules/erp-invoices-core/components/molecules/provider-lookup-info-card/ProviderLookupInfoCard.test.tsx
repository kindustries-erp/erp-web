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
        invoiceNo="HD001"
        providerCode="VINFAST"
        providerName="VinFast Trading"
        lookupCode="VF-ABC-XYZ"
        lookupUrl="https://vinfastauto.com/lookup"
      />,
    );

    expect(screen.getByText("VinFast Trading")).toBeInTheDocument();
    expect(screen.getByText("VF-ABC-XYZ")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sao chép mã tra cứu/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mở Cổng Tra Cứu")).toBeInTheDocument();
  });

  it("copies lookup code to clipboard when copy button is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        invoiceNo="HD001"
        providerCode="EASYINVOICE"
        lookupCode="FKEY-999"
      />,
    );

    const copyBtn = screen.getByRole("button", {
      name: /Sao chép mã tra cứu/i,
    });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("FKEY-999");
    await waitFor(() => {
      expect(screen.getByText("Đã chép")).toBeInTheDocument();
    });
  });

  it("opens portal URL in new window when portal button is clicked", () => {
    const openMock = vi.fn();
    window.open = openMock;

    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        invoiceNo="HD001"
        providerCode="MISA"
        lookupUrl="https://meinvoice.vn/tra-cuu"
      />,
    );

    const portalBtn = screen.getByText("Mở Cổng Tra Cứu");
    fireEvent.click(portalBtn);

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
        invoiceNo="HD001"
        providerCode="VIETTEL"
        onDownloadPdf={onDownloadMock}
      />,
    );

    const downloadBtn = screen.getByText("Tải PDF Gốc");
    fireEvent.click(downloadBtn);

    expect(onDownloadMock).toHaveBeenCalledWith("inv-123");
  });

  it("disables download button and shows loading when isDownloading is true", () => {
    render(
      <ProviderLookupInfoCard
        invoiceId="inv-123"
        invoiceNo="HD001"
        providerCode="VIETTEL"
        onDownloadPdf={vi.fn()}
        isDownloading={true}
      />,
    );

    const downloadBtn = screen.getByRole("button", { name: /Tải PDF Gốc/i });
    expect(downloadBtn).toBeDisabled();
  });
});
