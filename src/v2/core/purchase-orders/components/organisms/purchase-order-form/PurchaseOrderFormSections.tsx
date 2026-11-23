import { DrawerField, DrawerSection } from "@/v2/shared/components";
import { PURCHASE_ORDER_FIELD_META } from "./PurchaseOrderFormSections.fields.config";
import { PURCHASE_ORDER_FIELD_RENDERERS } from "./PurchaseOrderFormSections.fields";
import type { PurchaseOrderFormSectionsProps } from "./PurchaseOrderFormSections.type";
import "../../../purchaseOrders.locale";

/** Phần thông tin đơn mua hàng (cột phải của drawer); dòng hàng nằm ở cột trái */
export function PurchaseOrderFormSections(
  props: PurchaseOrderFormSectionsProps,
) {
  const { t } = props;
  return (
    <DrawerSection
      title={t("v2.purchaseOrders.form.identity", "Thông tin đơn mua hàng")}
    >
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {PURCHASE_ORDER_FIELD_META.map((meta) => (
          <DrawerField
            key={meta.key}
            label={t(meta.labelKey, meta.defaultLabel)}
            required={meta.required}
            error={
              props.errorField === meta.key ? props.errorMessage : undefined
            }
            className={meta.className}
          >
            {PURCHASE_ORDER_FIELD_RENDERERS[meta.key]?.(props)}
          </DrawerField>
        ))}
      </div>
    </DrawerSection>
  );
}
