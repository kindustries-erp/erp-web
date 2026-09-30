import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  invoiceDebtsApi,
  type PartnerInvoiceDetailItem,
} from "@/modules/accounting/api/invoiceDebtsApi";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import type { InvoicePartnerDebtDetailDrawerProps } from "./InvoicePartnerDebtDetailDrawer.type";
import type { PartnerDebtTotals } from "../../molecules/invoice-partner-debt-right-panel";

export function useInvoicePartnerDebtDetailDrawer({
  open,
  taxCode,
  partnerName,
  partnerType,
  dateFrom,
  dateTo,
}: InvoicePartnerDebtDetailDrawerProps) {
  const isCustomer = partnerType === "CUSTOMER";

  // Sub-tab navigation state (Left Panel)
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "analytics">(
    "invoices",
  );

  // Fetch Invoices of Partner (used for KPI summary & fallback)
  const {
    data: invoices = [],
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: [
      "invoice-partner-invoices",
      partnerType,
      taxCode,
      partnerName,
      dateFrom,
      dateTo,
    ],
    queryFn: () => {
      if (!taxCode && !partnerName) return Promise.resolve([]);
      return invoiceDebtsApi.getPartnerInvoices(taxCode || "KHONG_MST", {
        partner_type: partnerType,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        partner_name: partnerName || undefined,
      });
    },
    enabled: open && (Boolean(taxCode) || Boolean(partnerName)),
  });

  // Fetch Stats Trend for Analytics
  const { isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "invoice-partner-trend-stats",
      taxCode,
      partnerName,
      dateFrom,
      dateTo,
    ],
    queryFn: () => {
      if (!taxCode || taxCode === "KHONG_MST") {
        return Promise.resolve({ cashTrend: [] });
      }
      return invoiceDebtsApi.getPartnerStats(taxCode, {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
    },
    enabled: open && Boolean(taxCode) && taxCode !== "KHONG_MST",
  });

  // Internal invoice drawer hook for viewing full invoice detail
  const handleReloadInvoices = useCallback(() => {
    void refetchInvoices();
  }, [refetchInvoices]);
  const formHook = useErpInvoiceForm(handleReloadInvoices);

  // Compute KPI totals
  const totals: PartnerDebtTotals = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let maxAging = 0;
    let aging0_30 = 0;
    let aging31_60 = 0;
    let aging61_90 = 0;
    let agingOver90 = 0;

    for (const inv of invoices) {
      const rev = Number(inv.totalAmount) || 0;
      const paid = Number(inv.paidAmount) || 0;
      const bal = Number(inv.balanceAmount) || 0;
      const aging = Number(inv.agingDays) || 0;

      totalRevenue += rev;
      totalPaid += paid;
      totalBalance += bal;

      if (bal > 0) {
        if (aging > maxAging) maxAging = aging;
        if (aging <= 30) aging0_30 += bal;
        else if (aging <= 60) aging31_60 += bal;
        else if (aging <= 90) aging61_90 += bal;
        else agingOver90 += bal;
      }
    }

    const recoveryRate =
      totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalPaid,
      totalBalance,
      maxAging,
      recoveryRate,
      aging0_30,
      aging31_60,
      aging61_90,
      agingOver90,
    };
  }, [invoices]);

  const resolvedName = useMemo(() => {
    if (partnerName) return partnerName;
    const firstWithPartner = invoices.find((inv: PartnerInvoiceDetailItem) =>
      isCustomer ? inv.buyerName : inv.sellerName,
    );
    return (
      (isCustomer
        ? firstWithPartner?.buyerName
        : firstWithPartner?.sellerName) || "Đối tác"
    );
  }, [partnerName, invoices, isCustomer]);

  const partnerAddress = useMemo(() => {
    const firstWithAddress = invoices.find(
      (inv: PartnerInvoiceDetailItem) =>
        (isCustomer ? inv.buyerAddress : inv.sellerAddress) || "",
    );
    return isCustomer
      ? firstWithAddress?.buyerAddress
      : firstWithAddress?.sellerAddress;
  }, [invoices, isCustomer]);

  return {
    isCustomer,
    activeSubTab,
    setActiveSubTab,
    invoices,
    isLoadingInvoices,
    isLoadingStats,
    totals,
    resolvedName,
    partnerAddress,
    formHook,
  };
}
