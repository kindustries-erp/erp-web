import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import type { GarageGoodsReceiptFormLine } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import {
  GARAGE_RECEIPT_FORM_FIELDS,
  type FormSectionsProps,
} from "./GarageGoodsReceiptFormSections.fields";
import { GarageGoodsReceiptLinesTable } from "./GarageGoodsReceiptLinesTable";

export function GarageGoodsReceiptFormSections(props: FormSectionsProps) {
  const { form, viewing, t, setField, hideLines = false, columns = 2 } = props;

  const handleLinesChange = (newLines: GarageGoodsReceiptFormLine[]) => {
    setField("lines", newLines);
    const sum = newLines.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
    setField("totalAmount", String(sum));
  };

  const gridClass =
    columns === 1 ? "grid gap-3 grid-cols-1" : "grid gap-3 sm:grid-cols-2";

  return (
    <div className="space-y-4">
      <DrawerSection
        title={t(
          "v2.garageGoodsReceipts.form.identity",
          "Thông tin phiếu nhập",
        )}
      >
        <div className={gridClass}>
          {GARAGE_RECEIPT_FORM_FIELDS.map((cfg) => (
            <DrawerField
              key={cfg.key}
              label={t(cfg.labelKey, cfg.defaultLabel)}
              required={cfg.required}
              error={
                props.errorField === cfg.key ? props.errorMessage : undefined
              }
              className={columns === 1 ? undefined : cfg.className}
            >
              {cfg.render(props)}
            </DrawerField>
          ))}
        </div>
      </DrawerSection>

      {!hideLines && (
        <GarageGoodsReceiptLinesTable
          lines={form.lines || []}
          viewing={viewing}
          t={t}
          onChangeLines={handleLinesChange}
        />
      )}
    </div>
  );
}
