import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/molecules/vietnam-invoice-template";
import { InvoicePreviewModeContext } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import { PartnerDebtAnalyticsSection } from "../partner-debt-analytics";
import { ErpInvoicePartnerInvoicesSection } from "../erp-invoice-partner-invoices-section";
import { ErpInvoicePartnerLinesSection } from "./ErpInvoicePartnerLinesSection";
import { ErpInvoicePartnerTabNav } from "./ErpInvoicePartnerTabNav";
import { ErpInvoicePartnerTabEmpty } from "./ErpInvoicePartnerTabEmpty";
import { useErpInvoicePartnerTab } from "./ErpInvoicePartnerTab.hook";
import type { ErpInvoicePartnerTabProps } from "./ErpInvoicePartnerTab.type";

export type { ErpInvoicePartnerTabProps };
export { ErpInvoicePartnerRightPanel } from "./ErpInvoicePartnerRightPanel";
export type { ErpInvoicePartnerRightPanelProps } from "./ErpInvoicePartnerRightPanel";

export const ErpInvoicePartnerTab = React.memo(function ErpInvoicePartnerTab(
  props: ErpInvoicePartnerTabProps,
) {
  const { t } = useTranslation("erpInvoices");
  const {
    viewMode,
    handleViewModeChange,
    detailViewMode,
    setDetailViewMode,
    hasPdf,
    attachmentCount,
    partnerName,
    taxCode,
    hasPartnerInfo,
    partnerType,
    debtInvoices,
    isLoadingDebtInvoices,
    previewSubInvoice,
    setPreviewSubInvoice,
  } = useErpInvoicePartnerTab(props);

  return (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      {/* 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + QUICK ACTIONS */}
      <ErpInvoicePartnerTabNav
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        detailViewMode={detailViewMode}
        onDetailViewModeChange={setDetailViewMode}
        debtInvoicesCount={debtInvoices.length}
        itemLinesTotal={0}
        attachmentCount={attachmentCount}
        hasPdf={hasPdf}
      />

      {/* 2. TAB CHI TIẾT: Luôn luôn hiển thị nội dung của hóa đơn hiện tại */}
      {viewMode === "details" && (
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
      )}

      {/* 3. TAB DANH SÁCH HÓA ĐƠN CHI TIẾT THEO ĐỐI TƯỢNG */}
      {viewMode === "invoices" &&
        (!hasPartnerInfo ? (
          <ErpInvoicePartnerTabEmpty />
        ) : (
          <ErpInvoicePartnerInvoicesSection
            taxCode={taxCode}
            partnerName={partnerName}
            partnerType={partnerType}
            direction={
              (props.direction || props.detailInvoice?.direction) as
                | "IN"
                | "OUT"
            }
            onPreviewInvoice={(subInv: any) => setPreviewSubInvoice(subInv)}
          />
        ))}

      {/* 4. TAB CHI TIẾT HÀNG HÓA & DỊCH VỤ (ITEM LINES) */}
      {viewMode === "lines" &&
        (!hasPartnerInfo ? (
          <ErpInvoicePartnerTabEmpty />
        ) : (
          <ErpInvoicePartnerLinesSection
            taxCode={taxCode}
            direction={
              (props.direction || props.detailInvoice?.direction) as
                | "IN"
                | "OUT"
            }
            onPreviewInvoice={(subInv: any) => setPreviewSubInvoice(subInv)}
          />
        ))}

      {/* 5. TAB BIẾN ĐỘNG & PHÂN TÍCH */}
      {viewMode === "analytics" &&
        (!hasPartnerInfo ? (
          <ErpInvoicePartnerTabEmpty />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 w-full">
            <PartnerDebtAnalyticsSection
              invoices={debtInvoices}
              isLoading={isLoadingDebtInvoices}
              isCustomer={
                props.direction !== "IN" &&
                props.detailInvoice?.direction !== "IN"
              }
            />
          </div>
        ))}

      {/* Sub-drawer xem trước hóa đơn khác từ danh sách đối tác */}
      {previewSubInvoice && (
        <DrawerModal
          open={Boolean(previewSubInvoice)}
          onClose={() => setPreviewSubInvoice(null)}
          title={`Hóa đơn ${previewSubInvoice.invoiceNo || ""} (Ký hiệu: ${previewSubInvoice.serialNo || "—"})`}
          panelClassName="min-[1024px]:w-[calc(100vw-350px)] w-full max-w-[85vw]"
        >
          <div className="p-4">
            <VietnamInvoiceTemplate invoice={previewSubInvoice} />
          </div>
        </DrawerModal>
      )}
    </div>
  );
});
