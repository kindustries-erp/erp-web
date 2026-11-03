import { DrawerRow } from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import type { NetOffTransaction } from "./DebtNetOffDrawer.hook";
import { formatNetOffAmount } from "./DebtNetOffDrawer.helper";

interface Props {
  transaction: NetOffTransaction | null;
  t: (key: string, fallback?: string) => string;
}

/** Thông tin giao dịch sao kê/quỹ đang cấn trừ */
export function DebtNetOffTransactionSection({ transaction, t }: Props) {
  if (!transaction) return null;
  return (
    <DrawerSection title={t("v2.invoiceDebts.netOff.transaction", "Giao dịch")}>
      <div className="grid gap-2 sm:grid-cols-2">
        <DrawerRow
          label={t("v2.invoiceDebts.netOff.date", "Ngày GD")}
          value={transaction.transDate}
        />
        <DrawerRow
          label={t("v2.invoiceDebts.netOff.reference", "Số tham chiếu")}
          value={transaction.referenceNumber || "—"}
          copyable={Boolean(transaction.referenceNumber)}
        />
        <DrawerRow
          label={t("v2.invoiceDebts.netOff.description", "Diễn giải")}
          value={transaction.description || "—"}
        />
        <DrawerRow
          label={t("v2.invoiceDebts.netOff.unallocated", "Chưa phân bổ")}
          value={formatNetOffAmount(transaction.unallocatedAmount)}
        />
      </div>
    </DrawerSection>
  );
}
