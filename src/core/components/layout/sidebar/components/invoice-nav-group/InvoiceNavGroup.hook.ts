import { useCallback, useMemo } from "react";
import type { InvoiceNavGroupProps } from "./InvoiceNavGroup.type";

export function useInvoiceNavGroup({
  currentPage,
  navTo,
  canReadInvoices,
  canReadDebts,
}: Pick<
  InvoiceNavGroupProps,
  "currentPage" | "navTo" | "canReadInvoices" | "canReadDebts"
>) {
  const isInvoiceActive = useMemo(() => {
    return (
      currentPage === "erp-invoices" ||
      currentPage === "erp-invoices-in" ||
      currentPage === "erp-invoices-out" ||
      currentPage === "erp-invoices-draft" ||
      currentPage === "invoice-dashboard"
    );
  }, [currentPage]);

  const isPartnerDetailsActive = useMemo(() => {
    return currentPage === "invoice-debts";
  }, [currentPage]);

  const isGroupActive = isInvoiceActive || isPartnerDetailsActive;
  const shouldShowGroup = canReadInvoices || canReadDebts;

  const handleNavInvoices = useCallback(() => {
    navTo("erp-invoices");
  }, [navTo]);

  const handleNavPartnerDetails = useCallback(() => {
    navTo("invoice-debts");
  }, [navTo]);

  return {
    shouldShowGroup,
    isGroupActive,
    isInvoiceActive,
    isPartnerDetailsActive,
    handleNavInvoices,
    handleNavPartnerDetails,
  };
}
