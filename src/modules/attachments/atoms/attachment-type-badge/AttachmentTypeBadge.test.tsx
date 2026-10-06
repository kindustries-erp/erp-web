import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AttachmentTypeBadge } from "./AttachmentTypeBadge";

describe("AttachmentTypeBadge", () => {
  it("renders correctly for HOP_DONG", () => {
    render(<AttachmentTypeBadge type="HOP_DONG" />);
    expect(screen.getByText("Hợp đồng")).toBeDefined();
  });

  it("renders correctly for HOA_DON without blue classes", () => {
    const { container } = render(<AttachmentTypeBadge type="HOA_DON" />);
    expect(screen.getByText("Hóa đơn")).toBeDefined();
    expect(container.innerHTML.includes("blue-")).toBe(false);
  });

  it("renders correctly for BANG_KE", () => {
    render(<AttachmentTypeBadge type="BANG_KE" />);
    expect(screen.getByText("Bảng kê")).toBeDefined();
  });

  it("renders default fallback for unknown type", () => {
    render(<AttachmentTypeBadge type={null} />);
    expect(screen.getByText("Khác")).toBeDefined();
  });
});
