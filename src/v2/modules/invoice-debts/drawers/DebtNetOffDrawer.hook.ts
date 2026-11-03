import { useEffect, useMemo, useState } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useDebtNetOffInvoicesQuery } from "../api/queries/useDebtNetOffInvoicesQuery";
import { useDebtNetOffMutation } from "../api/mutations/useDebtNetOffMutation";
import {
  getAllocatableInvoices,
  remainingUnallocated,
  sumLinesCents,
  validateNetOffLines,
  type NetOffLine,
  type NetOffOpenInvoice,
  type NetOffPartnerType,
} from "../domain/rules/debtNetOffRules";

/** Khoản sao kê/quỹ còn phần chưa phân bổ, lấy từ tab "Khoản chưa phân bổ" */
export interface NetOffTransaction {
  id: string;
  transDate: string;
  referenceNumber: string | null;
  description: string | null;
  unallocatedAmount: number;
}

export interface DebtNetOffDrawerProps {
  open: boolean;
  onClose: () => void;
  taxCode: string;
  partnerType: NetOffPartnerType;
  transaction: NetOffTransaction | null;
}

export function useDebtNetOffDrawer(props: DebtNetOffDrawerProps) {
  const { open, onClose, taxCode, partnerType, transaction } = props;
  const { t } = useV2Translation();
  const invoicesQuery = useDebtNetOffInvoicesQuery({
    taxCode,
    partnerType,
    enabled: open && transaction !== null,
  });
  const mutation = useDebtNetOffMutation(t, onClose);
  // Số tiền nhập theo hóa đơn; có key nghĩa là hóa đơn đang được chọn
  const [amounts, setAmounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    setAmounts({});
  }, [transaction?.id, open]);

  const invoices: NetOffOpenInvoice[] = useMemo(
    () => getAllocatableInvoices(invoicesQuery.data ?? []),
    [invoicesQuery.data],
  );
  const unallocatedAmount = transaction?.unallocatedAmount ?? 0;
  const lines: NetOffLine[] = useMemo(
    () =>
      Object.entries(amounts).map(([invoiceId, amount]) => ({
        invoiceId,
        amount: amount ?? 0,
      })),
    [amounts],
  );
  const remainingAmount = remainingUnallocated(unallocatedAmount, lines);
  const allocatedAmount = sumLinesCents(lines) / 100;
  const validationError =
    lines.length > 0
      ? validateNetOffLines({ lines, invoices, unallocatedAmount })
      : null;
  const canSave =
    transaction !== null &&
    lines.length > 0 &&
    validationError === null &&
    !mutation.isPending;

  const toggleInvoice = (invoice: NetOffOpenInvoice) => {
    setAmounts((prev) => {
      if (invoice.id in prev) {
        const next = { ...prev };
        delete next[invoice.id];
        return next;
      }
      // Gợi ý mặc định: phần nhỏ hơn giữa số dư hóa đơn và số chưa phân bổ còn lại
      const suggested = Math.min(invoice.balanceAmount, remainingAmount);
      return { ...prev, [invoice.id]: suggested > 0 ? suggested : null };
    });
  };

  const setAmount = (invoiceId: string, value: number | null) =>
    setAmounts((prev) => ({ ...prev, [invoiceId]: value }));

  const submit = () => {
    if (!transaction || !canSave) return;
    mutation.mutate({
      taxCode,
      body: {
        partnerType,
        bankTransactionId: transaction.id,
        allocations: lines.map((line) => ({
          invoiceId: line.invoiceId,
          amount: line.amount,
        })),
      },
    });
  };

  return {
    t,
    invoices,
    amounts,
    loading: invoicesQuery.isLoading,
    loadError: invoicesQuery.isError,
    unallocatedAmount,
    allocatedAmount,
    remainingAmount,
    validationError,
    canSave,
    saving: mutation.isPending,
    toggleInvoice,
    setAmount,
    submit,
  };
}

export type DebtNetOffDrawerState = ReturnType<typeof useDebtNetOffDrawer>;
