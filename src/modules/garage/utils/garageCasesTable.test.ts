import { describe, expect, it } from "vitest";
import { applyGarageCasesTableState } from "./garageCasesTable";

describe("applyGarageCasesTableState", () => {
  const items = [
    {
      id: "1",
      updatedAt: "2024-01-03T00:00:00.000Z",
      ngayPhatSinh: "2024-01-01T08:30:00.000Z",
      soChungTu: "A001",
      khachHangName: "Alice",
      tenTinhTrangDichVu: "Kết thúc",
      tienCoThue: 100,
      tienConPhaiThanhToan: 25,
      bienSoXe: "30A-11111",
      khachHangCode: "C001",
      rawData: { XeLamBaoHiem: true },
      createdAt: "2024-01-01T00:00:00.000Z",
      ngayHoanThanhCongViec: "2024-01-02T15:00:00.000Z",
    },
    {
      id: "2",
      updatedAt: "2024-01-01T00:00:00.000Z",
      ngayPhatSinh: "2023-12-31T09:00:00.000Z",
      soChungTu: "B002",
      khachHangName: "Bob",
      tenTinhTrangDichVu: "Đang xử lý",
      tienCoThue: 80,
      tienConPhaiThanhToan: 10,
      bienSoXe: "30A-22222",
      khachHangCode: "C002",
      rawData: { XeLamBaoHiem: false },
      createdAt: "2023-12-31T00:00:00.000Z",
      ngayHoanThanhCongViec: null,
    },
  ];

  it("filters by global search, column search, and column filters, then sorts newest first", () => {
    const result = applyGarageCasesTableState(
      items,
      {
        sorts: ["-updatedAt"],
        columnSearch: { customerName: "ali" },
        columnFilters: { statusName: ["Kết thúc"] },
      },
      "ali",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("applies independent date ranges per date column", () => {
    const result = applyGarageCasesTableState(
      items,
      {
        sorts: [],
        columnSearch: {},
        columnFilters: {},
      },
      "",
      {
        caseDate: { from: "2024-01-01", to: "2024-01-02" },
        createdAt: { from: "2024-01-01", to: "2024-01-01" },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by ngayHoanThanhCongViec / completionDate range", () => {
    const result = applyGarageCasesTableState(
      items,
      {
        sorts: [],
        columnSearch: {},
        columnFilters: {},
      },
      "",
      {
        ngayHoanThanhCongViec: { from: "2024-01-02", to: "2024-01-02" },
      },
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches numeric filters from option strings", () => {
    const result = applyGarageCasesTableState(
      items,
      {
        sorts: [],
        columnSearch: {},
        columnFilters: { totalAmount: ["100"] },
      },
      "",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters correctly by statusTab (quotation, in_progress, completed)", () => {
    const quotationItem = {
      id: "3",
      soChungTu: "C003",
      tenTinhTrangDichVu: "Báo giá KH",
      tinhTrangDichVu: 1,
      ngayPhatSinh: "2024-01-04T00:00:00.000Z",
    };
    const allItems = [...items, quotationItem];

    // Quotation
    const quotationResult = applyGarageCasesTableState(
      allItems,
      { sorts: [], columnSearch: {}, columnFilters: {} },
      "",
      {},
      "quotation",
    );
    expect(quotationResult).toHaveLength(1);
    expect(quotationResult[0].id).toBe("3");

    // In Progress
    const inProgressResult = applyGarageCasesTableState(
      allItems,
      { sorts: [], columnSearch: {}, columnFilters: {} },
      "",
      {},
      "in_progress",
    );
    expect(inProgressResult).toHaveLength(1);
    expect(inProgressResult[0].id).toBe("2");

    // Completed
    const completedResult = applyGarageCasesTableState(
      allItems,
      { sorts: [], columnSearch: {}, columnFilters: {} },
      "",
      {},
      "completed",
    );
    expect(completedResult).toHaveLength(1);
    expect(completedResult[0].id).toBe("1");

    // All
    const allResult = applyGarageCasesTableState(
      allItems,
      { sorts: [], columnSearch: {}, columnFilters: {} },
      "",
      {},
      "all",
    );
    expect(allResult).toHaveLength(3);
  });
});
