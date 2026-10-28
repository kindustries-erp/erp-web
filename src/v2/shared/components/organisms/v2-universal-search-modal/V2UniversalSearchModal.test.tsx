import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { V2UniversalSearchModal } from "./V2UniversalSearchModal";
import type { V2SearchItem } from "./V2UniversalSearchModal.type";

const mockItems: V2SearchItem[] = [
  {
    id: "dashboard",
    title: "Tổng quan",
    category: "HỆ THỐNG",
  },
  {
    id: "sales-orders",
    title: "Đơn bán hàng",
    category: "BÁN HÀNG",
    group: "Bán hàng",
    keywords: ["SO", "don hang"],
  },
  {
    id: "customers",
    title: "Khách hàng",
    category: "BÁN HÀNG",
    group: "Bán hàng",
  },
];

describe("V2UniversalSearchModal Organism", () => {
  beforeEach(() => {
    act(() => {
      useV2LocaleStore.getState().setLocale("vi");
    });
  });

  it("không render khi open={false}", () => {
    render(
      <V2UniversalSearchModal
        open={false}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        items={mockItems}
      />,
    );
    expect(
      screen.queryByPlaceholderText("Tìm kiếm menu, tác vụ..."),
    ).toBeNull();
  });

  it("render ô input và toàn bộ items khi open={true}", () => {
    render(
      <V2UniversalSearchModal
        open={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        items={mockItems}
      />,
    );
    expect(
      screen.getByPlaceholderText("Tìm kiếm menu, tác vụ..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
  });

  it("lọc chính xác theo tiếng Việt không dấu", () => {
    render(
      <V2UniversalSearchModal
        open={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        items={mockItems}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu, tác vụ...");
    fireEvent.change(input, { target: { value: "don ban hang" } });

    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.queryByText("Khách hàng")).toBeNull();
  });

  it("lọc theo keywords phụ trợ", () => {
    render(
      <V2UniversalSearchModal
        open={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        items={mockItems}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu, tác vụ...");
    fireEvent.change(input, { target: { value: "SO" } });

    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.queryByText("Khách hàng")).toBeNull();
  });

  it("gọi onSelect khi click vào item", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();
    render(
      <V2UniversalSearchModal
        open={true}
        onClose={handleClose}
        onSelect={handleSelect}
        items={mockItems}
      />,
    );
    fireEvent.click(screen.getByText("Khách hàng"));
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "customers", title: "Khách hàng" }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it("hỗ trợ chọn bằng phím mũi tên và Enter", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();
    render(
      <V2UniversalSearchModal
        open={true}
        onClose={handleClose}
        onSelect={handleSelect}
        items={mockItems}
      />,
    );
    const input = screen.getByPlaceholderText("Tìm kiếm menu, tác vụ...");
    // Item 0 is dashboard. ArrowDown -> Item 1 (sales-orders)
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "sales-orders", title: "Đơn bán hàng" }),
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
