import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttachmentDetailModal } from "./AttachmentDetailModal";
import type { ErpAttachment } from "../../types/attachment.types";

vi.mock("@/modules/system/api/attachmentsApi", () => ({
  getAttachmentDownloadUrlApi: vi
    .fn()
    .mockResolvedValue({ url: "https://example.com/test.pdf" }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => fallback ?? key,
}));

describe("AttachmentDetailModal", () => {
  const mockItem: ErpAttachment = {
    id: "att-123",
    fileName: "hop_dong_kinh_doanh.pdf",
    fileKey: "files/hop_dong_kinh_doanh.pdf",
    fileSize: 1024 * 500,
    mimeType: "application/pdf",
    documentType: "HOP_DONG",
    createdAt: "2026-10-06T12:00:00Z",
  };

  it("renders modal with file information when item is provided", () => {
    render(<AttachmentDetailModal item={mockItem} onClose={() => {}} />);
    expect(
      screen.getAllByText("hop_dong_kinh_doanh.pdf").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("att-123")).toBeDefined();
    expect(screen.getByText("Hợp đồng")).toBeDefined();
    expect(screen.getByText("500.0 KB")).toBeDefined();
  });

  it("does not render content when item is null", () => {
    const { container } = render(
      <AttachmentDetailModal item={null} onClose={() => {}} />,
    );
    expect(container.textContent).toBe("");
  });
});
