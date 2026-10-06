import React from "react";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { useGarageCaseFinancials } from "./context/GarageCaseFinancialsContext";
import { QuoteFinancialsTabContent } from "../organisms/garage-case-preview/quote-financials-tab-content";
import type { GarageCaseFinancialsTabProps } from "./types";

export function GarageCaseFinancialsTab(props: GarageCaseFinancialsTabProps) {
  const logic = useGarageCaseFinancials();

  return (
    <div className="space-y-4 pb-2">
      {/* ─── QUOTE FINANCIALS: 3 BẢNG (PHẢI THU, PHỤ TÙNG, DỊCH VỤ & DRAWER CẤN TRỪ) ─── */}
      <QuoteFinancialsTabContent
        caseId={props.caseId || logic.caseData?.id || ""}
        caseCode={props.caseCode || logic.caseData?.soChungTu || ""}
        caseData={props.caseData || logic.caseData}
      />

      {/* ─── STANDALONE DETAIL DRAWERS & PREVIEWS ─── */}
      {logic.detailTxnId && (
        <BankTransactionDetailDrawer
          isOpen={!!logic.detailTxnId}
          onClose={() => logic.setDetailTxnId(null)}
          transactionId={logic.detailTxnId}
        />
      )}

      {logic.viewInvoiceId && (
        <ErpInvoiceStandaloneDrawer
          isOpen={!!logic.viewInvoiceId}
          invoiceId={logic.viewInvoiceId}
          onClose={() => logic.setViewInvoiceId(null)}
        />
      )}

      {logic.previewPdf && (
        <FilePreviewDrawer
          open={Boolean(logic.previewPdf)}
          onClose={() => logic.setPreviewPdf(null)}
          previewUrl={logic.previewPdf.url}
          fileName={logic.previewPdf.filename}
        />
      )}
    </div>
  );
}
