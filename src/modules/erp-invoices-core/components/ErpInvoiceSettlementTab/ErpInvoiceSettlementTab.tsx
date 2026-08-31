import { type ErpInvoiceSettlementTabProps } from "./types";
import { useErpInvoiceSettlementLogic } from "./hooks/useErpInvoiceSettlementLogic";
import { SettlementProgressCard } from "./components/SettlementProgressCard";
import { SettlementVoucherList } from "./components/SettlementVoucherList";
import { VoucherNetoffSelectionModal } from "../VoucherNetoffSelectionModal";

export function ErpInvoiceSettlementTab(props: ErpInvoiceSettlementTabProps) {
  const { direction = "OUT", invoice, form, editMode } = props;

  const logic = useErpInvoiceSettlementLogic(props);

  return (
    <div className="space-y-4 p-3 max-h-[600px] overflow-y-auto">
      {/* ─── 1. BẢNG TIẾN ĐỘ THANH TOÁN HÓA ĐƠN ─── */}
      <SettlementProgressCard
        direction={direction}
        editMode={editMode}
        invoiceNo={invoice?.invoiceNo || form?.invoiceNo}
        totalInvoiceAmount={logic.totalInvoiceAmount}
        totalNetOff={logic.totalNetOff}
        remainingDebt={logic.remainingDebt}
        paymentPercent={logic.paymentPercent}
        isPaidFull={logic.isPaidFull}
      />

      {/* ─── 2. DANH SÁCH CHỨNG TỪ THANH TOÁN / CẤN TRỪ ─── */}
      <SettlementVoucherList
        direction={direction}
        editMode={editMode}
        activeVouchers={logic.activeVouchers}
        saving={logic.saving}
        onOpenModal={() => logic.setShowModal(true)}
        onOpenBankVoucher={logic.openBankVoucher}
        onUnlinkVoucher={logic.handleUnlinkVoucher}
      />

      {/* ─── 3. DRAWER ĐỐI SOÁT DÒNG TIỀN (SAO KÊ & SỔ QUỸ) ─── */}
      <VoucherNetoffSelectionModal
        open={logic.showModal}
        onClose={() => logic.setShowModal(false)}
        invoice={invoice || (form ? { ...form, direction } : null)}
        invoiceDirection={direction}
        initialType={direction === "IN" ? "PAYMENT" : "RECEIPT"}
        onSelect={logic.handleSelectBankNetOff}
      />
    </div>
  );
}
