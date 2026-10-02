import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export type TableColumnState = ReturnType<typeof useTableColumnState>;

export interface GarageReconciliationInvoicesTableProps {
  invoiceDirection: "IN" | "OUT";
  items: ErpInvoice[];
  selectedMap: Record<string, ErpInvoice>;
  editMode?: boolean;
  tableState: TableColumnState;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (from: string) => void;
  onDateToChange: (to: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading?: boolean;
  onToggleInvoice: (inv: ErpInvoice) => void;
  onSelectAllInvoices: (checked: boolean) => void;
  onViewInvoiceDetail: (id: string) => void;
  onPreviewInvoicePdf: (pdf: {
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
  }) => void;
  containerClassName?: string;
  minWidth?: number;
}

export interface BuildInvoiceColumnsOptions {
  invoiceDirection: "IN" | "OUT";
  editMode?: boolean;
  isAllSelected: boolean;
  selectedMap: Record<string, ErpInvoice>;
  tableState: TableColumnState;
  dateFrom?: string;
  dateTo?: string;
  t: (key: string, defaultValue?: string) => string;
  onSelectAll: (checked: boolean) => void;
  onToggle: (inv: ErpInvoice) => void;
  onDateFromChange: (from: string) => void;
  onDateToChange: (to: string) => void;
  onPageReset: () => void;
  onViewDetail: (id: string) => void;
  onPreviewPdf: (pdf: {
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
  }) => void;
}
