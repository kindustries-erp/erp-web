import {
  DrawerSection,
  V2DrawerFieldGrid,
  V2DrawerRowList,
  type DrawerRowConfig,
  type V2DrawerFieldItem,
} from "@/v2/shared/components";
import {
  GoodsReceiptLinesTable,
  sumGoodsReceiptLineAmounts,
} from "@/v2/core/goods-receipts";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";
import {
  GOODS_RECEIPT_FIELD_META,
  GOODS_RECEIPT_ORDER_FIELD_KEYS,
} from "./GoodsReceiptFormSections.fields.config";
import { GOODS_RECEIPT_FIELD_RENDERERS } from "./GoodsReceiptFormSections.fields";
import type { FormSectionsProps } from "./GoodsReceiptFormSections.type";

export function GoodsReceiptFormSections(props: FormSectionsProps) {
  const { form, viewing, t, setField, hideLines = false, columns = 2 } = props;

  const handleLinesChange = (newLines: GoodsReceiptFormLine[]) => {
    setField("lines", newLines);
    setField("totalAmount", String(sumGoodsReceiptLineAmounts(newLines)));
  };

  const receiptRows: DrawerRowConfig[] = [
    {
      key: "receiptNo",
      label: t("v2.goodsReceipts.columns.receiptNo", "Số phiếu"),
      value: form.receiptNo || "—",
      copyable: Boolean(form.receiptNo),
    },
    {
      key: "receiptDate",
      label: t("v2.goodsReceipts.columns.receiptDate", "Ngày nhập"),
      value: form.receiptDate || "—",
    },
    ...(props.sourceOrder
      ? [
          {
            key: "sourceOrderId",
            label: t("v2.goodsReceipts.columns.sourceOrderId", "Đơn mua"),
            value: form.sourceOrderNo || "—",
            copyable: Boolean(form.sourceOrderNo),
          },
        ]
      : []),
    {
      key: "supplierName",
      label: t("v2.goodsReceipts.columns.supplierName", "Nhà cung cấp"),
      value: form.supplierName || "—",
    },
    {
      key: "totalAmount",
      label: t("v2.goodsReceipts.columns.totalAmount", "Tổng tiền"),
      value: Number(form.totalAmount || 0).toLocaleString("vi-VN") + " ₫",
    },
    ...(props.sourceOrder
      ? [
          {
            key: "sourceOrderTotal",
            label: t(
              "v2.goodsReceipts.columns.sourceOrderTotal",
              "Tổng tiền đơn mua",
            ),
            value: form.sourceOrderTotal
              ? Number(form.sourceOrderTotal).toLocaleString("vi-VN") + " ₫"
              : "—",
          },
        ]
      : []),
    {
      key: "branchName",
      label: t("v2.goodsReceipts.columns.branchName", "Chi nhánh"),
      value: form.branchName || "—",
    },
    {
      key: "remarks",
      label: t("v2.goodsReceipts.columns.remarks", "Ghi chú"),
      value: form.remarks || "—",
      multiline: true,
    },
  ];

  const fields: V2DrawerFieldItem[] = GOODS_RECEIPT_FIELD_META.filter(
    (meta) =>
      props.sourceOrder || !GOODS_RECEIPT_ORDER_FIELD_KEYS.has(meta.key),
  ).map((meta) => ({
    key: meta.key,
    label: t(meta.labelKey, meta.defaultLabel),
    required: meta.required,
    error: props.errorField === meta.key ? props.errorMessage : undefined,
    className: meta.className,
    render: () => GOODS_RECEIPT_FIELD_RENDERERS[meta.key]?.(props),
  }));

  return (
    <div className="space-y-4">
      <DrawerSection
        title={t("v2.goodsReceipts.form.identity", "Thông tin phiếu nhập")}
      >
        {viewing ? (
          <V2DrawerRowList rows={receiptRows} />
        ) : (
          <V2DrawerFieldGrid fields={fields} columns={columns} />
        )}
      </DrawerSection>

      {!hideLines && (
        <GoodsReceiptLinesTable
          lines={form.lines || []}
          viewing={viewing}
          t={t}
          onChangeLines={handleLinesChange}
        />
      )}
    </div>
  );
}
