import { describe, it, expect, beforeEach } from "vitest";
import {
  isTableMatchingCurrentUrl,
  getInitialTableState,
  useTableColumnStore,
} from "@/shared/hooks/useTableColumnState";
import { encodeStateParam } from "@/shared/utils/pageUrl";

describe("ERP Invoices Filter Isolation across Tabs", () => {
  beforeEach(() => {
    // Reset table column store
    useTableColumnStore.setState({ tables: {} });
  });

  it("isTableMatchingCurrentUrl returns true only for the active tab's tableId", () => {
    // URL is ?tab=out
    expect(
      isTableMatchingCurrentUrl(
        "erp-invoices-table-OUT",
        "/erp-invoices",
        "?tab=out",
      ),
    ).toBe(true);
    expect(
      isTableMatchingCurrentUrl(
        "erp-invoices-table-IN",
        "/erp-invoices",
        "?tab=out",
      ),
    ).toBe(false);
    expect(
      isTableMatchingCurrentUrl(
        "erp-invoice-items-table-IN",
        "/erp-invoices",
        "?tab=out",
      ),
    ).toBe(false);

    // URL is ?tab=in
    expect(
      isTableMatchingCurrentUrl(
        "erp-invoices-table-IN",
        "/erp-invoices",
        "?tab=in",
      ),
    ).toBe(true);
    expect(
      isTableMatchingCurrentUrl(
        "erp-invoices-table-OUT",
        "/erp-invoices",
        "?tab=in",
      ),
    ).toBe(false);

    // Checkpoint / Modal / Drawer tables should NEVER match page URL filters
    expect(
      isTableMatchingCurrentUrl(
        "erp-invoices-table-checkpoint-IN",
        "/erp-invoices",
        "?tab=in",
      ),
    ).toBe(false);
  });

  it("getInitialTableState isolates column filters and does not leak partner filter from out tab to in tab", () => {
    const encodedPartnerFilter = encodeStateParam({
      partner: [
        "CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH CÔNG TY CỔ PHẦN DI CHUYỂN XANH",
      ],
    });

    // Simulate browser URL on tab=out with partner filter
    delete (window as any).location;
    window.location = new URL(
      `http://localhost/erp-invoices?tab=out&cf=${encodedPartnerFilter}`,
    ) as any;

    // erp-invoices-table-OUT should receive the partner filter
    const outTableState = getInitialTableState("erp-invoices-table-OUT");
    expect(outTableState.columnFilters).toEqual({
      partner: [
        "CHI NHÁNH THÀNH PHỐ HỒ CHÍ MINH CÔNG TY CỔ PHẦN DI CHUYỂN XANH",
      ],
    });

    // erp-invoices-table-IN should NOT receive the partner filter (stays clean)
    const inTableState = getInitialTableState("erp-invoices-table-IN");
    expect(inTableState.columnFilters).toEqual({});
  });
});
