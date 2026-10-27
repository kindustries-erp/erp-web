import { useAppStore } from "@/core/config/appStore";
import { CashVoucherDrawer } from "@/v2/modules/cash-vouchers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** Cầu nối V1 → V2: giữ props cũ để BankStatementDrawers không đổi */
export const CreateCashTransactionDrawer = ({
  isOpen,
  onClose,
  onSuccess,
}: Props) => {
  const currentBranchId = useAppStore((state) => state.currentBranchId);
  return (
    <CashVoucherDrawer
      open={isOpen}
      onClose={onClose}
      onCreated={onSuccess}
      fallbackBranchId={currentBranchId}
    />
  );
};
