export interface BankStatementExportColumnConfig {
  /** Trùng key cột trong backend `bank-statement-excel.layout.ts` */
  key: string;
  labelKey: string;
}

export interface BankStatementExportColumnGroupConfig {
  key: string;
  labelKey: string;
  columns: BankStatementExportColumnConfig[];
}

const COLUMN_LABEL = (key: string) => `v2.bankStatements.export.columns.${key}`;

const toColumns = (keys: string[]): BankStatementExportColumnConfig[] =>
  keys.map((key) => ({ key, labelKey: COLUMN_LABEL(key) }));

export const BANK_STATEMENT_EXPORT_COLUMN_GROUPS: BankStatementExportColumnGroupConfig[] =
  [
    {
      key: "general",
      labelKey: "v2.bankStatements.export.groups.general",
      columns: toColumns([
        "stt",
        "account",
        "transDate",
        "referenceNumber",
        "description",
        "cashflowClassification",
        "cashflowPurpose",
        "note",
        "businessPartner",
        "branchName",
      ]),
    },
    {
      key: "amount",
      labelKey: "v2.bankStatements.export.groups.amount",
      columns: toColumns([
        "credit",
        "debit",
        "balance",
        "netOffAmount",
        "remainingAmount",
      ]),
    },
    {
      key: "correspondent",
      labelKey: "v2.bankStatements.export.groups.correspondent",
      columns: toColumns([
        "correspondentAccount",
        "correspondentName",
        "correspondentBank",
      ]),
    },
    {
      key: "invoiceNetOff",
      labelKey: "v2.bankStatements.export.groups.invoiceNetOff",
      columns: toColumns([
        "invoiceBranchName",
        "invoiceDate",
        "invoiceNo",
        "invoiceSerial",
        "invoicePartner",
        "invoiceDescription",
        "invoiceTotalAmount",
      ]),
    },
  ];

/** Mặc định chọn đủ cột, khớp hành vi xuất hiện tại */
export const BANK_STATEMENT_EXPORT_DEFAULT_COLUMNS =
  BANK_STATEMENT_EXPORT_COLUMN_GROUPS.flatMap((group) =>
    group.columns.map((column) => column.key),
  );
