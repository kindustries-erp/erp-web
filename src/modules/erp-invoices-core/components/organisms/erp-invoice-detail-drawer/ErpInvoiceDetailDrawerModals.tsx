import React from "react";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { GarageCaseSelectionModal } from "../garage-case-selection-modal";
import {
  V2BankNetOffSelectionModal,
  V2PurchaseOrderSelectionModal,
  V2SalesOrderSelectionModal,
} from "@/v2/modules/finance-invoice/components/organisms/invoice-link-selection";

export interface ErpInvoiceDetailDrawerModalsProps {
  detailInvoice: ErpInvoice | null;
  showNetOffModal: boolean;
  setShowNetOffModal: (show: boolean) => void;
  showPoModal: boolean;
  setShowPoModal: (show: boolean) => void;
  showSoModal: boolean;
  setShowSoModal: (show: boolean) => void;
  showGarageCaseModal: boolean;
  setShowGarageCaseModal: (show: boolean) => void;
  handleSelectBankNetOff: (selected: { id: string; amount: number }[]) => void;
  handleSelectPo: (po: any) => void;
  handleSelectSo: (so: any) => void;
  handleSelectGarageCase: (kase: any) => void;
}

/**
 * Các modal chọn chứng từ mở từ drawer hóa đơn. Sao kê, PO và SO dùng bản V2
 * (lồng đúng trong drawer V2); Garage còn là bản V1 cho đến khi migrate.
 */
export const ErpInvoiceDetailDrawerModals = React.memo(
  function ErpInvoiceDetailDrawerModals({
    detailInvoice,
    showNetOffModal,
    setShowNetOffModal,
    showPoModal,
    setShowPoModal,
    showSoModal,
    setShowSoModal,
    showGarageCaseModal,
    setShowGarageCaseModal,
    handleSelectBankNetOff,
    handleSelectPo,
    handleSelectSo,
    handleSelectGarageCase,
  }: ErpInvoiceDetailDrawerModalsProps) {
    if (!detailInvoice) return null;

    return (
      <>
        <V2BankNetOffSelectionModal
          open={showNetOffModal}
          onClose={() => setShowNetOffModal(false)}
          side={detailInvoice.direction === "OUT" ? "RECEIPT" : "PAYMENT"}
          invoiceId={detailInvoice.id}
          existingTxnIds={(detailInvoice.voucherNetOffs || []).map(
            (v) => v.bankTransactionId,
          )}
          onSelect={handleSelectBankNetOff}
        />
        <V2PurchaseOrderSelectionModal
          open={showPoModal}
          onClose={() => setShowPoModal(false)}
          onSelect={handleSelectPo}
          existingPoIds={
            detailInvoice.purchaseOrderId ? [detailInvoice.purchaseOrderId] : []
          }
        />
        <V2SalesOrderSelectionModal
          open={showSoModal}
          onClose={() => setShowSoModal(false)}
          onSelect={handleSelectSo}
        />
        <GarageCaseSelectionModal
          open={showGarageCaseModal}
          onClose={() => setShowGarageCaseModal(false)}
          onSelect={handleSelectGarageCase}
        />
      </>
    );
  },
);
