import { describe, expect, it } from "vitest";
import {
  applyGarageCasesTableState,
  extractPhaiThuKhachHang,
  extractPhaiThuBaoHiem,
  extractVatAmount,
} from "./garageCasesTable";

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

  it("filters correctly by hasInvoice (YES / NO)", () => {
    const vatItems = [
      {
        id: "10",
        soChungTu: "VAT-01",
        rawData: { TienThueKH: 500000 },
      },
      {
        id: "20",
        soChungTu: "VAT-02",
        rawData: { DaTaoHoaDonThue: true },
      },
      {
        id: "30",
        soChungTu: "NO-VAT-03",
        rawData: { TienThueKH: 0, DaTaoHoaDonThue: false },
      },
    ];

    const yesResult = applyGarageCasesTableState(
      vatItems,
      { sorts: [], columnSearch: {}, columnFilters: { hasInvoice: ["YES"] } },
      "",
    );
    expect(yesResult).toHaveLength(2);
    expect(yesResult.map((r) => r.id)).toEqual(["20", "10"]);

    const noResult = applyGarageCasesTableState(
      vatItems,
      { sorts: [], columnSearch: {}, columnFilters: { hasInvoice: ["NO"] } },
      "",
    );
    expect(noResult).toHaveLength(1);
    expect(noResult[0].id).toBe("30");
  });

  it("filters correctly by collectionProgress and costProgress (PAID, PARTIAL, UNPAID)", () => {
    const progressItems = [
      {
        id: "p1",
        soChungTu: "P-01",
        tienCoThue: 1000,
        tienDaThanhToan: 1000,
        tienConPhaiThanhToan: 0,
        chiPhi: 500,
        tienDaChi: 500,
      },
      {
        id: "p2",
        soChungTu: "P-02",
        tienCoThue: 1000,
        tienDaThanhToan: 400,
        tienConPhaiThanhToan: 600,
        chiPhi: 500,
        tienDaChi: 200,
      },
      {
        id: "p3",
        soChungTu: "P-03",
        tienCoThue: 1000,
        tienDaThanhToan: 0,
        tienConPhaiThanhToan: 1000,
        chiPhi: 500,
        tienDaChi: 0,
      },
    ];

    // Collection PAID
    const colPaid = applyGarageCasesTableState(
      progressItems,
      {
        sorts: [],
        columnSearch: {},
        columnFilters: { collectionProgress: ["PAID"] },
      },
      "",
    );
    expect(colPaid).toHaveLength(1);
    expect(colPaid[0].id).toBe("p1");

    // Collection PARTIAL
    const colPartial = applyGarageCasesTableState(
      progressItems,
      {
        sorts: [],
        columnSearch: {},
        columnFilters: { collectionProgress: ["PARTIAL"] },
      },
      "",
    );
    expect(colPartial).toHaveLength(1);
    expect(colPartial[0].id).toBe("p2");

    // Cost UNPAID
    const costUnpaid = applyGarageCasesTableState(
      progressItems,
      {
        sorts: [],
        columnSearch: {},
        columnFilters: { costProgress: ["UNPAID"] },
      },
      "",
    );
    expect(costUnpaid).toHaveLength(1);
    expect(costUnpaid[0].id).toBe("p3");
  });

  it("filters and sorts correctly by financial columns (tienCoThue, tienConPhaiThanhToan, tongPhaiTra, tienConPhaiChi)", () => {
    const finItems = [
      {
        id: "f1",
        soChungTu: "F-01",
        tienCoThue: 5000,
        tienConPhaiThanhToan: 1000,
        chiPhi: 3000,
        tienDaChi: 1000,
      },
      {
        id: "f2",
        soChungTu: "F-02",
        tienCoThue: 2000,
        tienConPhaiThanhToan: 2000,
        chiPhi: 1000,
        tienDaChi: 0,
      },
    ];

    // Filter tienCoThue = 5000
    const filterRes = applyGarageCasesTableState(
      finItems,
      { sorts: [], columnSearch: {}, columnFilters: { tienCoThue: ["5000"] } },
      "",
    );
    expect(filterRes).toHaveLength(1);
    expect(filterRes[0].id).toBe("f1");

    // Sort -tienCoThue descending
    const sortRes = applyGarageCasesTableState(
      finItems,
      { sorts: ["-tienCoThue"], columnSearch: {}, columnFilters: {} },
      "",
    );
    expect(sortRes.map((r) => r.id)).toEqual(["f1", "f2"]);
  });

  describe("caseCode and columnSearch advanced filtering", () => {
    it("filters caseCode with exact quotes", () => {
      const res = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ['"A001"'] },
      });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("1");
    });

    it("filters caseCode with semicolon multi-search", () => {
      const res = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["A001;B002"] },
      });
      expect(res).toHaveLength(2);
    });

    it("matches license plate when filtering on caseCode column", () => {
      const res = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["30A-11111"] },
      });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("1");
    });

    it("matches license plate without hyphens or punctuation (clean alphanumeric)", () => {
      const res = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["30A11111"] },
      });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("1");
    });

    it("matches exact quote license plate with and without punctuation", () => {
      const res1 = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ['"30A-11111"'] },
      });
      expect(res1).toHaveLength(1);
      expect(res1[0].id).toBe("1");

      const res2 = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ['"30A11111"'] },
      });
      expect(res2).toHaveLength(1);
      expect(res2[0].id).toBe("1");
    });

    it("matches composite code:::plate and formatted code (plate)", () => {
      const resComposite = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["A001:::30A-11111"] },
      });
      expect(resComposite).toHaveLength(1);
      expect(resComposite[0].id).toBe("1");

      const resFormatted = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["A001 (30A-11111)"] },
      });
      expect(resFormatted).toHaveLength(1);
      expect(resFormatted[0].id).toBe("1");
    });

    it("handles columnSearch with semicolon multi-search and license plate", () => {
      const res = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: { caseCode: "30A-22222;XYZ" },
        columnFilters: {},
      });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("2");

      const resClean = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: { caseCode: "30A22222;XYZ" },
        columnFilters: {},
      });
      expect(resClean).toHaveLength(1);
      expect(resClean[0].id).toBe("2");
    });

    it("handles caseCode with __ALL_MATCHING__", () => {
      const res = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["__ALL_MATCHING__", "A001"] },
      });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("1");

      const resPlate = applyGarageCasesTableState(items, {
        sorts: [],
        columnSearch: {},
        columnFilters: { caseCode: ["__ALL_MATCHING__", "30A22222"] },
      });
      expect(resPlate).toHaveLength(1);
      expect(resPlate[0].id).toBe("2");
    });
  });

  describe("extractPhaiThuKhachHang & extractPhaiThuBaoHiem", () => {
    it("extracts customer and insurance amounts correctly for insurance cases with breakdown", () => {
      const item = {
        tienCoThue: 6561000,
        rawData: {
          XeLamBaoHiem: true,
          TienThanhToanKH: 1620000,
          TienThanhToanBH: 4941000,
        },
      };
      expect(extractPhaiThuKhachHang(item)).toBe(1620000);
      expect(extractPhaiThuBaoHiem(item)).toBe(4941000);
    });

    it("assigns full amount to customer when case is not insurance", () => {
      const item = {
        tienCoThue: 46900000,
        rawData: {
          XeLamBaoHiem: false,
        },
      };
      expect(extractPhaiThuKhachHang(item)).toBe(46900000);
      expect(extractPhaiThuBaoHiem(item)).toBe(0);
    });

    it("falls back to TienBaoHiemDuyet when TienThanhToanBH is missing for insurance vehicle", () => {
      const item = {
        tienCoThue: 10000000,
        rawData: {
          XeLamBaoHiem: true,
          TienBaoHiemDuyet: 7000000,
        },
      };
      expect(extractPhaiThuBaoHiem(item)).toBe(7000000);
      expect(extractPhaiThuKhachHang(item)).toBe(3000000);
    });
  });

  describe("extractVatAmount", () => {
    it("extracts vatAmount from item directly when present", () => {
      expect(extractVatAmount({ vatAmount: 250000 })).toBe(250000);
    });

    it("extracts tienThueKh or tienThue when present", () => {
      expect(extractVatAmount({ tienThueKh: 300000 })).toBe(300000);
      expect(extractVatAmount({ tienThue: 150000 })).toBe(150000);
    });

    it("falls back to rawData TienThueKH or TienThue", () => {
      expect(
        extractVatAmount({
          rawData: { TienThueKH: 500000 },
        }),
      ).toBe(500000);
      expect(
        extractVatAmount({
          rawData: { TienThue: 120000 },
        }),
      ).toBe(120000);
    });

    it("returns 0 when no VAT data exists", () => {
      expect(extractVatAmount({})).toBe(0);
      expect(extractVatAmount(null as any)).toBe(0);
    });
  });
});
