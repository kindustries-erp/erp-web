import { useQuery } from "@tanstack/react-query";
import { financeInvoiceV2Api } from "../financeInvoiceV2Api";
import { isInvoiceSampleMode } from "../sampleMode";
import {
  buildInvoiceDashboard,
  DASHBOARD_PARTNER_LIMIT,
  type InvoiceDashboardView,
} from "@/v2/modules/finance-invoice/domain/rules/invoiceDashboard.logic";

export const INVOICE_DASHBOARD_QUERY_KEY = ["finance-invoices", "dashboard"];

/** Số liệu mẫu cho test và storybook, cùng hình dạng với API thật */
const sampleDashboard = (): InvoiceDashboardView =>
  buildInvoiceDashboard({
    out: { monthTotal: 3_729_000_000, monthPreVat: 3_390_000_000 },
    in: { monthTotal: 2_002_000_000, monthPreVat: 1_820_000_000 },
    trend: [
      { label: "2026-01", cashIn: 120, cashOut: 150, vatIn: 12, vatOut: 15 },
      { label: "2026-02", cashIn: 150, cashOut: 170, vatIn: 15, vatOut: 17 },
    ],
    partners: [
      {
        taxCode: "A",
        partnerName: "Công ty A",
        totalInAmount: 0,
        totalOutAmount: 600,
        payableAmount: 0,
        receivableAmount: 0,
      },
      {
        taxCode: "B",
        partnerName: "Công ty B",
        totalInAmount: 0,
        totalOutAmount: 400,
        payableAmount: 0,
        receivableAmount: 0,
      },
    ],
  });

/** Tải KPI hai chiều, xu hướng và đối tác song song rồi dựng view của tab Tổng quan */
export function useInvoiceDashboardQuery() {
  return useQuery<InvoiceDashboardView>({
    queryKey: INVOICE_DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      if (isInvoiceSampleMode()) return sampleDashboard();
      const [out, inStats, trend, partners] = await Promise.all([
        financeInvoiceV2Api.getStats("OUT"),
        financeInvoiceV2Api.getStats("IN"),
        financeInvoiceV2Api.getDashboardStats(),
        financeInvoiceV2Api.getDashboardPartners(DASHBOARD_PARTNER_LIMIT * 4),
      ]);
      return buildInvoiceDashboard({
        out,
        in: inStats,
        trend: trend.cashTrend,
        partners: partners.items,
      });
    },
    staleTime: 60_000,
  });
}
