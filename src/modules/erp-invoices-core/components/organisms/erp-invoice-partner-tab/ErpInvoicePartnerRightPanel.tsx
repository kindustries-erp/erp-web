import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, CreditCard, MapPin } from "lucide-react";
import { CopyButton } from "@/shared/components/CopyButton";
import { Badge } from "@/shared/components/ui/badge";
import { DrawerSection } from "@/shared/components/DrawerModal";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoicePartnerRightPanelProps {
  detailInvoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
}

export const ErpInvoicePartnerRightPanel = React.memo(
  function ErpInvoicePartnerRightPanel({
    detailInvoice,
    direction,
  }: ErpInvoicePartnerRightPanelProps) {
    const { t } = useTranslation("erpInvoices");

    const isDirectionIn = (direction || detailInvoice?.direction) === "IN";
    const partnerName =
      (isDirectionIn
        ? detailInvoice?.sellerName
        : detailInvoice?.buyerName || detailInvoice?.buyerPersonalName
      )?.trim() || "";

    const taxCode =
      (isDirectionIn
        ? detailInvoice?.sellerTaxCode
        : detailInvoice?.buyerTaxCode || detailInvoice?.buyerCccd
      )?.trim() || "";

    const address =
      (isDirectionIn
        ? detailInvoice?.sellerAddress
        : detailInvoice?.buyerAddress
      )?.trim() || "";

    const bank = isDirectionIn ? detailInvoice?.sellerBank?.trim() : "";

    if (!taxCode && !partnerName) return null;

    return (
      <div className="space-y-4 pb-3">
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{t("partnerProfile", "Hồ sơ đối tác")}</span>
            </div>
          }
          collapsible={true}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-foreground leading-snug break-words">
                  {partnerName || t("unnamedPartner", "Đối tác chưa đặt tên")}
                </span>
                {partnerName && (
                  <CopyButton
                    value={partnerName}
                    tooltip={t("copyName", "Copy tên")}
                    copiedTooltip={t("copied", "Đã copy")}
                    toastMessage={t("copiedName", "Đã copy tên đối tác")}
                    toastId="partner-name-copy"
                    className="p-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  />
                )}
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
              >
                {isDirectionIn
                  ? t("roleSeller", "Bên bán (Nhà cung cấp)")
                  : t("roleBuyer", "Bên mua (Khách hàng)")}
              </Badge>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
              {taxCode && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground shrink-0 font-medium">
                    MST:
                  </span>
                  <div className="flex items-center gap-1 min-w-0 font-mono">
                    <span className="font-semibold text-foreground truncate">
                      {taxCode}
                    </span>
                    <CopyButton
                      value={taxCode}
                      tooltip={t("copyTax", "Copy MST")}
                      copiedTooltip={t("copied", "Đã copy")}
                      toastMessage={t("copiedTax", "Đã copy MST")}
                      toastId="partner-tax-copy"
                      iconClassName="w-3 h-3"
                      className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    />
                  </div>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span
                    className="text-[11px] leading-relaxed line-clamp-2"
                    title={address}
                  >
                    {address}
                  </span>
                </div>
              )}

              {bank && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span
                    className="text-[11px] leading-relaxed line-clamp-2"
                    title={bank}
                  >
                    {bank}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DrawerSection>
      </div>
    );
  },
);
