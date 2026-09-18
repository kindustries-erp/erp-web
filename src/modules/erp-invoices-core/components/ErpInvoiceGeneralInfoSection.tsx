import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Calendar, FileText } from "lucide-react";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { CopyButton } from "@/shared/components/CopyButton";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import { formatGMT7 } from "@/shared/utils/format";
import {
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "../api/erpInvoicesCoreApi";
import { RelatedInvoiceSidebarSection } from "./RelatedInvoiceSidebarSection";
import { BufferedTextarea } from "@/shared/components/BufferedTextarea";

export interface ErpInvoiceGeneralInfoSectionProps {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  invoiceId?: string | null;
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  defaultCollapsed?: boolean;
  className?: string;
  showTags?: boolean;
  showRelatedInvoices?: boolean;
}

export const ErpInvoiceGeneralInfoSection = React.memo(
  function ErpInvoiceGeneralInfoSection({
    invoice,
    form,
    editMode = false,
    fieldSet,
    direction = "IN",
    invoiceId,
    pendingTagIds = [],
    onPendingTagsChange,
    defaultCollapsed = false,
    className = "space-y-3 text-sm",
    showTags = true,
    showRelatedInvoices = true,
  }: ErpInvoiceGeneralInfoSectionProps) {
    const { t } = useTranslation("erpInvoices");

    const effectiveDirection = direction || invoice?.direction || "IN";
    const isInvoiceIn = effectiveDirection === "IN";

    const { data: branchOptions = [] } = useQuery({
      queryKey: ["branches-options"],
      queryFn: getBranchOptionsApi,
      staleTime: 5 * 60 * 1000,
    });

    const partnerName = (
      isInvoiceIn
        ? invoice?.sellerName || form?.sellerName
        : invoice?.buyerName ||
          form?.buyerName ||
          (invoice as any)?.buyerPersonalName
    )?.trim();

    const branchId =
      form?.branchId || invoice?.branchId || (invoice as any)?.branch?.id || "";
    const branchObj = (invoice as any)?.branch;
    const matchedOption = branchOptions.find((o) => o.value === branchId);

    const branchLabel = useMemo(() => {
      if (branchObj?.name) return branchObj.name;
      if (branchObj?.branchName) return branchObj.branchName;
      if (matchedOption?.label) {
        return matchedOption.label.split(" — ")[1] || matchedOption.label;
      }
      if (branchId && !branchId.includes("-")) {
        return branchId;
      }
      return "—";
    }, [branchObj, matchedOption, branchId]);

    const invoiceDate = invoice?.invoiceDate || form?.invoiceDate || "";
    const notes = (
      form?.notes ||
      form?.description ||
      invoice?.description ||
      invoice?.notes ||
      ""
    )?.trim();
    const invoiceNo = invoice?.invoiceNo || form?.invoiceNo || "";
    const effectiveInvoiceId = invoiceId ?? invoice?.id ?? null;

    if (editMode) {
      return (
        <DrawerSection
          title={t("generalInfo", "THÔNG TIN CHUNG")}
          titleExtra={
            invoiceNo ? (
              <span className="text-[10px] font-mono text-muted-foreground">
                #{invoiceNo}
              </span>
            ) : undefined
          }
          collapsible={true}
          defaultCollapsed={defaultCollapsed}
        >
          <div className="space-y-4">
            {/* Đối tác (Thông tin xem kèm nút Copy) */}
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                {isInvoiceIn
                  ? t("seller", "Nhà cung cấp")
                  : t("buyer", "Khách hàng")}
              </div>
              {partnerName ? (
                <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-sm">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                    <span className="break-words">{partnerName}</span>
                  </div>
                  <CopyButton
                    value={partnerName}
                    tooltip={t("copyName", "Copy tên")}
                    copiedTooltip={t("copied", "Đã copy")}
                    toastMessage={t("copiedName", "Đã copy tên đối tác")}
                    toastId="invoice-partner-name-copy"
                    className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  />
                </div>
              ) : (
                <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                  <span>—</span>
                </div>
              )}
            </div>

            {/* Chi nhánh */}
            <DrawerField label={t("branchId", "Chi nhánh")}>
              <Combobox
                options={branchOptions}
                value={form?.branchId || ""}
                onChange={(val) => fieldSet?.("branchId", val)}
                placeholder="-- Chọn chi nhánh --"
                allowClear={false}
              />
            </DrawerField>

            {/* Ghi chú */}
            <DrawerField label={t("notes", "Ghi chú")}>
              <BufferedTextarea
                className="w-full text-sm"
                value={form?.notes || form?.description || ""}
                onChange={(val) => {
                  fieldSet?.("notes", val);
                  fieldSet?.("description", val);
                }}
                placeholder="Nhập ghi chú..."
                rows={3}
              />
            </DrawerField>

            {/* Thẻ nhãn */}
            {showTags && (
              <div className="pt-1">
                <div className="text-sm font-medium mb-1.5 text-gray-700">
                  {t("tags", "Thẻ nhãn")}
                </div>
                {effectiveInvoiceId ? (
                  <EntityTagSelector
                    entityType="erp_invoice"
                    entityId={effectiveInvoiceId}
                    readOnly={false}
                  />
                ) : (
                  <EntityTagSelector
                    entityType="erp_invoice"
                    entityId="__pending__"
                    readOnly={false}
                    pendingMode
                    pendingTagIds={pendingTagIds}
                    onPendingChange={onPendingTagsChange}
                  />
                )}
              </div>
            )}

            {/* Hóa đơn liên quan */}
            {showRelatedInvoices && (
              <RelatedInvoiceSidebarSection
                invoice={invoice}
                direction={effectiveDirection}
              />
            )}
          </div>
        </DrawerSection>
      );
    }

    return (
      <DrawerSection
        title={t("generalInfo", "THÔNG TIN CHUNG")}
        titleExtra={
          invoiceNo ? (
            <span className="text-[10px] font-mono text-muted-foreground">
              #{invoiceNo}
            </span>
          ) : undefined
        }
        collapsible={true}
        defaultCollapsed={defaultCollapsed}
      >
        <div className={className}>
          {/* Đối tác */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {isInvoiceIn
                ? t("seller", "Nhà cung cấp")
                : t("buyer", "Khách hàng")}
            </div>
            {partnerName ? (
              <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-sm">
                <div className="flex items-start gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span className="break-words">{partnerName}</span>
                </div>
                <CopyButton
                  value={partnerName}
                  tooltip={t("copyName", "Copy tên")}
                  copiedTooltip={t("copied", "Đã copy")}
                  toastMessage={t("copiedName", "Đã copy tên đối tác")}
                  toastId="invoice-partner-name-copy"
                  className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                />
              </div>
            ) : (
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* Chi nhánh */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("branch", "Chi nhánh")}
            </div>
            <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{branchLabel}</span>
            </div>
          </div>

          {/* Ngày hóa đơn */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("invoiceDate", "Ngày hóa đơn")}
            </div>
            <div className="flex items-start gap-1.5 font-medium text-foreground text-sm">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{formatGMT7(invoiceDate, "date") || "—"}</span>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("notes", "Ghi chú")}
            </div>
            {notes ? (
              <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span className="whitespace-pre-wrap">{notes}</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-sm">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* Thẻ nhãn */}
          {showTags && effectiveInvoiceId && (
            <div className="pt-1 border-t border-border/50">
              <div className="text-xs text-muted-foreground mb-1.5">
                {t("tags", "Thẻ nhãn")}
              </div>
              <EntityTagSelector
                entityType="erp_invoice"
                entityId={effectiveInvoiceId}
                readOnly={true}
              />
            </div>
          )}

          {/* Hóa đơn liên quan */}
          {showRelatedInvoices && (
            <RelatedInvoiceSidebarSection
              invoice={invoice}
              direction={effectiveDirection}
            />
          )}
        </div>
      </DrawerSection>
    );
  },
);
