import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { type CreateErpInvoicePayload } from "../api/erpInvoicesCoreApi";
import { ErpInvoice } from "../api/erpInvoicesCoreApi";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { ErpInvoiceLinkedDocuments } from "./ErpInvoiceLinkedDocuments";
import { Button } from "@/shared/components/ui/Button";
import { Textarea } from "@/shared/components/ui/textarea";

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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
  hideAccountingSection = false,
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
  hideAccountingSection?: boolean;
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
          <DrawerField label="Phân loại hóa đơn">
            {editMode ? (
              <Combobox
                options={[]}
                value={(form as any).invoiceCategory || ""}
                onChange={(val) => fieldSet("invoiceCategory", val || null)}
                placeholder="-- Chọn phân loại --"
                allowClear={true}
              />
            ) : (
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent">
                {(form as any).invoiceCategory || "—"}
              </div>
            )}
          </DrawerField>
          <DrawerField label={t("notes", "Ghi chú")}>
            {editMode ? (
              <Textarea
                className="w-full text-sm"
                value={form.notes || ""}
                onChange={(e) => fieldSet("notes", e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={3}
              />
            ) : (
              <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 rounded-lg border border-transparent whitespace-pre-wrap">
                {form.notes || "—"}
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
              checked={
                editMode ? !!(form as any).isValid : !!detailInvoice.isValid
              }
              disabled={!editMode}
              onCheckedChange={async (val: boolean) => {
                if (editMode) {
                  fieldSet("isValid", val);
                } else {
                  try {
                    await erpInvoicesCoreApi.setValid(detailInvoice.id, val);
                    toast.success("Đã cập nhật trạng thái kiểm duyệt");
                    if (onRefreshDetail) onRefreshDetail();
                  } catch {
                    toast.error("Lỗi khi cập nhật trạng thái kiểm duyệt");
                  }
                }
              }}
            />
          </div>
        </DrawerSection>
      )}

      {pdfSlot && <div className="mt-0">{pdfSlot}</div>}

      {!editMode && !hideAccountingSection && (
        <DrawerSection title="HẠCH TOÁN KẾ TOÁN">
          <PostedAccountingSummary
            isPosted={detailInvoice?.postingStatus === "POSTED"}
            journalEntryId={detailInvoice?.journalEntryId}
            postingDate={detailInvoice?.postingDate}
          />
        </DrawerSection>
      )}
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
  hideLinkedDocuments = false,
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
  hideLinkedDocuments?: boolean;
}) {
  const { t } = useTranslation("erpInvoices");
  const isPosted = detailInvoice?.postingStatus === "POSTED" && !pendingUnpost;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const pdfKey =
    detailInvoice?.pdfFileKey ||
    (detailInvoice?.pdfFiles && detailInvoice.pdfFiles.length > 0
      ? detailInvoice.pdfFiles[0].key
      : null);

  useEffect(() => {
    if (pdfKey && detailInvoice?.id) {
      setIsPdfLoading(true);
      erpInvoicesCoreApi
        .getPdfDownloadUrl(detailInvoice.id, pdfKey, true)
        .then((res) => {
          setPdfUrl(res.url);
          setIsPdfLoading(false);
        })
        .catch(() => {
          setPdfUrl(null);
          setIsPdfLoading(false);
        });
    } else {
      setPdfUrl(null);
      setIsPdfLoading(false);
    }
  }, [pdfKey, detailInvoice?.id]);

  return (
    <div className="flex flex-col gap-6">
      {editMode && (
        <DrawerSection
          title={t("accountingSection", "HẠCH TOÁN KẾ TOÁN")}
          titleExtra={
            form.branchId ? (
              <Button
                type="button"
                variant={
                  (form as any).accountingEnabled ? "outline" : "primary"
                }
                size="sm"
                className="ml-4 h-8"
                onClick={() => {
                  fieldSet(
                    "accountingEnabled",
                    !(form as any).accountingEnabled,
                  );
                }}
              >
                {(form as any).accountingEnabled
                  ? "Hủy hạch toán"
                  : "Bật hạch toán"}
              </Button>
            ) : null
          }
        >
          <div className="space-y-4 pt-2">
            {!form.branchId ? (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch toán
                kế toán.
              </div>
            ) : null}

            <div
              className={`transition-all duration-300 ${
                (form as any).accountingEnabled
                  ? "opacity-100"
                  : "opacity-40 grayscale pointer-events-none"
              }`}
            >
              <PostingSection
                postingState={postingState}
                editMode={true}
                isPosted={isPosted}
                journalEntryId={detailInvoice?.journalEntryId}
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
                        id: createClientId(),
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
                        id: createClientId(),
                        accountId: findAccount("133"),
                        debit: vat,
                        credit: 0,
                        description: `Thuế GTGT ${detailInvoice?.invoiceNo || form.invoiceNo}`,
                      });
                    if (total > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("331"),
                        debit: 0,
                        credit: total,
                        description: baseDesc,
                      });
                  } else {
                    if (total > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("131"),
                        debit: total,
                        credit: 0,
                        description: baseDesc,
                      });
                    if (preVat > 0)
                      newLines.push({
                        id: createClientId(),
                        accountId: findAccount("511"),
                        debit: 0,
                        credit: preVat,
                        description: baseDesc,
                      });
                    if (vat > 0)
                      newLines.push({
                        id: createClientId(),
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
          </div>
        </DrawerSection>
      )}

      {!hideLinkedDocuments && detailInvoice?.id && (
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
      {!editMode && (pdfKey || invoicePreview) && (
        <div className="rounded-2xl mb-24">
          {isPdfLoading ? (
            <div className="w-full min-h-[800px] flex items-center justify-center bg-gray-100 animate-pulse">
              <div className="text-gray-400 font-medium">Đang tải PDF...</div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full min-h-[800px] border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="w-full">{invoicePreview}</div>
          )}
        </div>
      )}
    </div>
  );
}
