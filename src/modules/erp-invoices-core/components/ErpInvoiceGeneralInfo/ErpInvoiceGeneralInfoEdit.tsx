import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, CreditCard } from "lucide-react";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { CopyButton } from "@/shared/components/CopyButton";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { BufferedTextarea } from "@/shared/components/BufferedTextarea";
import { Input } from "@/shared/components/ui/input";
import { RelatedInvoiceSidebarSection } from "../RelatedInvoiceSidebarSection";
import type { ErpInvoiceGeneralInfoSectionProps } from "./types";

interface ErpInvoiceGeneralInfoEditProps extends ErpInvoiceGeneralInfoSectionProps {
  partnerName?: string;
  partnerTaxCode?: string;
  branchOptions: Array<{ label: string; value: string }>;
  effectiveInvoiceId: string | null;
  effectiveDirection: "IN" | "OUT";
  invoiceNo: string;
}

export const ErpInvoiceGeneralInfoEdit = React.memo(
  function ErpInvoiceGeneralInfoEdit({
    invoice,
    form,
    fieldSet,
    invoiceNo,
    partnerName,
    partnerTaxCode,
    branchOptions,
    effectiveInvoiceId,
    effectiveDirection,
    pendingTagIds,
    onPendingTagsChange,
    defaultCollapsed = false,
    showTags = true,
    showRelatedInvoices = true,
  }: ErpInvoiceGeneralInfoEditProps) {
    const { t } = useTranslation("erpInvoices");
    const isInvoiceIn = effectiveDirection === "IN";

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
        <div className="space-y-3.5">
          {/* 1. Số hóa đơn & Ký hiệu */}
          <div className="grid grid-cols-2 gap-2">
            <DrawerField label={t("invoiceNo", "Số hóa đơn")}>
              <Input
                className="h-8 text-xs font-mono"
                value={form?.invoiceNo || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  fieldSet?.("invoiceNo", e.target.value)
                }
                placeholder={t("invoiceNo", "Số hóa đơn")}
              />
            </DrawerField>
            <DrawerField label={t("serialNo", "Ký hiệu")}>
              <Input
                className="h-8 text-xs font-mono"
                value={form?.serialNo || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  fieldSet?.("serialNo", e.target.value)
                }
                placeholder={t("serialNo", "Ký hiệu")}
              />
            </DrawerField>
          </div>

          {/* 2. Đối tác */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {isInvoiceIn
                ? t("seller", "Nhà cung cấp")
                : t("buyer", "Khách hàng")}
            </div>
            {partnerName ? (
              <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-xs">
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
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-xs">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* 3. Mã số thuế đối tác */}
          {partnerTaxCode && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span>{t("taxCode", "Mã số thuế")}:</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-medium text-foreground">
                <span>{partnerTaxCode}</span>
                <CopyButton
                  value={partnerTaxCode}
                  tooltip={t("copyTax", "Copy MST")}
                  copiedTooltip={t("copied", "Đã copy")}
                  toastMessage={t("copiedTax", "Đã copy MST")}
                  toastId="invoice-partner-tax-copy"
                  className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                />
              </div>
            </div>
          )}

          {/* 4. Chi nhánh */}
          <DrawerField label={t("branchId", "Chi nhánh")}>
            <Combobox
              options={branchOptions}
              value={form?.branchId || ""}
              onChange={(val) => fieldSet?.("branchId", val)}
              placeholder="-- Chọn chi nhánh --"
              allowClear={false}
            />
          </DrawerField>

          {/* 5. Ghi chú */}
          <DrawerField label={t("notes", "Ghi chú")}>
            <BufferedTextarea
              className="w-full text-xs"
              value={form?.notes || form?.description || ""}
              onChange={(val) => {
                fieldSet?.("notes", val);
                fieldSet?.("description", val);
              }}
              placeholder={t("notesPlaceholder", "Nhập ghi chú...")}
              rows={3}
            />
          </DrawerField>

          {/* 6. Thẻ nhãn */}
          {showTags && (
            <div className="pt-1 border-t border-border/50">
              <div className="text-xs font-medium mb-1.5 text-muted-foreground">
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

          {/* 7. Hóa đơn liên quan */}
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
