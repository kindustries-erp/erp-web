import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";
import { ErpInvoice } from "../api/erpInvoicesCoreApi";
import { useQuery } from "@tanstack/react-query";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { money } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { ErpInvoiceLinkedDocuments } from "./ErpInvoiceLinkedDocuments";

function TAccountDiagram({ journalEntryId }: { journalEntryId: string }) {
  const { data: journalEntry, isLoading } = useQuery({
    queryKey: ["journal-entry", journalEntryId],
    queryFn: () => accountingApi.getJournalEntryById(journalEntryId),
    enabled: !!journalEntryId,
  });

  if (isLoading)
    return <div className="text-xs text-gray-500">Đang tải sơ đồ...</div>;
  if (!journalEntry || !journalEntry.lines) return null;

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

export function ErpInvoiceInternalSidebar({
  form,
  editMode,
  fieldSet,
  invoiceId,
  pendingTagIds = [],
  onPendingTagsChange,
  direction,
  detailInvoice,
  pdfSlot,
  onRefreshDetail,
}: {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  invoiceId?: string | null;
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  pdfSlot?: React.ReactNode;
  onRefreshDetail?: () => void;
}) {
  const { t } = useTranslation("erpInvoices");
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    getBranchOptionsApi().then(setBranchOptions).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6">
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

      {pdfSlot && <div className="mt-2">{pdfSlot}</div>}

      {direction === "IN" && detailInvoice?.id && (
        <DrawerSection title="KIỂM DUYỆT HÓA ĐƠN">
          <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-md">
            <div>
              <div className="text-sm font-medium text-gray-800">
                Hóa đơn hợp lý, hợp lệ
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {detailInvoice.isValid ? (
                  <span className="text-green-600 font-medium">
                    Đã kiểm duyệt
                  </span>
                ) : (
                  <span>Chưa kiểm duyệt</span>
                )}
                {detailInvoice.validatedAt && (
                  <span className="ml-2 italic">
                    lúc{" "}
                    {new Date(detailInvoice.validatedAt).toLocaleString(
                      "vi-VN",
                    )}
                  </span>
                )}
              </div>
            </div>
            <Checkbox
              checked={!!detailInvoice.isValid}
              disabled={!editMode}
              onCheckedChange={async (val: boolean) => {
                try {
                  await erpInvoicesCoreApi.setValid(detailInvoice.id, val);
                  toast.success("Đã cập nhật trạng thái kiểm duyệt");
                  if (onRefreshDetail) onRefreshDetail();
                } catch {
                  toast.error("Lỗi khi cập nhật trạng thái kiểm duyệt");
                }
              }}
            />
          </div>
        </DrawerSection>
      )}

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

export function ErpInvoiceInternalMain({
  form,
  editMode,
  fieldSet,
  direction,
  detailInvoice,
  postingState,
  pendingUnpost,
  onUnpost,
  onRefreshDetail,
  invoicePreview,
}: {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  postingState: any;
  pendingUnpost: boolean;
  onUnpost?: () => void;
  onRefreshDetail?: () => void;
  invoicePreview?: React.ReactNode;
}) {
  const { t } = useTranslation("erpInvoices");
  const isPosted = detailInvoice?.postingStatus === "POSTED" && !pendingUnpost;

  return (
    <div className="flex flex-col gap-6">
      <DrawerSection title={t("accountingSection", "HẠCH TOÁN KẾ TOÁN")}>
        <div className="space-y-4 pt-2">
          {!detailInvoice?.branchId ? (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
              Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch toán kế
              toán.
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <Checkbox
                checked={isPosted || (form as any).accountingEnabled}
                disabled={isPosted || !editMode}
                onCheckedChange={(val: boolean) => {
                  fieldSet("accountingEnabled", val);
                  if (!val) {
                    postingState.reset();
                  }
                }}
              />
              <span className="text-sm font-medium text-slate-700">
                Nhập hạch toán kế toán cho hóa đơn này
              </span>
            </div>
          )}

          {isPosted || ((form as any).accountingEnabled && editMode) ? (
            <div
              className={`transition-opacity duration-300 ${isPosted ? "opacity-90 pointer-events-none" : "opacity-100"}`}
            >
              <PostingSection
                postingState={postingState}
                editMode={editMode && !isPosted}
                isPosted={isPosted}
                defaultDate={form.invoiceDate || ""}
                defaultDescription={
                  detailInvoice?.description ||
                  form.description ||
                  `Hạch toán hóa đơn ${form.invoiceNo || ""}`
                }
                onUnpost={() => {
                  if (onUnpost) {
                    onUnpost();
                    postingState.reset();
                  }
                }}
                getDefaultLines={(accountOptions) => {
                  const findAccount = (prefix: string) =>
                    accountOptions.find((a) =>
                      a.label.split(" - ")[0]?.startsWith(prefix),
                    )?.value || "";
                  const preVat =
                    Number(detailInvoice?.preVatAmount || form.preVatAmount) ||
                    0;
                  const vat =
                    Number(detailInvoice?.vatAmount || form.vatAmount) || 0;
                  const total =
                    Number(detailInvoice?.totalAmount || form.totalAmount) || 0;
                  const baseDesc =
                    detailInvoice?.description ||
                    `${t("postingDefaultDesc", "Hạch toán hóa đơn")} ${detailInvoice?.invoiceNo || form.invoiceNo}`;

                  const newLines = [];
                  if (direction === "IN") {
                    if (preVat > 0)
                      newLines.push({
                        id: crypto.randomUUID(),
                        accountId:
                          findAccount("642") ||
                          findAccount("152") ||
                          findAccount("156"),
                        debit: preVat,
                        credit: 0,
                        description: baseDesc,
                      });
                    if (vat > 0)
                      newLines.push({
                        id: crypto.randomUUID(),
                        accountId: findAccount("133"),
                        debit: vat,
                        credit: 0,
                        description: `Thuế GTGT ${detailInvoice?.invoiceNo || form.invoiceNo}`,
                      });
                    if (total > 0)
                      newLines.push({
                        id: crypto.randomUUID(),
                        accountId: findAccount("331"),
                        debit: 0,
                        credit: total,
                        description: baseDesc,
                      });
                  } else {
                    if (total > 0)
                      newLines.push({
                        id: crypto.randomUUID(),
                        accountId: findAccount("131"),
                        debit: total,
                        credit: 0,
                        description: baseDesc,
                      });
                    if (preVat > 0)
                      newLines.push({
                        id: crypto.randomUUID(),
                        accountId: findAccount("511"),
                        debit: 0,
                        credit: preVat,
                        description: baseDesc,
                      });
                    if (vat > 0)
                      newLines.push({
                        id: crypto.randomUUID(),
                        accountId: findAccount("333"),
                        debit: 0,
                        credit: vat,
                        description: `Thuế GTGT ${detailInvoice?.invoiceNo || form.invoiceNo}`,
                      });
                  }
                  return newLines;
                }}
              />
            </div>
          ) : !editMode ? null : (
            <div className="p-6 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-md">
              {t(
                "accountingDisabledHint",
                "Bật checkbox phía trên để nhập hạch toán kế toán",
              )}
            </div>
          )}
        </div>
      </DrawerSection>

      {detailInvoice?.id && (
        <ErpInvoiceLinkedDocuments
          form={form}
          fieldSet={fieldSet}
          invoiceId={detailInvoice.id}
          invoiceNo={detailInvoice.invoiceNo || form.invoiceNo}
          direction={direction}
          voucherNetOffs={detailInvoice.voucherNetOffs || []}
          editMode={editMode}
          onRefresh={onRefreshDetail || (() => {})}
        />
      )}

      {/* Invoice preview — rendered below linked docs in view mode */}
      {!editMode && invoicePreview && (
        <div className="bg-slate-50 rounded-lg overflow-hidden">
          {invoicePreview}
        </div>
      )}
    </div>
  );
}
