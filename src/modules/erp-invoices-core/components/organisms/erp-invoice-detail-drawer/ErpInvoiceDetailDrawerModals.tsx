import React from "react";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { VoucherNetoffSelectionModal } from "../voucher-netoff-selection-modal";
import { PurchaseOrderSelectionModal } from "../purchase-order-selection-modal";
import { SalesOrderSelectionModal } from "../sales-order-selection-modal";
import { GarageCaseSelectionModal } from "../garage-case-selection-modal";

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
        <VoucherNetoffSelectionModal
          open={showNetOffModal}
          onClose={() => setShowNetOffModal(false)}
          invoice={detailInvoice}
          onSelect={handleSelectBankNetOff}
          existingVoucherIds={(detailInvoice.voucherNetOffs || []).map(
            (v) => v.bankTransactionId,
          )}
        />
        <PurchaseOrderSelectionModal
          open={showPoModal}
          onClose={() => setShowPoModal(false)}
          onSelect={handleSelectPo}
          existingPoIds={
            detailInvoice.purchaseOrderId ? [detailInvoice.purchaseOrderId] : []
          }
        />
        <SalesOrderSelectionModal
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
