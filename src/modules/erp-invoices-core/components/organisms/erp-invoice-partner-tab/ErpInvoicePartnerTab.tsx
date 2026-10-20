import React from "react";
import { useTranslation } from "react-i18next";
import { InvoicePreviewModeContext } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import { ErpInvoiceDetailTabNav } from "./ErpInvoicePartnerTabNav";
import { useErpInvoicePartnerTab } from "./ErpInvoicePartnerTab.hook";
import type { ErpInvoiceDetailPaneProps } from "./ErpInvoicePartnerTab.type";

export { ErpInvoicePartnerRightPanel } from "./ErpInvoicePartnerRightPanel";
export type { ErpInvoicePartnerRightPanelProps } from "./ErpInvoicePartnerRightPanel";

/** Main tab "Chi tiết": nội dung HĐ + toggle Xem trước / Tài liệu & PDF */
export const ErpInvoicePartnerTab = React.memo(function ErpInvoicePartnerTab(
  props: ErpInvoiceDetailPaneProps,
) {
  const { t } = useTranslation("erpInvoices");
  const { detailViewMode, setDetailViewMode, hasPdf, attachmentCount } =
    useErpInvoicePartnerTab(props);

  return (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      <ErpInvoiceDetailTabNav
        detailViewMode={detailViewMode}
        onDetailViewModeChange={setDetailViewMode}
        attachmentCount={attachmentCount}
        hasPdf={hasPdf}
      />

      <InvoicePreviewModeContext.Provider
        value={{
          previewMode: detailViewMode,
          setPreviewMode: setDetailViewMode,
          hasPdf,
        }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
          {props.children ?? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {t("noDetailContent", "Không có nội dung chi tiết")}
            </div>
          )}
        </div>
      </InvoicePreviewModeContext.Provider>
    </div>
  );
});
