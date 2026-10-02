import React from "react";
import { useT } from "@/core/i18n";
import { Receipt } from "lucide-react";
import { NavGroup, NavGroupItem } from "../SidebarPrimitives";
import type { InvoiceNavGroupProps } from "./InvoiceNavGroup.type";
import { useInvoiceNavGroup } from "./InvoiceNavGroup.hook";

export function InvoiceNavGroup({
  collapsed,
  currentPage,
  navTo,
  canReadInvoices,
  canReadDebts,
}: InvoiceNavGroupProps) {
  const t = useT();
  const {
    shouldShowGroup,
    isGroupActive,
    isInvoiceActive,
    isPartnerDetailsActive,
    handleNavInvoices,
    handleNavPartnerDetails,
  } = useInvoiceNavGroup({
    currentPage,
    navTo,
    canReadInvoices,
    canReadDebts,
  });

  if (!shouldShowGroup) {
    return null;
  }

  return (
    <NavGroup
      collapsed={collapsed}
      icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
      label={t("nav.items.erpInvoices")}
      active={isGroupActive}
    >
      {canReadInvoices && (
        <NavGroupItem
          label={t("nav.items.erpInvoices")}
          active={isInvoiceActive}
          onClick={handleNavInvoices}
          contextPage="erp-invoices"
        />
      )}
      {canReadDebts && (
        <NavGroupItem
          label={t("nav.items.partnerDebts", "Công nợ theo đối tượng")}
          active={isPartnerDetailsActive}
          onClick={handleNavPartnerDetails}
          contextPage="invoice-debts"
        />
      )}
    </NavGroup>
  );
}
