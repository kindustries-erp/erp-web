import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";

import { useTranslation } from "react-i18next";

import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";

interface Props {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  fmtAmt: (val: string | null | undefined) => string;
}

export function ErpInvoiceFormGeneral({
  form,
  editMode,
  fieldSet,
  fmtAmt,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="w-full xl:w-[400px] shrink-0 order-1 xl:order-2 space-y-4">
      <DrawerSection title={t("generalInfo", "Thông tin chung")}>
        <DrawerField label={t("invoiceNo", "Số HĐ")}>
          {editMode ? (
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
          {editMode ? (
            <input
              className={inputCls}
              value={form.serialNo || ""}
              onChange={(e) => fieldSet("serialNo", e.target.value)}
            />
          ) : (
            <div>{form.serialNo || "—"}</div>
          )}
        </DrawerField>
        <DrawerField label={t("invoiceDate", "Ngày HĐ")}>
          {editMode ? (
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
        <DrawerField label={t("description", "Diễn giải")}>
          {editMode ? (
            <input
              className={inputCls}
              value={form.description || ""}
              onChange={(e) => fieldSet("description", e.target.value)}
            />
          ) : (
            <div>{form.description || "—"}</div>
          )}
        </DrawerField>
      </DrawerSection>

      <DrawerSection
        title={
          form.direction === "IN"
            ? t("sellerInfo", "Bên bán")
            : t("buyerInfo", "Bên mua")
        }
      >
        <DrawerField label="Tên Đơn vị">
          {editMode ? (
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
          {editMode ? (
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
          {editMode ? (
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
      </DrawerSection>

      <DrawerSection title={t("taxTotalInfo", "Thuế & Tổng tiền")}>
        <DrawerField label={t("preVatAmount", "Trước VAT")}>
          {editMode ? (
            <input
              type="number"
              className={inputCls}
              value={form.preVatAmount || ""}
              onChange={(e) => fieldSet("preVatAmount", Number(e.target.value))}
            />
          ) : (
            <div>{fmtAmt(String(form.preVatAmount || 0))}</div>
          )}
        </DrawerField>
        <DrawerField label={t("vatAmount", "Thuế VAT")}>
          {editMode ? (
            <input
              type="number"
              className={inputCls}
              value={form.vatAmount || ""}
              onChange={(e) => fieldSet("vatAmount", Number(e.target.value))}
            />
          ) : (
            <div>{fmtAmt(String(form.vatAmount || 0))}</div>
          )}
        </DrawerField>
        <DrawerField label={t("totalAmount", "Tổng tiền")}>
          {editMode ? (
            <input
              type="number"
              className={`${inputCls} font-bold text-primary`}
              value={form.totalAmount || ""}
              onChange={(e) => fieldSet("totalAmount", Number(e.target.value))}
            />
          ) : (
            <div className="font-semibold text-primary text-base">
              {fmtAmt(String(form.totalAmount || 0))}
            </div>
          )}
        </DrawerField>
      </DrawerSection>
    </div>
  );
}
