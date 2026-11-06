import {
  DrawerSection,
  V2DrawerFieldGrid,
  type V2DrawerFieldItem,
} from "@/v2/shared/components";
import {
  GoodsReceiptLinesTable,
  sumGoodsReceiptLineAmounts,
} from "@/v2/core/goods-receipts";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";
import { GOODS_RECEIPT_FIELD_META } from "./GoodsReceiptFormSections.fields.config";
import { GOODS_RECEIPT_FIELD_RENDERERS } from "./GoodsReceiptFormSections.fields";
import type { FormSectionsProps } from "./GoodsReceiptFormSections.type";

export function GoodsReceiptFormSections(props: FormSectionsProps) {
  const { form, viewing, t, setField, hideLines = false, columns = 2 } = props;

  const handleLinesChange = (newLines: GoodsReceiptFormLine[]) => {
    setField("lines", newLines);
    setField("totalAmount", String(sumGoodsReceiptLineAmounts(newLines)));
  };

  const fields: V2DrawerFieldItem[] = GOODS_RECEIPT_FIELD_META.map((meta) => ({
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
        <V2DrawerFieldGrid fields={fields} columns={columns} />
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
