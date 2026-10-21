import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { InvoicePreviewModeContext } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import {
  ErpInvoiceDetailTabNav,
  type InvoiceDetailSubTabKey,
} from "./ErpInvoicePartnerTabNav";
import { useErpInvoicePartnerTab } from "./ErpInvoicePartnerTab.hook";
import type { ErpInvoiceDetailPaneProps } from "./ErpInvoicePartnerTab.type";
import { ErpInvoiceAccountingSection } from "../erp-invoice-detail-drawer/ErpInvoiceAccountingSection";

export { ErpInvoicePartnerRightPanel } from "./ErpInvoicePartnerRightPanel";
export type { ErpInvoicePartnerRightPanelProps } from "./ErpInvoicePartnerRightPanel";

/** Main tab "Chi tiết": gồm 2 sub-pill tabs (Chi tiết hóa đơn & Hạch toán kế toán) + 2 nút xem trước align right */
export const ErpInvoicePartnerTab = React.memo(function ErpInvoicePartnerTab(
  props: ErpInvoiceDetailPaneProps,
) {
  const { t } = useTranslation("erpInvoices");
  const { detailViewMode, setDetailViewMode, hasPdf, attachmentCount } =
    useErpInvoicePartnerTab(props);

  const [internalSubTab, setInternalSubTab] = useState<InvoiceDetailSubTabKey>(
    props.activeSubTab || "details",
  );

  useEffect(() => {
    if (props.activeSubTab) {
      setInternalSubTab(props.activeSubTab);
    }
  }, [props.activeSubTab]);

  const handleSubTabChange = (key: InvoiceDetailSubTabKey) => {
    setInternalSubTab(key);
    props.onSubTabChange?.(key);
  };

  const accountingBadgeCount =
    props.detailInvoice?.postingStatus === "POSTED" ||
    props.form?.accountingEnabled
      ? 1
      : undefined;

  return (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      <ErpInvoiceDetailTabNav
        subTab={internalSubTab}
        onSubTabChange={handleSubTabChange}
        detailViewMode={detailViewMode}
        onDetailViewModeChange={setDetailViewMode}
        attachmentCount={attachmentCount}
        hasPdf={hasPdf}
        accountingBadgeCount={accountingBadgeCount}
      />

      {internalSubTab === "details" ? (
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
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full">
          <ErpInvoiceAccountingSection
            detailInvoice={props.detailInvoice}
            form={props.form}
            editMode={props.editMode}
            fieldSet={props.fieldSet}
            direction={props.direction}
            postingState={props.postingState}
            pendingUnpost={props.pendingUnpost}
            onUnpost={props.onUnpost}
          />
        </div>
      )}
    </div>
  );
});
