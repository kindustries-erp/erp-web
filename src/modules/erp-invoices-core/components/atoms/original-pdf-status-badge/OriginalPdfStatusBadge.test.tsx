import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { OriginalPdfStatusBadge } from "./OriginalPdfStatusBadge";

describe("OriginalPdfStatusBadge Atom", () => {
  it("renders provider original badge when pdf is present and source is provider_original", () => {
    render(
      <OriginalPdfStatusBadge
        pdfFileKey="invoices/pdf/inv-1.pdf"
        pdfSource="provider_original"
        providerCode="VINFAST"
      />,
    );

    expect(screen.getByText("VINFAST PDF")).toBeInTheDocument();
  });

  it("renders manual pdf badge when pdf is present without provider source", () => {
    render(
      <OriginalPdfStatusBadge
        pdfFileKey="invoices/pdf/inv-manual.pdf"
        pdfSource="manual_upload"
      />,
    );

    expect(screen.getByText("PDF tải lên")).toBeInTheDocument();
  });

  it("renders no pdf badge when pdfFileKey is missing", () => {
    render(<OriginalPdfStatusBadge pdfFileKey={null} pdfSource={null} />);

    expect(screen.getByText("Chưa có PDF")).toBeInTheDocument();
  });

  it("renders failed status badge when pdfSource is failed", () => {
    render(
      <OriginalPdfStatusBadge
        pdfFileKey={null}
        pdfSource="failed"
        pdfError="Cổng tra cứu báo lỗi WAF"
      />,
    );

    expect(screen.getByText("Lỗi tải PDF")).toBeInTheDocument();
  });
});
