import React from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/molecules/vietnam-invoice-template";
import { PartnerDebtAnalyticsSection } from "../partner-debt-analytics";
import { ErpInvoicePartnerInvoicesSection } from "../erp-invoice-partner-invoices-section";
import { ErpInvoicePartnerLinesSection } from "./ErpInvoicePartnerLinesSection";
import { ErpInvoicePartnerSubTabNav } from "./ErpInvoicePartnerTabNav";
import { ErpInvoicePartnerTabEmpty } from "./ErpInvoicePartnerTabEmpty";
import { useErpInvoicePartnerTab } from "./ErpInvoicePartnerTab.hook";
import type { ErpInvoicePartnerTabProps } from "./ErpInvoicePartnerTab.type";

/** Main tab "Chi tiết theo NCC/KH": sub-pill Đối tượng | HHDV | Phân tích */
export const ErpInvoicePartnerSection = React.memo(
  function ErpInvoicePartnerSection(props: ErpInvoicePartnerTabProps) {
    const {
      partnerSubTab,
      handlePartnerSubTabChange,
      taxCode,
      partnerName,
      hasPartnerInfo,
      partnerType,
      debtInvoices,
      isLoadingDebtInvoices,
      previewSubInvoice,
      setPreviewSubInvoice,
    } = useErpInvoicePartnerTab(props);

    const direction = (props.direction || props.detailInvoice?.direction) as
      | "IN"
      | "OUT";

    return (
      <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
        <ErpInvoicePartnerSubTabNav
          partnerSubTab={partnerSubTab}
          onPartnerSubTabChange={handlePartnerSubTabChange}
          debtInvoicesCount={debtInvoices.length}
          itemLinesTotal={0}
        />

        {partnerSubTab === "invoices" &&
          (!hasPartnerInfo ? (
            <ErpInvoicePartnerTabEmpty />
          ) : (
            <ErpInvoicePartnerInvoicesSection
              taxCode={taxCode}
              partnerName={partnerName}
              partnerType={partnerType}
              direction={direction}
              onPreviewInvoice={(subInv: any) => setPreviewSubInvoice(subInv)}
            />
          ))}

        {partnerSubTab === "lines" &&
          (!hasPartnerInfo ? (
            <ErpInvoicePartnerTabEmpty />
          ) : (
            <ErpInvoicePartnerLinesSection
              taxCode={taxCode}
              direction={direction}
              onPreviewInvoice={(subInv: any) => setPreviewSubInvoice(subInv)}
            />
          ))}

        {partnerSubTab === "analytics" &&
          (!hasPartnerInfo ? (
            <ErpInvoicePartnerTabEmpty />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 w-full">
              <PartnerDebtAnalyticsSection
                invoices={debtInvoices}
                isLoading={isLoadingDebtInvoices}
                isCustomer={direction !== "IN"}
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
  },
);
