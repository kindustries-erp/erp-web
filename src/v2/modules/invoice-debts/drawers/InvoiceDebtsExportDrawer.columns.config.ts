export interface InvoiceDebtsExportColumnConfig {
  /** Trùng key cột trong backend */
  key: string;
  labelKey: string;
}

export interface InvoiceDebtsExportColumnGroupConfig {
  key: string;
  labelKey: string;
  columns: InvoiceDebtsExportColumnConfig[];
}

const COLUMN_LABEL = (key: string) => `v2.invoiceDebts.export.columns.${key}`;

export const INVOICE_DEBTS_EXPORT_COLUMN_GROUPS: InvoiceDebtsExportColumnGroupConfig[] =
  [
    {
      key: "summary",
      labelKey: "v2.invoiceDebts.export.groups.summary",
      columns: [
        "stt",
        "taxCode",
        "partnerName",
        "invoiceCount",
        "totalAmount",
        "paidAmount",
        "balanceAmount",
        "aging0To30",
        "aging31To60",
        "aging61To90",
        "agingOver90",
      ].map((key) => ({ key, labelKey: COLUMN_LABEL(key) })),
    },
    {
      key: "details",
      labelKey: "v2.invoiceDebts.export.groups.details",
      columns: [
        "stt",
        "partnerCode",
        "partnerName",
        "invoiceNo",
        "invoiceDate",
        "totalAmount",
        "paidAmount",
        "balanceAmount",
        "dueDate",
        "overdueDays",
        "debtStatus",
      ].map((key) => ({ key, labelKey: COLUMN_LABEL(key) })),
    },
  ];

/** Mặc định chọn đủ tất cả các cột của 2 sheet */
export const INVOICE_DEBTS_EXPORT_DEFAULT_COLUMNS =
  INVOICE_DEBTS_EXPORT_COLUMN_GROUPS.flatMap((group) =>
    group.columns.map((column) => column.key),
  );
