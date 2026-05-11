import type { useT } from "@/core/i18n";
import type { PartnerLedgerItem } from "@/modules/finance/api/financeApi";

export type TFunc = ReturnType<typeof useT>;

export interface SelectOption {
  value: string;
  label: string;
}

export interface SettleForm {
  payment_voucher_id: string;
  settlement_date: string;
  amount: number;
  note: string;
}

export interface LedgerRowActions {
  canUpdate: boolean;
  canDelete: boolean;
  canSettle: boolean;
  onEdit: (item: PartnerLedgerItem) => void;
  onSettle: (item: PartnerLedgerItem) => void;
  onCancel: (item: PartnerLedgerItem) => void;
}
