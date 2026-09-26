import React from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Calendar, FileText } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";
import { formatGMT7 } from "@/shared/utils/format";
import { RelatedInvoiceSidebarSection } from "../RelatedInvoiceSidebarSection";
import type { ErpInvoiceGeneralInfoSectionProps } from "./types";
import {
  InvoiceNumberHeaderRow,
  InvoicePartnerInfoRow,
} from "./GeneralInfoViewRows";

interface ErpInvoiceGeneralInfoViewProps extends ErpInvoiceGeneralInfoSectionProps {
  partnerName?: string;
  partnerTaxCode?: string;
  branchLabel: string;
  invoiceDate: string;
  serialNo: string;
  invoiceNo: string;
  notes: string;
  effectiveInvoiceId: string | null;
  effectiveDirection: "IN" | "OUT";
}

export const ErpInvoiceGeneralInfoView = React.memo(
  function ErpInvoiceGeneralInfoView({
    invoice,
    className = "space-y-3 text-sm",
    invoiceNo,
    serialNo,
    partnerName,
    partnerTaxCode,
    branchLabel,
    invoiceDate,
    notes,
    effectiveInvoiceId,
    effectiveDirection,
    defaultCollapsed = false,
    showTags = true,
    showRelatedInvoices = true,
  }: ErpInvoiceGeneralInfoViewProps) {
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
        <div className={className}>
          {/* 1. Số & Ký hiệu hóa đơn */}
          <InvoiceNumberHeaderRow invoiceNo={invoiceNo} serialNo={serialNo} />

          {/* 2 & 3. Đối tác & MST */}
          <InvoicePartnerInfoRow
            isInvoiceIn={isInvoiceIn}
            partnerName={partnerName}
            partnerTaxCode={partnerTaxCode}
          />

          {/* 4. Chi nhánh */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("branch", "Chi nhánh")}
            </div>
            <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-xs">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{branchLabel}</span>
            </div>
          </div>

          {/* 5. Ngày hóa đơn */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("invoiceDate", "Ngày hóa đơn")}
            </div>
            <div className="flex items-start gap-1.5 font-medium text-foreground text-xs">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span>{formatGMT7(invoiceDate, "date") || "—"}</span>
            </div>
          </div>

          {/* 6. Ghi chú */}
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">
              {t("notes", "Ghi chú")}
            </div>
            {notes ? (
              <div className="flex items-start gap-1.5 font-medium break-words text-foreground text-xs">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span className="whitespace-pre-wrap">{notes}</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-xs">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
                <span>—</span>
              </div>
            )}
          </div>

          {/* 7. Thẻ nhãn */}
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

          {/* 8. Hóa đơn liên quan */}
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
