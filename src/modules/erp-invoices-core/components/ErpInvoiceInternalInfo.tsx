import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";
import { ErpInvoiceNetOffSection } from "./ErpInvoiceNetOffSection";
import { ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  invoiceId?: string | null;
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  onRefreshDetail: () => void;
}

export function ErpInvoiceInternalInfo({
  form,
  editMode,
  fieldSet,
  invoiceId,
  pendingTagIds = [],
  onPendingTagsChange,
  direction,
  detailInvoice,
  onRefreshDetail,
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
    if (!editMode && form.invoiceNo && direction === "IN") {
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
  }, [editMode, form.invoiceNo, direction]);

  return (
    <DrawerSection title="THÔNG TIN QUẢN LÝ NỘI BỘ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Branch & Tags (col-span-1) */}
        <div className="col-span-1 space-y-4">
          <DrawerField label={t("branchId", "Chi nhánh")}>
            {editMode ? (
              <Combobox
                options={branchOptions}
                value={form.branchId || ""}
                onChange={(val) => fieldSet("branchId", val)}
                placeholder="-- Chọn chi nhánh --"
              />
            ) : (
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {branchOptions.find((o) => o.value === form.branchId)?.label ||
                  "—"}
              </div>
            )}
          </DrawerField>

          {/* Tags */}
          <div className="pt-2">
            <div className="text-sm font-medium mb-2 text-gray-700">
              {t("tags", "Thẻ nhãn")}
            </div>
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
          </div>
        </div>

        {/* Column 2: Net-off & POs (col-span-2) */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          {/* Related POs */}
          {!editMode && direction === "IN" && (
            <div>
              <div className="text-sm font-medium mb-2 text-gray-700">
                Đơn mua hàng (PO)
              </div>
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
                      <div className="font-semibold text-primary">
                        {po.poNo}
                      </div>
                      <div className="text-muted-foreground flex justify-between">
                        <span>
                          {t("status", "Trạng thái")}: {po.status}
                        </span>
                        <span>{po.orderDate.slice(0, 10)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-md border border-dashed">
                    {t("noRelatedDocs", "Không có đơn mua hàng liên quan")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Net-off Vouchers directly inside this section for cohesion */}
          {detailInvoice?.id && (
            <div className="pt-1">
              <ErpInvoiceNetOffSection
                invoiceId={detailInvoice.id}
                direction={direction}
                voucherNetOffs={detailInvoice.voucherNetOffs || []}
                editMode={editMode}
                onRefresh={onRefreshDetail}
              />
            </div>
          )}
        </div>
      </div>
    </DrawerSection>
  );
}
