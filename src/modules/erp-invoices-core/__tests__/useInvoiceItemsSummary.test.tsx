import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInvoiceItemsSummary } from "../components/ErpInvoiceItemsSection/hooks/useInvoiceItemsSummary";
import { type ErpInvoiceItemRow } from "../api/erpInvoicesCoreApi";

describe("useInvoiceItemsSummary", () => {
  it("should return undefined when items is empty or undefined", () => {
    const { result: r1 } = renderHook(() => useInvoiceItemsSummary([]));
    expect(r1.current).toBeUndefined();

    const { result: r2 } = renderHook(() =>
      useInvoiceItemsSummary({ items: [] }),
    );
    expect(r2.current).toBeUndefined();
  });

  it("should calculate page subtotal amounts, quantities, and fallback cumulative for page 1 correctly", () => {
    const mockItems: ErpInvoiceItemRow[] = [
      {
        id: "item-1",
        invoiceId: "inv-1",
        invoiceNo: "0000001",
        invoiceDate: "2026-08-01",
        direction: "IN",
        status: "ACTIVE",
        quantity: 10,
        unitPrice: 50000,
        preVatAmount: 500000,
        vatAmount: 50000,
        discountAmount: 10000,
        totalAmount: 540000,
        invoiceSubcategory: "NORMAL",
      },
      {
        id: "item-2",
        invoiceId: "inv-1",
        invoiceNo: "0000001",
        invoiceDate: "2026-08-01",
        direction: "IN",
        status: "ACTIVE",
        quantity: 5,
        unitPrice: 100000,
        preVatAmount: 500000,
        vatAmount: 50000,
        discountAmount: 0,
        totalAmount: 550000,
        invoiceSubcategory: "NORMAL",
      },
    ];

    const { result } = renderHook(() =>
      useInvoiceItemsSummary({
        items: mockItems,
        page: 1,
        pageSize: 20,
        totalCount: 2,
        totalPages: 1,
      }),
    );

    const summary = result.current;
    expect(summary).toBeDefined();
    expect(summary?.description).toBeDefined();
    expect(summary?.quantity).toBeDefined();
    expect(summary?.preVatAmount).toBeDefined();
    expect(summary?.vatAmount).toBeDefined();
    expect(summary?.discountAmount).toBeDefined();
    expect(summary?.totalAmount).toBeDefined();

    // Verify subtotal amounts and cumulative passed into SubtotalSummaryCell props
    const qtyProps = (summary?.quantity as any).props;
    expect(qtyProps.subtotalQty).toBe(15);
    expect(qtyProps.grandTotalQty).toBe(15);
    expect(qtyProps.cumulativeQty).toBe(15);
    expect(qtyProps.variantType).toBe("qty");

    const preVatProps = (summary?.preVatAmount as any).props;
    expect(preVatProps.subtotalAmount).toBe(1000000);
    expect(preVatProps.grandTotalAmount).toBe(1000000);
    expect(preVatProps.cumulativeAmount).toBe(1000000);
    expect(preVatProps.variantType).toBe("amount");

    const vatProps = (summary?.vatAmount as any).props;
    expect(vatProps.subtotalAmount).toBe(100000);
    expect(vatProps.grandTotalAmount).toBe(100000);
    expect(vatProps.cumulativeAmount).toBe(100000);
    expect(vatProps.variantType).toBe("amount");

    const discProps = (summary?.discountAmount as any).props;
    expect(discProps.subtotalAmount).toBe(10000);
    expect(discProps.grandTotalAmount).toBe(10000);
    expect(discProps.cumulativeAmount).toBe(10000);
    expect(discProps.variantType).toBe("amount");

    const totalProps = (summary?.totalAmount as any).props;
    expect(totalProps.subtotalAmount).toBe(1090000);
    expect(totalProps.grandTotalAmount).toBe(1090000);
    expect(totalProps.cumulativeAmount).toBe(1090000);
    expect(totalProps.variantType).toBe("amount");

    const descProps = (summary?.description as any).props;
    expect(descProps.variantType).toBe("label");
    expect(descProps.currentPageCount).toBe(2);
    expect(descProps.totalCount).toBe(2);
    expect(descProps.page).toBe(1);
    expect(descProps.totalPages).toBe(1);
    expect(descProps.cumulativeCount).toBe(2);
  });

  it("should combine page subtotals with grand totals and cumulative totals from API summary on multi-page lists", () => {
    const mockItems: ErpInvoiceItemRow[] = [
      {
        id: "item-3",
        invoiceId: "inv-2",
        invoiceNo: "0000002",
        invoiceDate: "2026-08-02",
        direction: "OUT",
        status: "ACTIVE",
        quantity: 20,
        preVatAmount: 2000000,
        vatAmount: 200000,
        discountAmount: 50000,
        totalAmount: 2150000,
        invoiceSubcategory: "NORMAL",
      },
    ];

    const grandSummary = {
      totalQuantity: 500,
      totalPreVatAmount: 50000000,
      totalVatAmount: 5000000,
      totalDiscountAmount: 1000000,
      totalAmount: 54000000,
      cumulativeQuantity: 120,
      cumulativePreVatAmount: 12000000,
      cumulativeVatAmount: 1200000,
      cumulativeDiscountAmount: 250000,
      cumulativeTotalAmount: 12950000,
    };

    const { result } = renderHook(() =>
      useInvoiceItemsSummary({
        items: mockItems,
        summary: grandSummary,
        page: 2,
        pageSize: 50,
        totalCount: 150,
        totalPages: 3,
      }),
    );

    const summary = result.current;
    expect(summary).toBeDefined();

    // Check quantity props
    const qtyProps = (summary?.quantity as any).props;
    expect(qtyProps.subtotalQty).toBe(20);
    expect(qtyProps.grandTotalQty).toBe(500);
    expect(qtyProps.cumulativeQty).toBe(120);
    expect(qtyProps.page).toBe(2);
    expect(qtyProps.totalPages).toBe(3);

    // Check preVatAmount props
    const preVatProps = (summary?.preVatAmount as any).props;
    expect(preVatProps.subtotalAmount).toBe(2000000);
    expect(preVatProps.grandTotalAmount).toBe(50000000);
    expect(preVatProps.cumulativeAmount).toBe(12000000);

    // Check vatAmount props
    const vatProps = (summary?.vatAmount as any).props;
    expect(vatProps.subtotalAmount).toBe(200000);
    expect(vatProps.grandTotalAmount).toBe(5000000);
    expect(vatProps.cumulativeAmount).toBe(1200000);

    // Check discountAmount props
    const discProps = (summary?.discountAmount as any).props;
    expect(discProps.subtotalAmount).toBe(50000);
    expect(discProps.grandTotalAmount).toBe(1000000);
    expect(discProps.cumulativeAmount).toBe(250000);

    // Check totalAmount props
    const totalProps = (summary?.totalAmount as any).props;
    expect(totalProps.subtotalAmount).toBe(2150000);
    expect(totalProps.grandTotalAmount).toBe(54000000);
    expect(totalProps.cumulativeAmount).toBe(12950000);

    // Check description label props and cumulativeCount
    const descProps = (summary?.description as any).props;
    expect(descProps.variantType).toBe("label");
    expect(descProps.page).toBe(2);
    expect(descProps.totalPages).toBe(3);
    expect(descProps.totalCount).toBe(150);
    expect(descProps.currentPageCount).toBe(1);
    // Cumulative count at page 2 with pageSize 50 and 1 item on current page = (2-1)*50 + 1 = 51
    expect(descProps.cumulativeCount).toBe(51);
  });
});
