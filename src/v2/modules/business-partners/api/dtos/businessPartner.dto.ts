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

export interface BusinessPartnerListResultDto {
  items: BusinessPartnerDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Tổng toàn bộ dòng khớp bộ lọc theo tên cột số; BP không có cột số nên thường rỗng */
  summaries?: Record<string, number>;
}

export interface ColumnOptionDto {
  label: string;
  value: string;
}

export interface ColumnOptionsResultDto {
  items: ColumnOptionDto[];
  total: number;
  next: number | null;
}

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

export interface PartnerSelectOptionsDto {
  items: PartnerSelectOptionDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
