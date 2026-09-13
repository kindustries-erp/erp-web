import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { createInventoryTemplateWorkbook } from "../excelUtils";

describe("createInventoryTemplateWorkbook", () => {
  it("creates template sheet with headers and 2 generated sample rows when reference items are provided", () => {
    const headers = ["Mã linh kiện", "Tên linh kiện", "Số lượng", "Đơn giá"];
    const refItems = [
      { sku: "LK-001", name: "Động cơ điện 12V" },
      { sku: "LK-002", name: "Bộ điều khiển" },
      { sku: "LK-003", name: "Cảm biến" },
    ];

    const wb = createInventoryTemplateWorkbook(headers, refItems);
    expect(wb.SheetNames).toEqual(["Template", "Danh sach vat tu"]);

    const templateSheet = wb.Sheets["Template"];
    const rows = XLSX.utils.sheet_to_json(templateSheet, {
      header: 1,
    }) as any[][];

    // Header row + 2 sample rows
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(headers);
    expect(rows[1][0]).toBe("LK-001");
    expect(rows[1][1]).toBe("Động cơ điện 12V");
    expect(rows[2][0]).toBe("LK-002");
    expect(rows[2][1]).toBe("Bộ điều khiển");

    // Reference sheet
    const refSheet = wb.Sheets["Danh sach vat tu"];
    const refRows = XLSX.utils.sheet_to_json(refSheet, {
      header: 1,
    }) as any[][];
    expect(refRows).toHaveLength(4); // header + 3 items
    expect(refRows[0]).toEqual(["Mã vật tư", "Tên vật tư"]);
    expect(refRows[1]).toEqual(["LK-001", "Động cơ điện 12V"]);
  });

  it("uses custom sample rows when explicitly provided", () => {
    const headers = ["Mã linh kiện", "Số lượng", "Đơn giá"];
    const customSampleRows = [
      ["CUSTOM-1", 100, 50000],
      ["CUSTOM-2", 200, 75000],
    ];

    const wb = createInventoryTemplateWorkbook(headers, [], customSampleRows);
    const templateSheet = wb.Sheets["Template"];
    const rows = XLSX.utils.sheet_to_json(templateSheet, {
      header: 1,
    }) as any[][];

    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(headers);
    expect(rows[1]).toEqual(["CUSTOM-1", 100, 50000]);
    expect(rows[2]).toEqual(["CUSTOM-2", 200, 75000]);
  });

  it("generates fallback sample rows when reference items list is empty", () => {
    const headers = ["Mã vật tư", "Số lượng", "Đơn giá", "Serials/Số khung"];
    const wb = createInventoryTemplateWorkbook(headers, []);
    const templateSheet = wb.Sheets["Template"];
    const rows = XLSX.utils.sheet_to_json(templateSheet, {
      header: 1,
    }) as any[][];

    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0]).toEqual(headers);
    expect(rows[1][0]).toBe("LK-001");
    expect(rows[1][3]).toContain("SN-");
  });
});
