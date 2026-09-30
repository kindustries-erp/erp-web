export interface AllBankTransactionsTableProps {
  vouchers: any[];
  isLoading: boolean;
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  dateFrom: string;
  dateTo: string;
  tableState: any;
  setPage: (p: number) => void;
  setPageSize: (ps: number) => void;
  onToggleRow: (row: any) => void;
  onViewDetail: (id: string) => void;
  setDateRange?: (from?: string, to?: string) => void;
}
