import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import React from "react";
import { InvoiceNavGroup } from "./InvoiceNavGroup";
import { useInvoiceNavGroup } from "./InvoiceNavGroup.hook";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    if (key === "nav.items.erpInvoices") return "Hóa đơn";
    if (key === "nav.items.partnerDebts" || key === "nav.items.partnerDetails")
      return fallback || "Công nợ theo đối tượng";
    return fallback || key;
  },
}));

vi.mock("@/shared/hooks/useIsMobile", () => ({
  useIsMobile: () => true,
}));

describe("useInvoiceNavGroup hook", () => {
  it("determines shouldShowGroup correctly based on permissions", () => {
    const navTo = vi.fn();
    const testPerms = (invoices: boolean, debts: boolean) =>
      renderHook(() =>
        useInvoiceNavGroup({
          currentPage: "dashboard",
          navTo,
          canReadInvoices: invoices,
          canReadDebts: debts,
        }),
      ).result.current.shouldShowGroup;

    expect(testPerms(false, false)).toBe(false);
    expect(testPerms(true, false)).toBe(true);
    expect(testPerms(false, true)).toBe(true);
  });

  it("calculates active states for invoices routes and partner details", () => {
    const navTo = vi.fn();
    const invoiceRoutes = [
      "erp-invoices",
      "erp-invoices-in",
      "erp-invoices-out",
      "erp-invoices-draft",
      "invoice-dashboard",
    ];

    for (const route of invoiceRoutes) {
      const { result } = renderHook(() =>
        useInvoiceNavGroup({
          currentPage: route,
          navTo,
          canReadInvoices: true,
          canReadDebts: true,
        }),
      );
      expect(result.current.isInvoiceActive).toBe(true);
      expect(result.current.isPartnerDetailsActive).toBe(false);
      expect(result.current.isGroupActive).toBe(true);
    }

    const { result: partnerResult } = renderHook(() =>
      useInvoiceNavGroup({
        currentPage: "invoice-debts",
        navTo,
        canReadInvoices: true,
        canReadDebts: true,
      }),
    );
    expect(partnerResult.current.isInvoiceActive).toBe(false);
    expect(partnerResult.current.isPartnerDetailsActive).toBe(true);
    expect(partnerResult.current.isGroupActive).toBe(true);
  });

  it("navigates correctly on handler invocation", () => {
    const navTo = vi.fn();
    const { result } = renderHook(() =>
      useInvoiceNavGroup({
        currentPage: "dashboard",
        navTo,
        canReadInvoices: true,
        canReadDebts: true,
      }),
    );

    result.current.handleNavInvoices();
    expect(navTo).toHaveBeenCalledWith("erp-invoices");
    result.current.handleNavPartnerDetails();
    expect(navTo).toHaveBeenCalledWith("invoice-debts");
  });
});

describe("InvoiceNavGroup component", () => {
  it("renders nothing when user has no permissions", () => {
    const { container } = render(
      <InvoiceNavGroup
        collapsed={false}
        currentPage="dashboard"
        navTo={vi.fn()}
        canReadInvoices={false}
        canReadDebts={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders parent and both sub-items when user has both permissions", () => {
    const navTo = vi.fn();
    render(
      <InvoiceNavGroup
        collapsed={false}
        currentPage="dashboard"
        navTo={navTo}
        canReadInvoices={true}
        canReadDebts={true}
      />,
    );

    expect(screen.getAllByText("Hóa đơn").length).toBeGreaterThanOrEqual(1);
    const partnerDebtsItem = screen.getByText("Công nợ theo đối tượng");
    expect(partnerDebtsItem).toBeInTheDocument();

    fireEvent.click(partnerDebtsItem);
    expect(navTo).toHaveBeenCalledWith("invoice-debts");
  });

  it("renders only Invoices sub-item when user only has canReadInvoices", () => {
    render(
      <InvoiceNavGroup
        collapsed={false}
        currentPage="dashboard"
        navTo={vi.fn()}
        canReadInvoices={true}
        canReadDebts={false}
      />,
    );
    expect(screen.getAllByText("Hóa đơn").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.queryByText("Công nợ theo đối tượng"),
    ).not.toBeInTheDocument();
  });

  it("renders only Partner Details sub-item when user only has canReadDebts", () => {
    render(
      <InvoiceNavGroup
        collapsed={false}
        currentPage="dashboard"
        navTo={vi.fn()}
        canReadInvoices={false}
        canReadDebts={true}
      />,
    );
    expect(screen.getByText("Công nợ theo đối tượng")).toBeInTheDocument();
    expect(screen.getAllByText("Hóa đơn").length).toBe(1);
  });
});
