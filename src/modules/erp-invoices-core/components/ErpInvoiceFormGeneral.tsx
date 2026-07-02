import {
  DrawerField,
  inputCls,
  DrawerSection,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { useTranslation } from "react-i18next";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";

interface Props {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  /** ID of an existing invoice (null when creating new) */
  invoiceId?: string | null;
}

export function ErpInvoiceFormGeneral({
  form,
  editMode,
  fieldSet,
  invoiceId,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const canEditCore = editMode && !invoiceId;

  return (
    <>
      <DrawerSection title="THÔNG TIN CHỨNG TỪ">
        <div className="space-y-4">
          <DrawerField label={t("invoiceDate", "Ngày HĐ")}>
            {canEditCore ? (
              <DatePicker
                value={form.invoiceDate || ""}
                onChange={(d) => fieldSet("invoiceDate", d)}
                placeholder="Chọn ngày"
                className="w-full"
              />
            ) : (
              <div>{form.invoiceDate || "—"}</div>
            )}
          </DrawerField>
          <DrawerField label={t("invoiceNo", "Số HĐ")}>
            {canEditCore ? (
              <input
                className={inputCls}
                value={form.invoiceNo}
                onChange={(e) => fieldSet("invoiceNo", e.target.value)}
              />
            ) : (
              <div className="font-medium">{form.invoiceNo || "—"}</div>
            )}
          </DrawerField>
          <DrawerField label={t("serialNo", "Ký hiệu")}>
            {canEditCore ? (
              <input
                className={inputCls}
                value={form.serialNo || ""}
                onChange={(e) => fieldSet("serialNo", e.target.value)}
              />
            ) : (
              <div>{form.serialNo || "—"}</div>
            )}
          </DrawerField>
          {!editMode &&
            (form as CreateErpInvoicePayload & { invoiceType?: string })
              .invoiceType && (
              <DrawerField label={t("invoiceType", "Loại hóa đơn")}>
                <div className="text-sm text-muted-foreground">
                  {
                    (form as CreateErpInvoicePayload & { invoiceType?: string })
                      .invoiceType
                  }
                </div>
              </DrawerField>
            )}
        </div>
      </DrawerSection>

      <DrawerSection
        title={
          form.direction === "IN"
            ? t("sellerInfo", "Bên bán")
            : t("buyerInfo", "Bên mua")
        }
      >
        <div className="space-y-4">
          <DrawerField label="Tên Đơn vị">
            {canEditCore ? (
              <input
                className={inputCls}
                value={
                  form.direction === "IN"
                    ? form.sellerName || ""
                    : form.buyerName || ""
                }
                onChange={(e) =>
                  fieldSet(
                    form.direction === "IN" ? "sellerName" : "buyerName",
                    e.target.value,
                  )
                }
              />
            ) : (
              <div>
                {form.direction === "IN"
                  ? form.sellerName || "—"
                  : form.buyerName || "—"}
              </div>
            )}
          </DrawerField>
          <DrawerField label={t("taxCode", "MST")}>
            {canEditCore ? (
              <input
                className={inputCls}
                value={
                  form.direction === "IN"
                    ? form.sellerTaxCode || ""
                    : form.buyerTaxCode || ""
                }
                onChange={(e) =>
                  fieldSet(
                    form.direction === "IN" ? "sellerTaxCode" : "buyerTaxCode",
                    e.target.value,
                  )
                }
              />
            ) : (
              <div>
                {form.direction === "IN"
                  ? form.sellerTaxCode || "—"
                  : form.buyerTaxCode || "—"}
              </div>
            )}
          </DrawerField>
          <DrawerField label="Địa chỉ">
            {canEditCore ? (
              <input
                className={inputCls}
                value={
                  form.direction === "IN"
                    ? form.sellerAddress || ""
                    : form.buyerAddress || ""
                }
                onChange={(e) =>
                  fieldSet(
                    form.direction === "IN" ? "sellerAddress" : "buyerAddress",
                    e.target.value,
                  )
                }
              />
            ) : (
              <div className="text-muted-foreground">
                {form.direction === "IN"
                  ? form.sellerAddress || "—"
                  : form.buyerAddress || "—"}
              </div>
            )}
          </DrawerField>
        </div>
      </DrawerSection>
    </>
  );
}
