// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as XLSX from "xlsx";
import { GoodsReceiptSerialDrawer } from "../components/GoodsReceiptSerialDrawer";
import * as copyButtonModule from "@/shared/components/CopyButton";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, def?: string) => def || key,
}));

const mockShowToast = vi.fn();
vi.mock("@/core/config/uiStore", () => ({
  useUIStore: (selector: any) => selector({ showToast: mockShowToast }),
}));

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    aoa_to_sheet: vi.fn((data) => ({ data })),
    book_append_sheet: vi.fn(),
    sheet_to_json: vi.fn(() => []),
    encode_range: vi.fn(() => "A1:L100"),
    encode_cell: vi.fn(() => "A1"),
  },
  writeFile: vi.fn(),
}));

describe("GoodsReceiptSerialDrawer Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSaveSerials: vi.fn(),
    itemId: "item-123",
    itemSku: "SKU-TEST-001",
    itemName: "Xe Máy Điện Klotus Model X",
    trackingPolicyCode: "SERIAL",
    trackingPolicyName: "Theo Serial Number",
    requiredQty: 3,
    receiptDate: "2026-09-15",
    initialSerials: [
      { serialNo: "SN-001", notes: "Mã 1" },
      { serialNo: "SN-002", notes: "Mã 2" },
    ],
  };

  it("renders in 2-columns layout with right panel containing line info and reconciliation progress", () => {
    render(<GoodsReceiptSerialDrawer {...defaultProps} />);

    // Check SKU & Item name in subtitle and right panel
    expect(screen.getAllByText("SKU-TEST-001").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Xe Máy Điện Klotus Model X").length,
    ).toBeGreaterThan(0);

    // Check right panel sections
    expect(screen.getAllByText("Thông tin dòng hàng").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Tiến độ & Đối soát").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hướng dẫn & Tiện ích").length).toBeGreaterThan(
      0,
    );

    // Check reconciliation status in right panel (2 of 3 declared -> Thiếu 1 mã)
    expect(screen.getAllByText("2 / 3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Thiếu 1 mã").length).toBeGreaterThan(0);

    // Check left panel serial table inputs in edit mode
    expect(screen.getByDisplayValue("SN-001")).toBeDefined();
    expect(screen.getByDisplayValue("SN-002")).toBeDefined();
  });

  it("renders correctly in viewOnly mode with static text and copy all button", () => {
    render(<GoodsReceiptSerialDrawer {...defaultProps} viewOnly={true} />);

    // Static text in table cells
    expect(screen.getByText("SN-001")).toBeDefined();
    expect(screen.getByText("SN-002")).toBeDefined();

    // Copy All & Export buttons in viewOnly mode
    expect(screen.getByText("Sao chép")).toBeDefined();
    expect(screen.getByText("Xuất Excel")).toBeDefined();
  });

  it("triggers copyToClipboard and toast when clicking 'Sao chép' button in viewOnly mode", async () => {
    const copySpy = vi
      .spyOn(copyButtonModule, "copyToClipboard")
      .mockResolvedValue(true);

    render(<GoodsReceiptSerialDrawer {...defaultProps} viewOnly={true} />);

    const copyBtn = screen.getByText("Sao chép");
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(copySpy).toHaveBeenCalledWith("SN-001\nSN-002");
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
        }),
      );
    });
  });

  it("exports professional 1-sheet Excel report with row 1 headers, freeze, autofilter, and linked PO/GR columns", () => {
    const propsWithContext = {
      ...defaultProps,
      viewOnly: true,
      receiptNo: "NK-20260915-001",
      purchaseOrderNo: "PO-20260910-005",
      vendorName: "Công ty TNHH Linh Kiện Toàn Cầu",
    };

    render(<GoodsReceiptSerialDrawer {...propsWithContext} />);

    // Verify right panel displays voucher context
    expect(screen.getByText("NK-20260915-001")).toBeDefined();
    expect(screen.getByText("PO-20260910-005")).toBeDefined();
    expect(screen.getByText("Công ty TNHH Linh Kiện Toàn Cầu")).toBeDefined();

    const exportBtn = screen.getByText("Xuất Excel");
    fireEvent.click(exportBtn);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(1); // Single sheet only, no Thong_Tin_Chung

    // Verify row 1 contains headers with PO & GR fields
    const sheetData = (XLSX.utils.aoa_to_sheet as any).mock.calls[0][0];
    const headers = sheetData[0];
    expect(headers).toContain("STT");
    expect(headers).toContain("Mã Serial / Định danh");
    expect(headers).toContain("Mã phiếu nhập");
    expect(headers).toContain("Mã đơn mua hàng (PO)");
    expect(headers).toContain("Nhà cung cấp");
    expect(headers).toContain("Mã SKU");
    expect(headers).toContain("Tên hàng hóa");

    // Verify first data row contains the context values
    const firstRow = sheetData[1];
    expect(firstRow).toContain("SN-001");
    expect(firstRow).toContain("NK-20260915-001");
    expect(firstRow).toContain("PO-20260910-005");
    expect(firstRow).toContain("Công ty TNHH Linh Kiện Toàn Cầu");

    // Verify book_append_sheet was called with only 1 sheet (Danh_Sach_Serials)
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    expect((XLSX.utils.book_append_sheet as any).mock.calls[0][2]).toBe(
      "Danh_Sach_Serials",
    );

    // Verify file write
    expect(XLSX.writeFile).toHaveBeenCalled();
    const lastCallArgs = (XLSX.writeFile as any).mock.calls[0];
    expect(lastCallArgs[1]).toMatch(
      /Bao_Cao_Serial_SKU-TEST-001_\d+_\d+\.xlsx/,
    );
  });

  it("renders correctly for System Auto tracking (isSystemAuto = true) and exports System_Serials sheet", () => {
    const autoProps = {
      ...defaultProps,
      isSystemAuto: true,
      viewOnly: true,
      requiredQty: 2,
      initialSerials: [
        {
          serialNo: "SYS-SN-001",
          systemSerialNo: "SYS-SN-001",
          trackingType: "SYSTEM_AUTO",
          status: "IN_STOCK",
          unitCost: "15000000",
        },
        {
          serialNo: "SYS-SN-002",
          systemSerialNo: "SYS-SN-002",
          trackingType: "SYSTEM_AUTO",
          status: "ISSUED",
          unitCost: "15000000",
        },
      ],
    };

    render(<GoodsReceiptSerialDrawer {...autoProps} />);

    expect(
      screen.getAllByText(
        "Danh sách System Serials (Tự động sinh khi nhập kho)",
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Tự động sinh System Serial (Hàng thường)").length,
    ).toBeGreaterThan(0);

    // Matching status should show 'Đã đủ số lượng'
    expect(screen.getAllByText("Đã đủ số lượng").length).toBeGreaterThan(0);

    // System status counts in right panel
    expect(screen.getByText("Tồn kho (IN_STOCK)")).toBeDefined();
    expect(screen.getByText("Đã xuất kho (ISSUED)")).toBeDefined();
    expect(screen.getByText("Đã lắp ráp (ASSEMBLED)")).toBeDefined();

    // Click Export Excel in view mode
    const exportBtn = screen.getByText("Xuất Excel");
    fireEvent.click(exportBtn);

    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(1);
    const sheetData = (XLSX.utils.aoa_to_sheet as any).mock.calls[0][0];
    const headers = sheetData[0];
    expect(headers).toContain("Mã System Serial");
    expect(headers).toContain("Mã phiếu nhập");
    expect(headers).toContain("Mã đơn mua hàng (PO)");
    expect(headers).toContain("Giá vốn đơn vị (VNĐ)");

    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    expect((XLSX.utils.book_append_sheet as any).mock.calls[0][2]).toBe(
      "System_Serials",
    );

    expect(XLSX.writeFile).toHaveBeenCalled();
    const lastCallArgs = (XLSX.writeFile as any).mock.calls[0];
    expect(lastCallArgs[1]).toMatch(
      /Bao_Cao_System_Serial_SKU-TEST-001_\d+_\d+\.xlsx/,
    );
  });

  it("renders correctly for Vehicle tracking (VEHICLE policy with 4 attributes)", () => {
    const vehicleProps = {
      ...defaultProps,
      trackingPolicyCode: "VEHICLE",
      trackingPolicyName: "Theo Xe (VIN, Số máy, Serial)",
      requiredQty: 1,
      initialSerials: [
        {
          vinNo: "VIN-KLOTUS-001",
          engineNo: "ENG-KLOTUS-001",
          serialNo: "SER-KLOTUS-001",
          internalSerialNo: "SN-KLOTUS-001",
          notes: "Xe chuẩn",
        },
      ],
    };

    render(<GoodsReceiptSerialDrawer {...vehicleProps} />);

    expect(screen.getAllByText("Khai báo Định danh Xe").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByDisplayValue("VIN-KLOTUS-001")).toBeDefined();
    expect(screen.getByDisplayValue("ENG-KLOTUS-001")).toBeDefined();
    expect(screen.getByDisplayValue("SER-KLOTUS-001")).toBeDefined();
    expect(screen.getByDisplayValue("SN-KLOTUS-001")).toBeDefined();

    // Check vehicle completed rows count
    expect(screen.getByText("Đầy đủ 4 trường định danh")).toBeDefined();
  });
});
