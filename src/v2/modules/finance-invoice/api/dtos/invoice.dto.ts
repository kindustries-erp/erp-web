import type { V2PaginationMeta } from "@/v2/shared/types/v2-pagination";
import type { InvoiceDirection } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";

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
  branchIds?: string[] | null;
  preVatAmount?: number | string | null;
  vatAmount?: number | string | null;
  totalAmount?: number | string | null;
  vatRate?: number | string | null;
  discountAmount?: number | string | null;
  netOffAmount?: number | string | null;
  remainingAmount?: number | string | null;
  settlementOrder?: string | null;
  licensePlate?: string | null;
  postingStatus?: string | null;
  notes?: string | null;
  description?: string | null;
}

/** Số liệu tổng theo key đã gửi trong `summary_keys` của `GET /api/v2/invoices`; `null` = không tính được */
export type InvoiceSummariesDto = Record<string, V2SummaryMetric | null>;

/** `GET /api/v2/invoices` */
export interface InvoiceListResponseDto {
  items: InvoiceDto[];
  pagination: V2PaginationMeta;
  summaries: InvoiceSummariesDto;
}

export type InvoiceColumnOptionDto = string | { value: string; label: string };

/** `GET /api/v2/invoices/column-options`: `pagination.next` là trang kế, hoặc null khi hết */
export interface InvoiceColumnOptionsResponseDto {
  items: InvoiceColumnOptionDto[];
  pagination: V2PaginationMeta;
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
