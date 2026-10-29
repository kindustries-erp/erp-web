export interface VinfastStockExportColumnConfig {
  /** Trùng key cột trong backend `VINFAST_STOCK_*_COLUMNS` */
  key: string;
  labelKey: string;
}

export interface VinfastStockExportColumnGroupConfig {
  key: string;
  labelKey: string;
  columns: VinfastStockExportColumnConfig[];
}

const COLUMN_LABEL = (key: string) => `v2.vinfastParts.export.columns.${key}`;

export const VINFAST_STOCK_EXPORT_COLUMN_GROUPS: VinfastStockExportColumnGroupConfig[] =
  [
    {
      key: "summary",
      labelKey: "v2.vinfastParts.export.groups.summary",
      columns: [
        "stt",
        "sku",
        "name",
        "uom",
        "vehicleType",
        "qtyOpening",
        "qtyIn",
        "qtyOut",
        "qtyBalance",
      ].map((key) => ({ key, labelKey: COLUMN_LABEL(key) })),
    },
    {
      key: "ledger",
      labelKey: "v2.vinfastParts.export.groups.ledger",
      columns: [
        "partSku",
        "partName",
        "vehicleType",
        "transactionDate",
        "direction",
        "qty",
        "unitCost",
        "amount",
        "licensePlate",
        "runningBalanceQty",
        "runningBalanceValue",
      ].map((key) => ({ key, labelKey: COLUMN_LABEL(key) })),
    },
    {
      key: "invoice",
      labelKey: "v2.vinfastParts.export.groups.invoice",
      columns: [
        "invoiceBranchName",
        "invoiceDate",
        "invoiceNo",
        "invoiceSerial",
        "invoiceTaxCode",
        "invoicePartner",
        "invoiceItemName",
        "invoiceItemQty",
        "invoiceItemUnitPrice",
        "invoiceItemVatRate",
        "invoiceItemTotalAmount",
      ].map((key) => ({ key, labelKey: COLUMN_LABEL(key) })),
    },
  ];

/** Mặc định chọn đủ cột, khớp hành vi xuất hiện tại */
export const VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS =
  VINFAST_STOCK_EXPORT_COLUMN_GROUPS.flatMap((group) =>
    group.columns.map((column) => column.key),
  );
