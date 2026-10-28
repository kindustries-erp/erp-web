import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, Boxes, TrendingUp, RotateCcw } from "lucide-react";
import { V2TabBar, V2Text, type V2TabItemData } from "@/v2/shared/components";
import { Button } from "@/shared/components/ui/Button";

export * from "./ErpInvoiceDetailTabNav";

export type PartnerSubTabMode = "invoices" | "lines" | "analytics";

export interface ErpInvoicePartnerSubTabNavProps {
  partnerSubTab: PartnerSubTabMode;
  onPartnerSubTabChange: (mode: PartnerSubTabMode) => void;
  debtInvoicesCount?: number;
  itemLinesTotal?: number;
  itemActiveFilterCount?: number;
  onClearItemFilters?: () => void;
}

export const ErpInvoicePartnerSubTabNav = React.memo(
  function ErpInvoicePartnerSubTabNav({
    partnerSubTab,
    onPartnerSubTabChange,
    debtInvoicesCount = 0,
    itemLinesTotal = 0,
    itemActiveFilterCount = 0,
    onClearItemFilters,
  }: ErpInvoicePartnerSubTabNavProps) {
    const { t } = useTranslation("erpInvoices");

    const partnerTabs: V2TabItemData[] = React.useMemo(
      () => [
        {
          key: "invoices",
          label: t("tabInvoicesList", "Chi tiết theo đối tượng"),
          icon: FileText,
          badgeCount: debtInvoicesCount > 0 ? debtInvoicesCount : undefined,
          alwaysShowIcon: true,
        },
        {
          key: "lines",
          label: t("tabGoodsItems", "Bảng kê HHDV"),
          icon: Boxes,
          badgeCount: itemLinesTotal > 0 ? itemLinesTotal : undefined,
          alwaysShowIcon: true,
        },
        {
          key: "analytics",
          label: t("tabCashflowAnalytics", "Biến động & Phân tích"),
          icon: TrendingUp,
          alwaysShowIcon: true,
        },
      ],
      [t, debtInvoicesCount, itemLinesTotal],
    );

    return (
      <div className="flex flex-col gap-2.5 pt-0.5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1">
            <V2TabBar
              variant="sub"
              activeTabKey={partnerSubTab}
              onTabChange={(k) => onPartnerSubTabChange(k as PartnerSubTabMode)}
              tabs={partnerTabs}
              className="w-auto pb-0"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {partnerSubTab === "invoices" && debtInvoicesCount > 0 && (
              <V2Text as="span" variant="body-sm" color="muted">
                {debtInvoicesCount} {t("invoicesCount", "hóa đơn")}
              </V2Text>
            )}

            {partnerSubTab === "lines" && (
              <>
                {itemActiveFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearItemFilters}
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t("clearFilters", "Đặt lại")} ({itemActiveFilterCount})
                  </Button>
                )}
                {itemLinesTotal > 0 && (
                  <V2Text as="span" variant="body-sm" color="muted">
                    {itemLinesTotal} {t("itemsCount", "dòng HHDV")}
                  </V2Text>
                )}
              </>
            )}

            {partnerSubTab === "analytics" && debtInvoicesCount > 0 && (
              <V2Text as="span" variant="body-sm" color="muted">
                {debtInvoicesCount} {t("invoicesCount", "hóa đơn")}
              </V2Text>
            )}
          </div>
        </div>
      </div>
    );
  },
);
