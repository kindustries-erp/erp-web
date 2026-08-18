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
import { Textarea } from "@/shared/components/ui/textarea";
import { FileText } from "lucide-react";

export function ErpInvoiceInternalSidebar({
  form,
  editMode,
  fieldSet,
  invoiceId,
  pendingTagIds = [],
  onPendingTagsChange,
  direction,
  detailInvoice,
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
    <div className="flex flex-col gap-4">
      <DrawerSection
        title={t("generalInfo", "THÔNG TIN CHUNG")}
        collapsible={true}
        defaultCollapsed={false}
      >
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

          <div className="pt-1">
            <div className="text-sm font-medium mb-1.5 text-gray-700">
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

          {direction === "IN" && detailInvoice?.id && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border border-border/60">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-foreground">
                    Hóa đơn hợp lý, hợp lệ
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {detailInvoice.isValid ? (
                      <span className="text-emerald-600 font-medium">
                        Đã kiểm duyệt
                      </span>
                    ) : (
                      <span>Chưa kiểm duyệt</span>
                    )}
                    {detailInvoice.validatedAt && (
                      <span className="ml-1 italic">
                        (
                        {new Date(detailInvoice.validatedAt).toLocaleDateString(
                          "vi-VN",
                        )}
                        )
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
                        await erpInvoicesCoreApi.setValid(
                          detailInvoice.id,
                          val,
                        );
                        toast.success("Đã cập nhật trạng thái kiểm duyệt");
                        if (onRefreshDetail) onRefreshDetail();
                      } catch {
                        toast.error("Lỗi khi cập nhật trạng thái kiểm duyệt");
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </DrawerSection>
    </div>
  );
}

export function ErpInvoiceInternalMain({
  detailInvoice,
  invoicePreview,
}: {
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  onRefreshDetail?: () => void;
  invoicePreview?: React.ReactNode;
  hideLinkedDocuments?: boolean;
}) {
  const { t } = useTranslation("erpInvoices");
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
    <div className="flex flex-col gap-4">
      {/* Invoice preview — ALWAYS rendered in both view and edit mode */}
      {(pdfKey || invoicePreview) && (
        <DrawerSection
          title={
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <FileText className="w-3.5 h-3.5 text-primary" />
              {t("previewInvoiceTitle", "Xem trước hóa đơn")}
            </span>
          }
          collapsible
          defaultCollapsed={false}
          fitViewportHeight
          peekRelatedDeck
        >
          <div className="w-full">
            {isPdfLoading ? (
              <div className="w-full min-h-[350px] flex items-center justify-center bg-muted/30 rounded-xl border border-border/60 animate-pulse">
                <div className="text-muted-foreground font-medium text-xs">
                  {t("loadingPdf", "Đang tải PDF...")}
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="rounded-xl overflow-hidden border border-border/60">
                <iframe
                  src={pdfUrl}
                  className="w-full min-h-[500px] border-0"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="w-full">{invoicePreview}</div>
            )}
          </div>
        </DrawerSection>
      )}
    </div>
  );
}
