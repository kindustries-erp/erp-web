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
import { useQuery } from "@tanstack/react-query";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { money } from "@/shared/utils/format";

function TAccountDiagram({ journalEntryId }: { journalEntryId: string }) {
  const { data: journalEntry, isLoading } = useQuery({
    queryKey: ["journal-entry", journalEntryId],
    queryFn: () => accountingApi.getJournalEntryById(journalEntryId),
    enabled: !!journalEntryId,
  });

  if (isLoading)
    return <div className="text-xs text-gray-500">Đang tải sơ đồ...</div>;
  if (!journalEntry || !journalEntry.lines) return null;

  // Group lines by account and sum the amounts
  const accounts: Record<
    string,
    { accountCode: string; accountName: string; debit: number; credit: number }
  > = {};

  journalEntry.lines.forEach((line: any) => {
    if (!line.account) return;
    const ac = line.account.accountCode;
    if (!accounts[ac]) {
      accounts[ac] = {
        accountCode: ac,
        accountName: line.account.accountName,
        debit: 0,
        credit: 0,
      };
    }
    if (Number(line.debit) > 0) accounts[ac].debit += Number(line.debit);
    if (Number(line.credit) > 0) accounts[ac].credit += Number(line.credit);
  });

  return (
    <div className="mt-3 flex flex-wrap gap-4">
      {Object.values(accounts).map((acc) => (
        <div
          key={acc.accountCode}
          className="flex flex-col text-xs border border-gray-300 rounded-md overflow-hidden min-w-[140px] bg-white"
        >
          <div
            className="bg-gray-100 text-center py-1 font-bold border-b border-gray-300 text-gray-800 px-2"
            title={acc.accountName}
          >
            {acc.accountCode}
          </div>
          <div className="flex">
            <div className="flex-1 border-r border-gray-300 px-2 py-1 min-h-[40px]">
              <div className="text-[10px] text-gray-400 text-center font-medium mb-1 border-b border-gray-200">
                NỢ
              </div>
              {acc.debit > 0 && (
                <div className="text-right text-gray-700 tabular-nums">
                  {money(acc.debit)}
                </div>
              )}
            </div>
            <div className="flex-1 px-2 py-1 min-h-[40px]">
              <div className="text-[10px] text-gray-400 text-center font-medium mb-1 border-b border-gray-200">
                CÓ
              </div>
              {acc.credit > 0 && (
                <div className="text-right text-gray-700 tabular-nums">
                  {money(acc.credit)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="flex flex-col gap-6">
      {/* Group 1: Thông tin chung */}
      <DrawerSection title="THÔNG TIN CHUNG">
        <div className="space-y-4">
          <DrawerField label={t("branchId", "Chi nhánh")}>
            {editMode ? (
              <Combobox
                options={branchOptions}
                value={form.branchId || ""}
                onChange={(val) => fieldSet("branchId", val)}
                placeholder="-- Chọn chi nhánh --"
                allowClear={false}
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
      </DrawerSection>

      {/* Group 2: Chứng từ liên kết */}
      <DrawerSection title="CHỨNG TỪ LIÊN KẾT">
        <div className="space-y-4">
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
      </DrawerSection>

      {/* Group 3: Hạch toán kế toán */}
      <DrawerSection title="HẠCH TOÁN KẾ TOÁN">
        <div className="space-y-4">
          <div className="pt-2">
            <div className="text-sm font-medium mb-2 text-gray-700">
              Trạng thái hạch toán
            </div>
            {detailInvoice?.postingStatus === "POSTED" ? (
              <div className="flex flex-col gap-1">
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 w-max">
                  ĐÃ HẠCH TOÁN
                </span>
                {detailInvoice.postingDate && (
                  <span className="text-xs text-gray-500">
                    Ngày: {detailInvoice.postingDate.slice(0, 10)}
                  </span>
                )}
                {detailInvoice.journalEntryId && (
                  <TAccountDiagram
                    journalEntryId={detailInvoice.journalEntryId}
                  />
                )}
              </div>
            ) : (
              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600 w-max">
                CHƯA HẠCH TOÁN
              </span>
            )}
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}
