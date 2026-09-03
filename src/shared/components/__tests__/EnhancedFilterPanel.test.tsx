import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  ColumnValueType,
  TextFilterOperator,
  NumberFilterOperator,
  type DataTableColumn,
} from "@/shared/components/DataTable/types";
import {
  extractColumnFilterDescriptors,
  evaluateTextFilter,
  evaluateNumberFilter,
  filterClientItems,
} from "@/shared/components/DataTable/createColumnHeaderFilter";
import { ActiveFilterChips } from "@/shared/components/FilterPanel/ActiveFilterChips";
import { FilterChipCategory } from "@/shared/components/DataTable/types";

// Mock i18n
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

// Mock ResizeObserver
if (typeof window !== "undefined") {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe("Enhanced Filter Engine & Operators", () => {
  describe("1. evaluateTextFilter", () => {
    it("evaluates CONTAINS operator", () => {
      expect(
        evaluateTextFilter("Hóa đơn VAT", "đơn", TextFilterOperator.CONTAINS),
      ).toBe(true);
      expect(
        evaluateTextFilter("Hóa đơn VAT", "phiếu", TextFilterOperator.CONTAINS),
      ).toBe(false);
    });

    it("evaluates NOT_CONTAINS operator", () => {
      expect(
        evaluateTextFilter(
          "Hóa đơn VAT",
          "phiếu",
          TextFilterOperator.NOT_CONTAINS,
        ),
      ).toBe(true);
      expect(
        evaluateTextFilter(
          "Hóa đơn VAT",
          "đơn",
          TextFilterOperator.NOT_CONTAINS,
        ),
      ).toBe(false);
    });

    it("evaluates STARTS_WITH operator", () => {
      expect(
        evaluateTextFilter("HD-2026-001", "HD", TextFilterOperator.STARTS_WITH),
      ).toBe(true);
      expect(
        evaluateTextFilter(
          "HD-2026-001",
          "001",
          TextFilterOperator.STARTS_WITH,
        ),
      ).toBe(false);
    });

    it("evaluates ENDS_WITH operator", () => {
      expect(
        evaluateTextFilter("HD-2026-001", "001", TextFilterOperator.ENDS_WITH),
      ).toBe(true);
      expect(
        evaluateTextFilter("HD-2026-001", "HD", TextFilterOperator.ENDS_WITH),
      ).toBe(false);
    });

    it("evaluates EQUALS & NOT_EQUALS operator", () => {
      expect(
        evaluateTextFilter("ACTIVE", "active", TextFilterOperator.EQUALS),
      ).toBe(true);
      expect(
        evaluateTextFilter("ACTIVE", "in_active", TextFilterOperator.EQUALS),
      ).toBe(false);
      expect(
        evaluateTextFilter(
          "ACTIVE",
          "in_active",
          TextFilterOperator.NOT_EQUALS,
        ),
      ).toBe(true);
    });

    it("evaluates IS_EMPTY & IS_NOT_EMPTY operator", () => {
      expect(evaluateTextFilter("", "", TextFilterOperator.IS_EMPTY)).toBe(
        true,
      );
      expect(evaluateTextFilter("hello", "", TextFilterOperator.IS_EMPTY)).toBe(
        false,
      );
      expect(
        evaluateTextFilter("hello", "", TextFilterOperator.IS_NOT_EMPTY),
      ).toBe(true);
      expect(evaluateTextFilter("", "", TextFilterOperator.IS_NOT_EMPTY)).toBe(
        false,
      );
    });
  });

  describe("2. evaluateNumberFilter", () => {
    it("evaluates EQUALS and NOT_EQUALS", () => {
      expect(
        evaluateNumberFilter(5000000, 5000000, NumberFilterOperator.EQUALS),
      ).toBe(true);
      expect(
        evaluateNumberFilter("5,000,000", 5000000, NumberFilterOperator.EQUALS),
      ).toBe(true);
      expect(
        evaluateNumberFilter(
          5000000,
          10000000,
          NumberFilterOperator.NOT_EQUALS,
        ),
      ).toBe(true);
    });

    it("evaluates GREATER_THAN and GREATER_THAN_OR_EQUAL", () => {
      expect(
        evaluateNumberFilter(100, 50, NumberFilterOperator.GREATER_THAN),
      ).toBe(true);
      expect(
        evaluateNumberFilter(50, 50, NumberFilterOperator.GREATER_THAN),
      ).toBe(false);
      expect(
        evaluateNumberFilter(
          50,
          50,
          NumberFilterOperator.GREATER_THAN_OR_EQUAL,
        ),
      ).toBe(true);
    });

    it("evaluates LESS_THAN and LESS_THAN_OR_EQUAL", () => {
      expect(evaluateNumberFilter(30, 50, NumberFilterOperator.LESS_THAN)).toBe(
        true,
      );
      expect(evaluateNumberFilter(50, 50, NumberFilterOperator.LESS_THAN)).toBe(
        false,
      );
      expect(
        evaluateNumberFilter(50, 50, NumberFilterOperator.LESS_THAN_OR_EQUAL),
      ).toBe(true);
    });

    it("evaluates BETWEEN operator", () => {
      expect(
        evaluateNumberFilter(50, 20, NumberFilterOperator.BETWEEN, 100),
      ).toBe(true);
      expect(
        evaluateNumberFilter(10, 20, NumberFilterOperator.BETWEEN, 100),
      ).toBe(false);
      expect(
        evaluateNumberFilter(150, 20, NumberFilterOperator.BETWEEN, 100),
      ).toBe(false);
    });
  });

  describe("3. extractColumnFilterDescriptors", () => {
    it("extracts and infers ColumnValueType accurately", () => {
      const mockCols: DataTableColumn<any>[] = [
        { key: "index", header: "#" },
        { key: "code", header: "Mã phiếu", valueType: ColumnValueType.TEXT },
        {
          key: "totalAmount",
          header: "Tổng tiền",
          valueType: ColumnValueType.NUMBER,
        },
        {
          key: "createdAt",
          header: "Ngày tạo",
          valueType: ColumnValueType.DATE,
        },
        {
          key: "status",
          header: "Trạng thái",
          filterOptions: [{ label: "A", value: "A" }],
        },
      ];

      const descriptors = extractColumnFilterDescriptors(mockCols);
      expect(descriptors.length).toBe(4); // index is ignored
      expect(descriptors.find((d) => d.key === "code")?.type).toBe(
        ColumnValueType.TEXT,
      );
      expect(descriptors.find((d) => d.key === "totalAmount")?.type).toBe(
        ColumnValueType.NUMBER,
      );
      expect(descriptors.find((d) => d.key === "createdAt")?.type).toBe(
        ColumnValueType.DATE,
      );
      expect(descriptors.find((d) => d.key === "status")?.type).toBe(
        ColumnValueType.SELECT,
      );
    });
  });

  describe("4. filterClientItems with advanced operators", () => {
    it("filters items with TextFilterOperator and NumberFilterOperator", () => {
      const items = [
        { id: "1", code: "HD01", amount: 1000000 },
        { id: "2", code: "HD02", amount: 5000000 },
        { id: "3", code: "XK01", amount: 8000000 },
      ];

      const listHookLike: any = {
        sorts: [],
        setSort: vi.fn(),
        columnFilters: {},
        setColumnFilter: vi.fn(),
        columnSearch: {
          code: "HD",
          amount: "3000000",
        },
        setColumnSearch: vi.fn(),
        columnOperators: {
          code: TextFilterOperator.STARTS_WITH,
          amount: NumberFilterOperator.GREATER_THAN,
        },
      };

      const result = filterClientItems(items, listHookLike, {
        columnTypes: {
          code: ColumnValueType.TEXT,
          amount: ColumnValueType.NUMBER,
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("2"); // HD02, amount 5000000 > 3000000
    });
  });

  describe("5. ActiveFilterChips UI Component", () => {
    it("renders chips and triggers onRemoveChip", () => {
      const onRemove = vi.fn();
      const onChipClick = vi.fn();

      const chips = [
        {
          id: "search-code",
          columnKey: "code",
          category: FilterChipCategory.TEXT,
          label: "Mã",
          valueDisplay: 'Bắt đầu bằng "HD"',
        },
        {
          id: "filter-status",
          columnKey: "status",
          category: FilterChipCategory.MULTI_SELECT,
          label: "Trạng thái",
          valueDisplay: "Đã duyệt, Chờ duyệt",
        },
      ];

      render(
        <ActiveFilterChips
          chips={chips}
          onRemoveChip={onRemove}
          onChipClick={onChipClick}
        />,
      );

      expect(screen.getByText("Đang lọc (2)")).toBeDefined();
      expect(screen.getByText("Mã:")).toBeDefined();
      expect(screen.getByText("Trạng thái:")).toBeDefined();

      const removeBtns = screen.getAllByRole("button");
      fireEvent.click(removeBtns[0]);
      expect(onRemove).toHaveBeenCalledWith("search-code");
    });
  });
});
