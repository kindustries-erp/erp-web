import type { InvoiceDirection } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

/** Một dòng hóa đơn từ `GET /api/v1/erp-invoices`; số tiền API trả dạng chuỗi decimal */
export interface InvoiceDto {
  id: string;
  direction?: InvoiceDirection | null;
  invoiceNo?: string | null;
  serialNo?: string | null;
  invoiceDate?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  buyerName?: string | null;
  buyerTaxCode?: string | null;
  partner?: string | null;
  taxCode?: string | null;
  taxInvoiceStatus?: number | string | null;
  taxTab?: string | null;
  branchId?: string | null;
  preVatAmount?: number | string | null;
  vatAmount?: number | string | null;
  totalAmount?: number | string | null;
  netOffAmount?: number | string | null;
  postingStatus?: string | null;
  notes?: string | null;
  description?: string | null;
}

/** Tổng cộng toàn bộ kết quả (`grandTotal*`) */
export interface InvoiceTotalsDto {
  grandTotalPreVat: number;
  grandTotalVat: number;
  grandTotalDiscount: number;
  grandTotalAmount: number;
  grandTotalNetOff: number;
  grandTotalRemaining: number;
}

export interface InvoiceListResponseDto {
  items: InvoiceDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals?: InvoiceTotalsDto;
}

export type InvoiceColumnOptionDto = string | { value: string; label: string };

export interface InvoiceColumnOptionsResponseDto {
  items: InvoiceColumnOptionDto[];
  total: number;
  page: number;
  totalPages: number;
}

/** `GET /api/v1/erp-invoices/stats`: KPI theo tháng/tuần/ngày của một chiều hóa đơn */
export interface InvoiceStatsDto {
  monthTotal: number;
  monthPreVat: number;
}

/** Một tháng trong `GET /api/v1/erp-invoices/dashboard/stats` */
export interface InvoiceCashTrendDto {
  label: string;
  cashIn: number;
  cashOut: number;
  vatIn?: number;
  vatOut?: number;
}

export interface InvoiceDashboardStatsDto {
  cashTrend: InvoiceCashTrendDto[];
}

export interface InvoiceDashboardPartnerDto {
  taxCode: string;
  partnerName: string;
  totalInAmount: number;
  totalOutAmount: number;
  payableAmount: number;
  receivableAmount: number;
}

export interface InvoiceDashboardPartnersDto {
  items: InvoiceDashboardPartnerDto[];
  total: number;
}
