import { type TableViewPreset } from "@/shared/hooks/useUserPreferences";

export const DEFAULT_BANK_COLUMN_VISIBILITY: Record<string, boolean> = {
  index: true,
  account: true,
  transDate: true,
  referenceNumber: true,
  description: true,
  thu: true,
  chi: true,
  balance: true,
  netOffAmount: false,
  remainingAmount: false,
  invoiceSubject: false,
  correspondentName: false,
  correspondentAccount: false,
  correspondentBank: false,
  branch: true,
};

export const AUDIT_BANK_COLUMN_VISIBILITY: Record<string, boolean> = {
  index: true,
  account: true,
  transDate: true,
  referenceNumber: true,
  description: false,
  thu: true,
  chi: true,
  balance: false,
  netOffAmount: true,
  remainingAmount: true,
  invoiceSubject: true,
  correspondentName: true,
  correspondentAccount: false,
  correspondentBank: false,
  branch: true,
};

export const BANK_STATEMENT_COLUMN_VIEW_PRESETS: TableViewPreset[] = [
  {
    key: "overview",
    label: "Tổng quan",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...DEFAULT_BANK_COLUMN_VISIBILITY,
    },
    isDefault: true,
    isCustom: false,
  },
  {
    key: "audit",
    label: "Kiểm toán / Đối soát",
    filters: {},
    columnFilters: {},
    columnVisibility: {
      ...AUDIT_BANK_COLUMN_VISIBILITY,
    },
    isDefault: true,
    isCustom: false,
  },
];

export interface ColumnGroupDef {
  groupKey: "general" | "amount" | "reconciliation" | "partner";
  titleKey: string;
  titleDefault: string;
  columns: Array<{
    key: string;
    labelKey: string;
    labelDefault: string;
    defaultVisible?: boolean;
  }>;
}

export const BANK_STATEMENT_COLUMN_GROUPS: ColumnGroupDef[] = [
  {
    groupKey: "general",
    titleKey: "bankStatement.viewConfigGroupGeneral",
    titleDefault: "Thông tin chung",
    columns: [
      {
        key: "index",
        labelKey: "bankStatement.columns.index",
        labelDefault: "STT (#)",
        defaultVisible: true,
      },
      {
        key: "account",
        labelKey: "bankStatement.columns.account",
        labelDefault: "Ngân hàng / Sổ quỹ",
        defaultVisible: true,
      },
      {
        key: "transDate",
        labelKey: "bankStatement.columns.transDate",
        labelDefault: "Ngày giao dịch",
        defaultVisible: true,
      },
      {
        key: "referenceNumber",
        labelKey: "bankStatement.columns.referenceNumber",
        labelDefault: "Số tham chiếu / Ref",
        defaultVisible: true,
      },
      {
        key: "description",
        labelKey: "bankStatement.columns.description",
        labelDefault: "Nội dung chuyển khoản / Diễn giải",
        defaultVisible: true,
      },
      {
        key: "branch",
        labelKey: "bankStatement.columns.branch",
        labelDefault: "Chi nhánh",
        defaultVisible: true,
      },
    ],
  },
  {
    groupKey: "amount",
    titleKey: "bankStatement.viewConfigGroupAmount",
    titleDefault: "Dòng tiền & Số dư",
    columns: [
      {
        key: "thu",
        labelKey: "bankStatement.columns.thu",
        labelDefault: "Tiền vào (Thu / Ghi Có)",
        defaultVisible: true,
      },
      {
        key: "chi",
        labelKey: "bankStatement.columns.chi",
        labelDefault: "Tiền ra (Chi / Ghi Nợ)",
        defaultVisible: true,
      },
      {
        key: "balance",
        labelKey: "bankStatement.columns.balance",
        labelDefault: "Số dư lũy kế",
        defaultVisible: true,
      },
    ],
  },
  {
    groupKey: "reconciliation",
    titleKey: "bankStatement.viewConfigGroupReconciliation",
    titleDefault: "Đối soát & Cấn trừ Hóa đơn",
    columns: [
      {
        key: "netOffAmount",
        labelKey: "bankStatement.columns.netOffAmount",
        labelDefault: "Đã cấn trừ",
        defaultVisible: false,
      },
      {
        key: "remainingAmount",
        labelKey: "bankStatement.columns.remainingAmount",
        labelDefault: "Còn lại",
        defaultVisible: false,
      },
      {
        key: "invoiceSubject",
        labelKey: "bankStatement.columns.invoiceSubject",
        labelDefault: "Đối tượng HĐ VAT",
        defaultVisible: false,
      },
    ],
  },
  {
    groupKey: "partner",
    titleKey: "bankStatement.viewConfigGroupPartner",
    titleDefault: "Đối tác & Chuyển khoản",
    columns: [
      {
        key: "correspondentName",
        labelKey: "bankStatement.columns.correspondentName",
        labelDefault: "Tên đối tác / Người thụ hưởng",
        defaultVisible: false,
      },
      {
        key: "correspondentAccount",
        labelKey: "bankStatement.columns.correspondentAccount",
        labelDefault: "Số tài khoản đối ứng",
        defaultVisible: false,
      },
      {
        key: "correspondentBank",
        labelKey: "bankStatement.columns.correspondentBank",
        labelDefault: "Ngân hàng đối tác",
        defaultVisible: false,
      },
    ],
  },
];
