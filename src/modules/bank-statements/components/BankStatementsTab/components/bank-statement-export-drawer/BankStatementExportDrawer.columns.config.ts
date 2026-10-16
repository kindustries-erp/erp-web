import type { BankStatementExportGroupKey } from "./components/BankStatementExportColumnSelector.type";

export interface BankStatementExportColumnItem {
  key: string;
  labelKey: string;
  defaultLabel: string;
  group: BankStatementExportGroupKey;
}

export const ALL_BANK_STATEMENT_EXPORT_COLUMNS: BankStatementExportColumnItem[] =
  [
    // 1. Thông tin giao dịch (General)
    {
      key: "stt",
      labelKey: "bankStatement.columns.stt",
      defaultLabel: "STT",
      group: "general",
    },
    {
      key: "account",
      labelKey: "bankStatement.columns.account",
      defaultLabel: "Tài khoản (Ngân hàng / Sổ quỹ)",
      group: "general",
    },
    {
      key: "transDate",
      labelKey: "bankStatement.columns.transDate",
      defaultLabel: "Ngày giao dịch",
      group: "general",
    },
    {
      key: "referenceNumber",
      labelKey: "bankStatement.columns.referenceNumber",
      defaultLabel: "Số tham chiếu",
      group: "general",
    },
    {
      key: "description",
      labelKey: "bankStatement.columns.description",
      defaultLabel: "Nội dung giao dịch",
      group: "general",
    },
    {
      key: "branchName",
      labelKey: "bankStatement.columns.branchName",
      defaultLabel: "Chi nhánh giao dịch",
      group: "general",
    },

    // 2. Phát sinh & Số dư (Amount)
    {
      key: "credit",
      labelKey: "bankStatement.columns.credit",
      defaultLabel: "Phát sinh Có (Thu)",
      group: "amount",
    },
    {
      key: "debit",
      labelKey: "bankStatement.columns.debit",
      defaultLabel: "Phát sinh Nợ (Chi)",
      group: "amount",
    },
    {
      key: "balance",
      labelKey: "bankStatement.columns.balance",
      defaultLabel: "Số dư",
      group: "amount",
    },
    {
      key: "netOffAmount",
      labelKey: "bankStatement.columns.netOffAmount",
      defaultLabel: "Đã cấn trừ",
      group: "amount",
    },
    {
      key: "remainingAmount",
      labelKey: "bankStatement.columns.remainingAmount",
      defaultLabel: "Còn lại",
      group: "amount",
    },

    // 3. Đối tác đối ứng (Correspondent)
    {
      key: "correspondentAccount",
      labelKey: "bankStatement.columns.correspondentAccount",
      defaultLabel: "Tài khoản đối ứng",
      group: "correspondent",
    },
    {
      key: "correspondentName",
      labelKey: "bankStatement.columns.correspondentName",
      defaultLabel: "Tên đối tác đối ứng",
      group: "correspondent",
    },
    {
      key: "correspondentBank",
      labelKey: "bankStatement.columns.correspondentBank",
      defaultLabel: "Ngân hàng đối tác",
      group: "correspondent",
    },

    // 4. Hóa đơn cấn trừ (InvoiceNetOff)
    {
      key: "invoiceBranchName",
      labelKey: "bankStatement.columns.invoiceBranchName",
      defaultLabel: "[HĐ] Chi nhánh",
      group: "invoiceNetOff",
    },
    {
      key: "invoiceDate",
      labelKey: "bankStatement.columns.invoiceDate",
      defaultLabel: "[HĐ] Ngày hóa đơn",
      group: "invoiceNetOff",
    },
    {
      key: "invoiceNo",
      labelKey: "bankStatement.columns.invoiceNo",
      defaultLabel: "[HĐ] Số hóa đơn",
      group: "invoiceNetOff",
    },
    {
      key: "invoiceSerial",
      labelKey: "bankStatement.columns.invoiceSerial",
      defaultLabel: "[HĐ] Ký hiệu hóa đơn",
      group: "invoiceNetOff",
    },
    {
      key: "invoicePartner",
      labelKey: "bankStatement.columns.invoicePartner",
      defaultLabel: "[HĐ] Tên đối tác",
      group: "invoiceNetOff",
    },
    {
      key: "invoiceDescription",
      labelKey: "bankStatement.columns.invoiceDescription",
      defaultLabel: "[HĐ] Nội dung hóa đơn",
      group: "invoiceNetOff",
    },
    {
      key: "invoiceTotalAmount",
      labelKey: "bankStatement.columns.invoiceTotalAmount",
      defaultLabel: "[HĐ] Tổng tiền hóa đơn",
      group: "invoiceNetOff",
    },
  ];

export const DEFAULT_BANK_STATEMENT_EXPORT_COLUMNS =
  ALL_BANK_STATEMENT_EXPORT_COLUMNS.map((c) => c.key);

export const BANK_STATEMENT_EXPORT_GROUPS: Array<{
  key: BankStatementExportGroupKey;
  labelKey: string;
  defaultLabel: string;
  colorClass: string;
}> = [
  {
    key: "general",
    labelKey: "bankStatement.exportDrawer.groups.general",
    defaultLabel: "Thông tin giao dịch",
    colorClass: "text-foreground/80 dark:text-foreground/80",
  },
  {
    key: "amount",
    labelKey: "bankStatement.exportDrawer.groups.amount",
    defaultLabel: "Phát sinh & Số dư",
    colorClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "correspondent",
    labelKey: "bankStatement.exportDrawer.groups.correspondent",
    defaultLabel: "Đối tác đối ứng",
    colorClass: "text-purple-600 dark:text-purple-400",
  },
  {
    key: "invoiceNetOff",
    labelKey: "bankStatement.exportDrawer.groups.invoiceNetOff",
    defaultLabel: "Hóa đơn cấn trừ",
    colorClass: "text-teal-600 dark:text-teal-400",
  },
];
