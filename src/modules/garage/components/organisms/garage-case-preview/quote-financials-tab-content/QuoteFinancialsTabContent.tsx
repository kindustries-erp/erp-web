import React from "react";
import { Landmark, Package, Wrench } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { QuoteReceivablesTable } from "../components/tables/quote-receivables-table";
import { QuotePartsTable } from "../components/tables/quote-parts-table";
import { QuoteServicesTable } from "../components/tables/quote-services-table";
import { CaseLinePaymentDrawer } from "../../../organisms/case-line-payment-drawer";
import { useQuoteFinancialsTabContent } from "./QuoteFinancialsTabContent.hook";
import type { QuoteFinancialsTabContentProps } from "./QuoteFinancialsTabContent.type";

export function QuoteFinancialsTabContent(
  props: QuoteFinancialsTabContentProps,
) {
  const {
    t,
    parts,
    services,
    isPaymentDrawerOpen,
    paymentDrawerTarget,
    handleReceivablePaymentClick,
    handlePartPaymentClick,
    handleServicePaymentClick,
    closePaymentDrawer,
  } = useQuoteFinancialsTabContent(props);

  return (
    <div className={`space-y-4 ${props.className || ""}`}>
      {/* ─── 1. BẢNG PHẢI THU (ĐỨNG ĐẦU TIÊN - ĐÚNG 2 HÀNG KH & BH) ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Landmark className="w-3.5 h-3.5 text-primary" />
            {t(
              "cases.quotePreview.receivablesTitle",
              "1. Bảng Phải thu & Phân bổ",
            )}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (2)
            </span>
          </span>
        }
        collapsible
        defaultCollapsed={false}
      >
        <QuoteReceivablesTable
          caseData={props.caseData}
          onPaymentClick={handleReceivablePaymentClick}
        />
      </DrawerSection>

      {/* ─── 2. BẢNG PHỤ TÙNG (ĐỨNG THỨ HAI - CẤN TRỪ CHI) ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {t(
              "cases.quotePreview.partsTitle",
              "2. Bảng Chi tiết Vật tư & Phụ tùng",
            )}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({parts.length})
            </span>
          </span>
        }
        collapsible
        defaultCollapsed={false}
      >
        <QuotePartsTable
          lines={parts}
          onPaymentClick={handlePartPaymentClick}
        />
      </DrawerSection>

      {/* ─── 3. BẢNG DỊCH VỤ (ĐỨNG THỨ BA) ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {t(
              "cases.quotePreview.servicesTitle",
              "3. Bảng Chi tiết Nhân công & Dịch vụ",
            )}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({services.length})
            </span>
          </span>
        }
        collapsible
        defaultCollapsed={false}
      >
        <QuoteServicesTable
          lines={services}
          onPaymentClick={handleServicePaymentClick}
        />
      </DrawerSection>

      {/* ─── DRAWER CẤN TRỪ KHI CLICK THANH TOÁN ─── */}
      {isPaymentDrawerOpen && paymentDrawerTarget && (
        <CaseLinePaymentDrawer
          open={isPaymentDrawerOpen}
          onClose={closePaymentDrawer}
          caseId={props.caseId}
          caseCode={props.caseCode}
          caseData={props.caseData}
          lineId={paymentDrawerTarget.lineId}
          lineCode={paymentDrawerTarget.lineCode}
          lineName={paymentDrawerTarget.lineName}
          lineAmount={paymentDrawerTarget.lineAmount}
          lineType={paymentDrawerTarget.lineType}
          payer={paymentDrawerTarget.payer}
          direction={paymentDrawerTarget.direction}
        />
      )}
    </div>
  );
}
