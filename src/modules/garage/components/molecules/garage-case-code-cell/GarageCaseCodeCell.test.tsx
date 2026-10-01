import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageCaseCodeCell } from "./GarageCaseCodeCell";
import type { GarageCaseCodeCellItem } from "./GarageCaseCodeCell.type";

const mockItem: GarageCaseCodeCellItem = {
  id: "case-uuid-1",
  soChungTu: "GR-PDV2609-0076",
  bienSoXe: "51N13443",
  tenTinhTrangDichVu: "Đang sửa",
  linkedInvoiceCount: 2,
  linkedInvoiceOutCount: 1,
  linkedInvoiceInCount: 1,
};

describe("GarageCaseCodeCell", () => {
  it("renders document code and license plate correctly", () => {
    const onOpenDetail = vi.fn();
    render(<GarageCaseCodeCell item={mockItem} onOpenDetail={onOpenDetail} />);

    expect(screen.getByText("GR-PDV2609-0076")).toBeDefined();
    expect(screen.getByText("51N13443")).toBeDefined();
  });

  it("triggers onOpenDetail when clicking eye button", () => {
    const onOpenDetail = vi.fn();
    render(<GarageCaseCodeCell item={mockItem} onOpenDetail={onOpenDetail} />);

    const eyeBtn = screen.getByLabelText("Xem chi tiết");
    fireEvent.click(eyeBtn);

    expect(onOpenDetail).toHaveBeenCalledWith("GR-PDV2609-0076");
  });

  it("triggers onOpenDetail with id when soChungTu is missing", () => {
    const onOpenDetail = vi.fn();
    const itemWithoutCode: GarageCaseCodeCellItem = {
      id: "case-uuid-99",
      bienSoXe: "51N99999",
    };
    render(
      <GarageCaseCodeCell item={itemWithoutCode} onOpenDetail={onOpenDetail} />,
    );

    const eyeBtn = screen.getByLabelText("Xem chi tiết");
    fireEvent.click(eyeBtn);

    expect(onOpenDetail).toHaveBeenCalledWith("case-uuid-99");
  });

  it("triggers onOpenFinancials when clicking linked invoice icon", () => {
    const onOpenDetail = vi.fn();
    const onOpenFinancials = vi.fn();
    render(
      <GarageCaseCodeCell
        item={mockItem}
        onOpenDetail={onOpenDetail}
        onOpenFinancials={onOpenFinancials}
      />,
    );

    const linkBtn = screen.getByLabelText("Đã liên kết HĐ");
    fireEvent.click(linkBtn);

    expect(onOpenFinancials).toHaveBeenCalledWith("GR-PDV2609-0076");
  });
});
