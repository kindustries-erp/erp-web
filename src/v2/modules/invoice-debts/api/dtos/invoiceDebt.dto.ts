/** Hình dạng bản ghi và payload của `/api/v1/erp-invoices/debts` (khớp backend, không phụ thuộc V1) */

export interface InvoiceDebtDto {
  id: string;
  search: string;
  partnerType?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface InvoiceDebtListResultDto {
  items: InvoiceDebtDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Tổng toàn bộ dòng khớp bộ lọc, theo tên cột số (khớp `V2Column.key`) */
  summaries?: Record<string, number>;
}

export interface ColumnOptionsResultDto {
  items: { label: string; value: string }[];
  total: number;
  next: number | null;
}

/** Backend bọc bản ghi đơn trong `{ message, data }` */
export interface InvoiceDebtEnvelopeDto {
  message: string;
  data: InvoiceDebtDto;
}

export interface InvoiceDebtPayloadDto {
  search: string;
  partnerType?: string;
}
