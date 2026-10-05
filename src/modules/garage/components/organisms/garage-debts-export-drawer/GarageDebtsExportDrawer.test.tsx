import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { GarageDebtsExportDrawer } from "./GarageDebtsExportDrawer";

describe("GarageDebtsExportDrawer", () => {
  it("renders export drawer with tabs and action buttons when open", () => {
    const onClose = vi.fn();
    render(<GarageDebtsExportDrawer open={true} onClose={onClose} />);

    expect(screen.getByText("Xuất Báo Cáo Công Nợ Garage")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
    expect(screen.getByText("Nhà cung cấp / Phụ tùng")).toBeInTheDocument();
    expect(screen.getByText("Tải xuống bảng kê")).toBeInTheDocument();
  });
});
