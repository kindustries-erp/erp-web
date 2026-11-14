import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";

/** Hình dạng bản ghi và payload của `/api/v2/business-partners` (khớp backend, không phụ thuộc V1) */

export interface BusinessPartnerDto {
  id: string;
  code: string;
  name: string;
  displayName?: string | null;
  partnerType: string;
  taxCode?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contactName?: string | null;
  status: string;
  notes?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Response danh sách: `items`, `pagination`, và `summaries` (tổng theo cột số, BP thường không có) */
export type BusinessPartnerListResultDto =
  V2PaginatedResponse<BusinessPartnerDto> & {
    summaries?: Record<string, V2SummaryMetric | null>;
  };

export interface ColumnOptionDto {
  label: string;
  value: string;
}

/** Response column-options chuẩn v2: `items` và `pagination` (có next/previous) */
export type ColumnOptionsResultDto = V2PaginatedResponse<ColumnOptionDto>;

export interface NextCodeDto {
  nextCode: string;
}

export interface BusinessPartnerPayloadDto {
  code: string;
  name: string;
  partnerType: string;
  displayName?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactName?: string;
  status: string;
  notes?: string;
}

/** Backend bọc bản ghi đơn trong `{ message, data }` */
export interface BusinessPartnerEnvelopeDto {
  message: string;
  data: BusinessPartnerDto;
}

/** Một dòng trong danh sách chọn đối tượng cho sao kê */
export interface PartnerSelectOptionDto {
  partnerId: string | null;
  code: string | null;
  name: string;
  taxCode: string | null;
  partnerType: string | null;
  source: "MASTER" | "INVOICE";
}

/** Response danh sách chọn đối tượng: `items` và `pagination` */
export type PartnerSelectOptionsDto =
  V2PaginatedResponse<PartnerSelectOptionDto>;

/** Kết quả đồng bộ đối tác từ hóa đơn (dryRun hoặc thực tế) */
export interface SyncFromInvoicesItemDto {
  taxCode: string;
  name: string;
  address: string | null;
  partnerType: "CUSTOMER" | "VENDOR";
}

export interface SyncFromInvoicesDto {
  message: string;
  dryRun: boolean;
  count: number;
  items: SyncFromInvoicesItemDto[];
}
