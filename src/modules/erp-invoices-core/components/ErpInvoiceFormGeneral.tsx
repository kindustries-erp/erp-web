import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";

interface Props {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  fmtAmt: (val: string | null | undefined) => string;
  /** ID of an existing invoice (null when creating new) */
  invoiceId?: string | null;
  /** Pending tag IDs for new-create Option B flow */
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
}

export function ErpInvoiceFormGeneral({
  form,
  editMode,
  fieldSet,
  fmtAmt,
  invoiceId,
  pendingTagIds = [],
  onPendingTagsChange,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const [relatedPos, setRelatedPos] = useState<ErpPurchaseOrder[]>([]);
  const [loadingPos, setLoadingPos] = useState(false);

  useEffect(() => {
    if (!editMode && form.invoiceNo && form.direction === "IN") {
      setLoadingPos(true);
      purchaseOrdersCoreApi
        .list({ search: form.invoiceNo })
        .then((res) => {
          // Filter to those actually containing the exact invoice no in supplierInvoiceNo
          // since search matches poNo OR supplierInvoiceNo generally
          const exactMatches = res.items.filter(
            (po) =>
              po.supplierInvoiceNo &&
              po.supplierInvoiceNo
                .split(",")
                .map((s) => s.trim())
                .includes(form.invoiceNo),
          );
          setRelatedPos(exactMatches);
        })
        .catch(() => setRelatedPos([]))
        .finally(() => setLoadingPos(false));
    } else {
      setRelatedPos([]);
    }
  }, [editMode, form.invoiceNo, form.direction]);

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

      <DrawerSection title={t("relatedDocs", "Chứng từ liên quan")}>
        <DrawerField label="Chứng từ thanh toán">
          {editMode ? (
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Nhập số phiếu thu/chi (cách nhau dấu phẩy)"
                value={form.paymentDocumentNos || ""}
                onChange={(e) => fieldSet("paymentDocumentNos", e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 flex-shrink-0"
                onClick={() =>
                  alert("Tính năng tạo phiếu thu/chi đang được phát triển.")
                }
              >
                + Tạo nhanh
              </button>
            </div>
          ) : (
            <div>{form.paymentDocumentNos || "—"}</div>
          )}
        </DrawerField>

        {!editMode && form.direction === "IN" && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Đơn mua hàng (PO)</div>
            <div className="flex flex-col gap-2">
              {loadingPos ? (
                <div className="text-sm text-muted-foreground">
                  {t("loading", "Đang tải...")}
                </div>
              ) : relatedPos.length > 0 ? (
                relatedPos.map((po) => (
                  <div
                    key={po.id}
                    className="text-sm p-3 border rounded-md bg-slate-50 flex flex-col gap-1"
                  >
                    <div className="font-semibold text-primary">{po.poNo}</div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>
                        {t("status", "Trạng thái")}: {po.status}
                      </span>
                      <span>{po.orderDate.slice(0, 10)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("noRelatedDocs", "Không có đơn mua hàng liên quan")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        <DrawerSection title={t("tags", "Thẻ nhãn")}>
          {invoiceId ? (
            <EntityTagSelector
              entityType="erp_invoice"
              entityId={invoiceId}
              readOnly={!editMode}
            />
          ) : editMode ? (
            <EntityTagSelector
              entityType="erp_invoice"
              entityId="__pending__"
              readOnly={false}
              pendingMode
              pendingTagIds={pendingTagIds}
              onPendingChange={onPendingTagsChange}
            />
          ) : null}
        </DrawerSection>
      </DrawerSection>
    </div>
  );
}
