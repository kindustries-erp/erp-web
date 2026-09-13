import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { getInvoiceRowClassName } from "../components/ErpInvoicesTab/utils";
import { useInvoiceColumns } from "../components/ErpInvoicesTab/components/InvoiceColumns";
import { useItemColumns } from "../components/ErpInvoiceItemsSection/components/itemColumns";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

describe("Invoice Table Styles & Columns Enhancements", () => {
  describe("getInvoiceRowClassName (Row Dimming Rules)", () => {
    it("should dim row with status 'Bị thay thế' (taxInvoiceStatus = 4)", () => {
      const inv = {
        id: "inv-1",
        taxInvoiceStatus: 4,
        status: "ACTIVE",
      } as ErpInvoice;

      const className = getInvoiceRowClassName(inv);
      expect(className).toContain("opacity-40");
      expect(className).toContain("text-muted-foreground");
    });

    it("should dim row with status 'Bị hủy' (taxInvoiceStatus = 6) or 'CANCELLED'", () => {
      const cancelledInv = {
        id: "inv-2",
        status: "CANCELLED",
        taxInvoiceStatus: 1,
      } as ErpInvoice;
      expect(getInvoiceRowClassName(cancelledInv)).toContain("opacity-40");

      const voidInv = {
        id: "inv-3",
        taxInvoiceStatus: 6,
        status: "ACTIVE",
      } as ErpInvoice;
      expect(getInvoiceRowClassName(voidInv)).toContain("opacity-40");
    });

    it("should NOT dim row with status 'Thay thế' (taxInvoiceStatus = 2) and should apply amber highlight even if status is CANCELLED", () => {
      const replacementInv = {
        id: "inv-4",
        taxInvoiceStatus: 2,
        status: "ACTIVE",
      } as ErpInvoice;

      const className = getInvoiceRowClassName(replacementInv);
      expect(className).toBeDefined();
      expect(className).not.toContain("opacity-40");
      expect(className).toContain("bg-amber-50/40");

      const replacementCancelledInv = {
        id: "inv-4-cancelled",
        taxInvoiceStatus: 2,
        status: "CANCELLED",
      } as ErpInvoice;
      const classNameCancelled = getInvoiceRowClassName(
        replacementCancelledInv,
      );
      expect(classNameCancelled).toBeDefined();
      expect(classNameCancelled).not.toContain("opacity-40");
      expect(classNameCancelled).toContain("bg-amber-50/40");
    });

    it("should dim row with status 'Bị thay thế' (taxInvoiceStatus = 4) even if status is CONFIRMED", () => {
      const replacedInv = {
        id: "inv-4-confirmed",
        taxInvoiceStatus: 4,
        status: "CONFIRMED",
      } as ErpInvoice;
      const className = getInvoiceRowClassName(replacedInv);
      expect(className).toContain("opacity-40");
      expect(className).toContain("text-muted-foreground");
    });

    it("should NOT dim row with status 'Mới' (taxInvoiceStatus = 1)", () => {
      const normalInv = {
        id: "inv-5",
        taxInvoiceStatus: 1,
        status: "ACTIVE",
      } as ErpInvoice;

      const className = getInvoiceRowClassName(normalInv);
      expect(className).toBeUndefined();
    });

    it("should NOT dim row with status 'Điều chỉnh' (3) or 'Bị điều chỉnh' (5)", () => {
      const adjInv = {
        id: "inv-6",
        taxInvoiceStatus: 3,
        status: "ACTIVE",
      } as ErpInvoice;
      const className3 = getInvoiceRowClassName(adjInv);
      expect(className3).not.toContain("opacity-40");
      expect(className3).toContain("bg-amber-50/40");

      const adjByInv = {
        id: "inv-7",
        taxInvoiceStatus: 5,
        status: "ACTIVE",
      } as ErpInvoice;
      const className5 = getInvoiceRowClassName(adjByInv);
      expect(className5).not.toContain("opacity-40");
      expect(className5).toContain("bg-amber-50/40");
    });
  });

  describe("useInvoiceColumns (Column Ordering)", () => {
    it("should position discountAmount immediately to the left of vatRate", () => {
      const mockListHook: any = {
        tableState: {
          columnFilters: {},
          columnSearch: {},
          sorts: [],
        },
        filterPanel: {
          state: {
            dateFrom: "",
            dateTo: "",
          },
        },
      };

      const options: any = {
        direction: "IN",
        t: (k: string, fallback: string) => fallback || k,
        branches: [],
        listHook: mockListHook,
        openPopoverId: null,
        setOpenPopoverId: vi.fn(),
        setPreviewPdf: vi.fn(),
        setSelectedPartner: vi.fn(),
        setPartnerDrawerOpen: vi.fn(),
        handleOpenInternal: vi.fn(),
        handleDownload: vi.fn(),
        handlePreviewPdf: vi.fn(),
        getSortState: vi.fn(() => "none"),
        handleSortChange: vi.fn(),
        handleSearchChange: vi.fn(),
        handleFilterChange: vi.fn(),
        fetchInvoiceOptions: vi.fn(),
      };

      const { result } = renderHook(() => useInvoiceColumns(options));
      const columnKeys = result.current.map((col) => col.key);

      const discountIdx = columnKeys.indexOf("discountAmount");
      const vatRateIdx = columnKeys.indexOf("vatRate");
      const totalAmountIdx = columnKeys.indexOf("totalAmount");

      expect(discountIdx).toBeGreaterThan(-1);
      expect(vatRateIdx).toBeGreaterThan(-1);
      expect(totalAmountIdx).toBeGreaterThan(-1);

      // discountAmount is immediately before vatRate
      expect(discountIdx).toBe(vatRateIdx - 1);
      // totalAmount is immediately before discountAmount
      expect(totalAmountIdx).toBe(discountIdx - 1);
    });
  });

  describe("useItemColumns (STT and Date Formatting)", () => {
    it("should render STT as passed idx directly and format invoiceDate as dd-MM-yyyy without time", () => {
      const mockListHook: any = {
        page: 6,
        pageSize: 200,
        sorts: ["-invoiceDate"],
        columnFilters: {},
        columnSearch: {},
        dateFrom: "",
        dateTo: "",
      };

      const options: any = {
        direction: "IN",
        t: (k: string, fallback: string) => fallback || k,
        listHook: mockListHook,
        getSortState: vi.fn(() => "desc"),
        fetchColumnOptions: vi.fn(),
        handleOpenInternal: vi.fn(),
      };

      const { result } = renderHook(() => useItemColumns(options));
      const columns = result.current;

      const indexCol = columns.find((c) => c.key === "index");
      const dateCol = columns.find((c) => c.key === "invoiceDate");

      expect(indexCol).toBeDefined();
      expect(dateCol).toBeDefined();

      // Check STT cell rendering
      const renderedIndex = (indexCol?.cell as any)({}, 1001);
      expect(renderedIndex.props.children).toBe(1001);

      // Check invoiceDate cell rendering (dd-MM-yyyy without time)
      const renderedDate = (dateCol?.cell as any)(
        { invoiceDate: "2026-08-19" },
        1,
      );
      expect(renderedDate.props.children).toBe("19-08-2026");

      const renderedDateIso = (dateCol?.cell as any)(
        { invoiceDate: "2026-06-01T07:00:00.000Z" },
        1,
      );
      expect(renderedDateIso.props.children).toBe("01-06-2026");
    });

    it("should configure filter headers with search and column options for amount columns and description", () => {
      const mockListHook: any = {
        page: 1,
        pageSize: 20,
        sorts: [],
        columnFilters: {
          description: ["Lốp xe"],
          totalAmount: ["1000000"],
        },
        columnSearch: {
          discountAmount: "50000",
        },
        dateFrom: "",
        dateTo: "",
        setSort: vi.fn(),
        setColumnSearch: vi.fn(),
        setColumnFilter: vi.fn(),
      };

      const options: any = {
        direction: "IN",
        t: (k: string, fallback: string) => fallback || k,
        listHook: mockListHook,
        getSortState: vi.fn(() => "none"),
        fetchColumnOptions: vi.fn(),
        handleOpenInternal: vi.fn(),
      };

      const { result } = renderHook(() => useItemColumns(options));
      const columns = result.current;

      const descCol = columns.find((c) => c.key === "description");
      expect(descCol).toBeDefined();
      const descHeader = descCol?.header as React.ReactElement<any>;
      expect(descHeader.props.columnKey).toBe("description");
      expect(descHeader.props.fetchOptions).toBeDefined();
      expect(descHeader.props.enableSelectAllMatching).toBe(true);
      expect(descHeader.props.isActive).toBe(true);

      const amountKeys = [
        "quantity",
        "unitPrice",
        "preVatAmount",
        "vatAmount",
        "discountAmount",
        "totalAmount",
      ];

      for (const key of amountKeys) {
        const col = columns.find((c) => c.key === key);
        expect(col).toBeDefined();
        const header = col?.header as React.ReactElement<any>;
        expect(header.props.columnKey).toBe(key);
        expect(header.props.hideFilter).toBeFalsy();
        expect(header.props.fetchOptions).toBeDefined();
        expect(header.props.formatOptionLabel).toBeDefined();
        expect(header.props.enableSelectAllMatching).toBe(true);
      }

      // Check discountAmount searchValue and onSearchChange are wired
      const discountCol = columns.find((c) => c.key === "discountAmount");
      const discountHeader = discountCol?.header as React.ReactElement<any>;
      expect(discountHeader.props.searchValue).toBe("50000");
      expect(discountHeader.props.isActive).toBe(true);
      discountHeader.props.onSearchChange("60000");
      expect(mockListHook.setColumnSearch).toHaveBeenCalledWith(
        "discountAmount",
        "60000",
      );
    });

    it("should match column width sizes with header columns and format vatRate as percentage", () => {
      const mockListHook: any = {
        page: 1,
        pageSize: 20,
        sorts: [],
        columnFilters: {},
        columnSearch: {},
        dateFrom: "",
        dateTo: "",
        tableState: {
          columnFilters: {},
          columnSearch: {},
          sorts: [],
        },
        filterPanel: {
          state: { dateFrom: "", dateTo: "" },
        },
      };

      const itemOptions: any = {
        direction: "IN",
        t: (k: string, fallback: string) => fallback || k,
        listHook: mockListHook,
        getSortState: vi.fn(() => "none"),
        fetchColumnOptions: vi.fn(),
        handleOpenInternal: vi.fn(),
      };

      const { result: itemColsResult } = renderHook(() =>
        useItemColumns(itemOptions),
      );
      const itemCols = itemColsResult.current;

      // Check corresponding column sizes
      const expectedSizes: Record<string, number> = {
        index: 40,
        invoiceDate: 100,
        invoiceNo: 120,
        serialNo: 120,
        partner: 250,
        taxCode: 150,
        description: 250,
        preVatAmount: 150,
        vatAmount: 120,
        discountAmount: 120,
        totalAmount: 120,
        vatRate: 110,
      };

      for (const [key, size] of Object.entries(expectedSizes)) {
        const col = itemCols.find((c) => c.key === key);
        expect(col).toBeDefined();
        expect(col?.size).toBe(size);
      }

      // Check vatRate cell formatting
      const vatRateCol = itemCols.find((c) => c.key === "vatRate");
      expect(vatRateCol).toBeDefined();

      const rendered8 = (vatRateCol?.cell as any)({ vatRate: 0.08 }, 0);
      expect(rendered8.props.children).toBe("8%");

      const rendered10 = (vatRateCol?.cell as any)({ vatRate: "0.10" }, 0);
      expect(rendered10.props.children).toBe("10%");

      const rendered5 = (vatRateCol?.cell as any)({ vatRate: 5 }, 0);
      expect(rendered5.props.children).toBe("5%");

      const rendered0 = (vatRateCol?.cell as any)({ vatRate: 0 }, 0);
      expect(rendered0.props.children).toBe("0%");

      const renderedNull = (vatRateCol?.cell as any)({ vatRate: null }, 0);
      expect(renderedNull.props.children).toBe("—");

      const renderedKct = (vatRateCol?.cell as any)({ vatRate: "KCT" }, 0);
      expect(renderedKct.props.children).toBe("KCT");
    });
  });
});
