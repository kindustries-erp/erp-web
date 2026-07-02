import {
  DrawerField,
  inputCls,
  DrawerSection,
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
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";

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
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    getBranchOptionsApi().then(setBranchOptions).catch(console.error);
  }, []);

  useEffect(() => {
    if (!editMode && form.invoiceNo && form.direction === "IN") {
      setLoadingPos(true);
      purchaseOrdersCoreApi
        .list({ search: form.invoiceNo })
        .then((res) => {
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
