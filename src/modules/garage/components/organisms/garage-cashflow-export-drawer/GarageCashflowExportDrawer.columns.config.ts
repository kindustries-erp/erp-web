export const GARAGE_CASHFLOW_EXPORT_GROUP_KEYS = [
  "general",
  "amount",
  "related",
] as const;

export type GarageCashflowExportGroupKey =
  (typeof GARAGE_CASHFLOW_EXPORT_GROUP_KEYS)[number];

export interface GarageCashflowExportColumnItem {
  key: string;
  defaultLabel: string;
  group: GarageCashflowExportGroupKey;
}

export const GARAGE_CASHFLOW_EXPORT_GROUPS: Record<
  GarageCashflowExportGroupKey,
  { label: string }
> = {
  general: { label: "Thông tin chứng từ" },
  amount: { label: "Phát sinh & Thanh toán" },
  related: { label: "Đối tác & Dịch vụ liên quan" },
};

export const ALL_GARAGE_CASHFLOW_EXPORT_COLUMNS: GarageCashflowExportColumnItem[] =
  [
    // 1. Thông tin chứng từ
    {
      key: "stt",
      defaultLabel: "STT",
      group: "general",
    },
    {
      key: "transDate",
      defaultLabel: "Ngày chứng từ",
      group: "general",
    },
    {
      key: "voucherCode",
      defaultLabel: "Mã phiếu",
      group: "general",
    },
    {
      key: "createdBy",
      defaultLabel: "Người tạo",
      group: "general",
    },
    {
      key: "updatedBy",
      defaultLabel: "Người cập nhật",
      group: "general",
    },
    {
      key: "createdAt",
      defaultLabel: "Ngày tạo",
      group: "general",
    },
    {
      key: "updatedAt",
      defaultLabel: "Ngày cập nhật",
      group: "general",
    },

    // 2. Phát sinh & Thanh toán
    {
      key: "thu",
      defaultLabel: "Tiền vào (Thu)",
      group: "amount",
    },
    {
      key: "chi",
      defaultLabel: "Tiền ra (Chi)",
      group: "amount",
    },
    {
      key: "paymentStatus",
      defaultLabel: "Trạng thái",
      group: "amount",
    },
    {
      key: "paymentMethod",
      defaultLabel: "Phương thức TT",
      group: "amount",
    },
    {
      key: "paymentContent",
      defaultLabel: "Nội dung TT",
      group: "amount",
    },

    // 3. Đối tác & Dịch vụ liên quan
    {
      key: "caseCode",
      defaultLabel: "Mã PDV",
      group: "related",
    },
    {
      key: "licensePlate",
      defaultLabel: "Biển số xe",
      group: "related",
    },
    {
      key: "partnerName",
      defaultLabel: "Đối tác",
      group: "related",
    },
    {
      key: "note",
      defaultLabel: "Ghi chú / Diễn giải",
      group: "related",
    },
  ];

export const DEFAULT_GARAGE_CASHFLOW_EXPORT_COLUMNS =
  ALL_GARAGE_CASHFLOW_EXPORT_COLUMNS.map((c) => c.key);
