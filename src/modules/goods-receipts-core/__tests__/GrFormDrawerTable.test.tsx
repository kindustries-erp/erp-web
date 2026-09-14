// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import { DEFAULT_WAREHOUSE_COLUMN_VISIBILITY } from "@/pages/ErpWarehouseTab/utils";

describe("GrFormDrawer Table & Pagination Unit Tests", () => {
  const sampleLines = [
    {
      id: "1",
      itemCode: "SKU-001",
      itemName: "Phụ tùng A",
      qtyOrdered: 10,
      qtyReceived: 5,
    },
    {
      id: "2",
      itemCode: "SKU-002",
      itemName: "Phụ tùng B",
      qtyOrdered: 20,
      qtyReceived: 10,
    },
    {
      id: "3",
      itemCode: "SKU-003",
      itemName: "Linh kiện C",
      qtyOrdered: 30,
      qtyReceived: 15,
    },
    {
      id: "4",
      itemCode: "SKU-004",
      itemName: "Linh kiện D",
      qtyOrdered: 40,
      qtyReceived: 20,
    },
    {
      id: "5",
      itemCode: "SKU-005",
      itemName: "Linh kiện E",
      qtyOrdered: 50,
      qtyReceived: 25,
    },
  ];

  it("handles pagination properly with custom pageSize", () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "test-gr-table-1",
        lines: sampleLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
      }),
    );

    expect(result.current.total).toBe(5);

    act(() => {
      result.current.setPageSize(2);
    });

    expect(result.current.pageSize).toBe(2);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedLines.length).toBe(2);
    expect(result.current.paginatedLines[0].itemCode).toBe("SKU-001");
    expect(result.current.paginatedLines[1].itemCode).toBe("SKU-002");

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
    expect(result.current.paginatedLines.length).toBe(2);
    expect(result.current.paginatedLines[0].itemCode).toBe("SKU-003");
    expect(result.current.paginatedLines[1].itemCode).toBe("SKU-004");
  });

  it("filters items by column search (exact and multi-keyword)", () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "test-gr-table-2",
        lines: sampleLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
      }),
    );

    act(() => {
      result.current.listHook.setColumnSearch("itemCode", "SKU-001;SKU-003");
    });

    expect(result.current.processedLines.length).toBe(2);
    expect(result.current.processedLines.map((l) => l.itemCode)).toEqual([
      "SKU-001",
      "SKU-003",
    ]);
  });

  it("sorts numeric columns numerically", () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "test-gr-table-3",
        lines: sampleLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
        customExtractors: {
          ordered: (l) => l.qtyOrdered,
        },
      }),
    );

    act(() => {
      result.current.listHook.setSort("ordered", "desc");
    });

    expect(result.current.processedLines[0].qtyOrdered).toBe(50);
    expect(result.current.processedLines[4].qtyOrdered).toBe(10);
  });

  it("extracts filter options for ordered and qtyReceived columns", async () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "test-gr-table-options",
        lines: sampleLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
        customExtractors: {
          ordered: (l) => l.qtyOrdered,
          qtyInput: (l) => l.qtyReceived,
        },
      }),
    );

    const orderedFetch = result.current.buildFilterOptions("ordered");
    const orderedOpts = await orderedFetch({ search: "" });
    expect(orderedOpts.items.length).toBe(5);
    expect(orderedOpts.items.map((o) => o.value)).toEqual([
      "10",
      "20",
      "30",
      "40",
      "50",
    ]);

    const qtyFetch = result.current.buildFilterOptions("qtyInput");
    const qtyOpts = await qtyFetch({ search: "2" });
    expect(qtyOpts.items.map((o) => o.value)).toEqual(["20", "25"]);
  });

  it("filters numeric columns using search operators and ranges", () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "test-gr-table-numeric-search",
        lines: sampleLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
        customExtractors: {
          ordered: (l) => l.qtyOrdered,
          qtyInput: (l) => l.qtyReceived,
        },
      }),
    );

    // Test operator > 20
    act(() => {
      result.current.listHook.setColumnSearch("ordered", "> 20");
    });
    expect(result.current.processedLines.map((l) => l.qtyOrdered)).toEqual([
      30, 40, 50,
    ]);

    // Test range 20..40
    act(() => {
      result.current.listHook.setColumnSearch("ordered", "20..40");
    });
    expect(result.current.processedLines.map((l) => l.qtyOrdered)).toEqual([
      20, 30, 40,
    ]);

    // Test exact numeric matching
    act(() => {
      result.current.listHook.setColumnSearch("ordered", "50");
    });
    expect(result.current.processedLines.map((l) => l.qtyOrdered)).toEqual([
      50,
    ]);
  });
});

describe("GiFormDrawer & IaFormDrawer Table & Filter Unit Tests", () => {
  const sampleGiLines = [
    {
      itemId: "item-1",
      itemCode: "SKU-001",
      itemName: "Động cơ điện",
      serialId: "s-1",
      qtyIssued: "10",
      unitCost: "500000",
    },
    {
      itemId: "item-2",
      itemCode: "SKU-002",
      itemName: "Bộ sạc pin",
      serialId: "s-2",
      qtyIssued: "25",
      unitCost: "250000",
    },
    {
      itemId: "item-3",
      itemCode: "SKU-003",
      itemName: "Ắc quy chì",
      qtyIssued: "5",
      unitCost: "150000",
    },
  ];

  const serialDetails: Record<string, any> = {
    "s-1": { vinNo: "VIN123456", serialNo: "SER001", engineNo: "ENG999" },
    "s-2": { vinNo: "VIN789012", serialNo: "SER002" },
  };

  it("handles Goods Issue (GI) line pagination, search operators and serials filtering", async () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "gi-details-table",
        lines: sampleGiLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
        customExtractors: {
          itemCode: (l) => l.itemCode,
          itemName: (l) => l.itemName,
          tracking: (l) => {
            if (!l.serialId) return "";
            const s = serialDetails[l.serialId];
            if (!s) return "";
            return [s.vinNo, s.serialNo, s.engineNo].filter(Boolean).join(" ");
          },
          qtyIssued: (l) => l.qtyIssued,
          unitCost: (l) => l.unitCost,
        },
      }),
    );

    // Test serials search
    act(() => {
      result.current.listHook.setColumnSearch("tracking", "ENG999");
    });
    expect(result.current.processedLines.length).toBe(1);
    expect(result.current.processedLines[0].itemCode).toBe("SKU-001");

    // Reset and test numeric operator on qtyIssued
    act(() => {
      result.current.listHook.resetFilters();
      result.current.listHook.setColumnSearch("qtyIssued", ">= 10");
    });
    expect(result.current.processedLines.length).toBe(2);
    expect(result.current.processedLines.map((l) => l.itemCode)).toEqual([
      "SKU-001",
      "SKU-002",
    ]);

    // Test buildFilterOptions for qtyIssued (ignores self-filter to show all options)
    const qtyFetch = result.current.buildFilterOptions("qtyIssued");
    const qtyOpts = await qtyFetch({ search: "" });
    expect(qtyOpts.items.length).toBe(3);
    expect(qtyOpts.items.map((o) => o.value)).toEqual(["5", "10", "25"]);
  });

  const sampleIaLines = [
    {
      itemId: "item-1",
      itemCode: "SKU-A",
      itemName: "Cụm đèn pha",
      qtyAdjusted: "-3",
      unitCost: "120000",
    },
    {
      itemId: "item-2",
      itemCode: "SKU-B",
      itemName: "Đèn xi nhan",
      qtyAdjusted: "5",
      unitCost: "80000",
    },
    {
      itemId: "item-3",
      itemCode: "SKU-C",
      itemName: "Gương chiếu hậu",
      qtyAdjusted: "10",
      unitCost: "45000",
    },
  ];

  it("handles Inventory Adjustment (IA) filtering and custom numeric sorting", () => {
    const { result } = renderHook(() =>
      useVoucherClientFilter({
        tableId: "ia-details-table",
        lines: sampleIaLines,
        isOpen: true,
        getCode: (l) => l.itemCode,
        getName: (l) => l.itemName,
        customExtractors: {
          itemCode: (l) => l.itemCode,
          itemName: (l) => l.itemName,
          qtyAdjusted: (l) => l.qtyAdjusted,
          unitCost: (l) => l.unitCost,
        },
        customSort: (a, b, field, isDesc) => {
          if (field === "qtyAdjusted") {
            const numA = Number(a.qtyAdjusted ?? 0);
            const numB = Number(b.qtyAdjusted ?? 0);
            return isDesc ? numB - numA : numA - numB;
          }
          return null;
        },
      }),
    );

    // Test sort by qtyAdjusted descending
    act(() => {
      result.current.listHook.setSort("qtyAdjusted", "desc");
    });
    expect(result.current.processedLines.map((l) => l.qtyAdjusted)).toEqual([
      "10",
      "5",
      "-3",
    ]);

    // Test operator on qtyAdjusted (> 0)
    act(() => {
      result.current.listHook.setColumnSearch("qtyAdjusted", "> 0");
    });
    expect(result.current.processedLines.length).toBe(2);
    expect(result.current.processedLines.map((l) => l.itemCode)).toEqual([
      "SKU-C",
      "SKU-B",
    ]);
  });
});

describe("ErpWarehouseTab Column Order Tests", () => {
  it("verifies type and categoryName are ordered after qtyAdjustment", () => {
    const keys = Object.keys(DEFAULT_WAREHOUSE_COLUMN_VISIBILITY);
    const adjIdx = keys.indexOf("qtyAdjustment");
    const typeIdx = keys.indexOf("type");
    const catIdx = keys.indexOf("categoryName");

    expect(adjIdx).toBeGreaterThan(-1);
    expect(typeIdx).toBeGreaterThan(-1);
    expect(catIdx).toBeGreaterThan(-1);

    expect(adjIdx).toBeLessThan(typeIdx);
    expect(typeIdx).toBeLessThan(catIdx);
    expect(typeIdx).toBe(adjIdx + 1);
    expect(catIdx).toBe(typeIdx + 1);
  });
});
