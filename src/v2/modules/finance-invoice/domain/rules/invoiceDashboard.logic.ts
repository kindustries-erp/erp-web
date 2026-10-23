import type { V2ChartSeries } from "@/v2/shared/components/molecules/v2-chart-frame";
import type {
  InvoiceCashTrendDto,
  InvoiceDashboardPartnerDto,
  InvoiceStatsDto,
} from "@/v2/modules/finance-invoice/api/dtos/invoice.dto";

export const DASHBOARD_PARTNER_LIMIT = 5;

export interface InvoiceDashboardKpis {
  /** Doanh số bán ra tháng này (trước thuế, đơn vị VND) */
  sales: number;
  /** Chi phí mua vào tháng này (trước thuế) */
  purchases: number;
  /** VAT đầu ra tháng này */
  vatOut: number;
  /** VAT phải nộp ròng = VAT đầu ra - VAT đầu vào */
  vatNet: number;
}

export interface InvoiceDashboardView {
  kpis: InvoiceDashboardKpis;
  labels: string[];
  cashSeries: V2ChartSeries[];
  vatSeries: V2ChartSeries[];
  partnerLabels: string[];
  /** Tỷ trọng (%) của từng đối tác trong nhóm đầu */
  partnerShare: number[];
}

/** VAT = tổng sau thuế - tiền trước thuế */
const vatOf = (stats: InvoiceStatsDto) => stats.monthTotal - stats.monthPreVat;

/** Lấy nhóm đối tác đầu theo số bán ra và tính tỷ trọng trong nhóm đó */
export function toPartnerShare(partners: InvoiceDashboardPartnerDto[]) {
  const top = [...partners]
    .sort((a, b) => b.totalOutAmount - a.totalOutAmount)
    .slice(0, DASHBOARD_PARTNER_LIMIT);
  const sum = top.reduce((acc, item) => acc + item.totalOutAmount, 0);
  return {
    labels: top.map((item) => item.partnerName),
    share: top.map((item) =>
      sum > 0 ? Math.round((item.totalOutAmount / sum) * 100) : 0,
    ),
  };
}

export function buildInvoiceDashboard(input: {
  out: InvoiceStatsDto;
  in: InvoiceStatsDto;
  trend: InvoiceCashTrendDto[];
  partners: InvoiceDashboardPartnerDto[];
}): InvoiceDashboardView {
  const vatOut = vatOf(input.out);
  const vatIn = vatOf(input.in);
  const partners = toPartnerShare(input.partners);
  return {
    kpis: {
      sales: input.out.monthPreVat,
      purchases: input.in.monthPreVat,
      vatOut,
      vatNet: vatOut - vatIn,
    },
    labels: input.trend.map((item) => item.label),
    cashSeries: [
      {
        key: "cash-in",
        label: "Mua vào",
        data: input.trend.map((item) => item.cashIn),
      },
      {
        key: "cash-out",
        label: "Bán ra",
        data: input.trend.map((item) => item.cashOut),
      },
    ],
    vatSeries: [
      {
        key: "vat-in",
        label: "VAT đầu vào",
        data: input.trend.map((item) => item.vatIn ?? 0),
      },
      {
        key: "vat-out",
        label: "VAT đầu ra",
        data: input.trend.map((item) => item.vatOut ?? 0),
      },
    ],
    partnerLabels: partners.labels,
    partnerShare: partners.share,
  };
}

/** Đổi VND sang triệu đồng, làm tròn đến hàng đơn vị để hiển thị */
export const toMillion = (value: number) => Math.round(value / 1_000_000);
