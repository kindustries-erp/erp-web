import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { getInvoiceRowClassName } from "../components/ErpInvoicesTab/utils";
import { useInvoiceColumns } from "../components/ErpInvoicesTab/components/InvoiceColumns";
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
});
