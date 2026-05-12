import { Combobox } from "@/shared/components/Combobox";
import { DrawerModal, DrawerSection, DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { Skeleton } from "@/shared/components/Skeleton";
import type { PartnerLedgerItem, PaymentVoucher } from "@/modules/finance/api/financeApi";
import { fmtAmt } from "./helpers";
import type { SelectOption, SettleForm, TFunc } from "./types";

interface SettlementDrawerProps {
  open: boolean;
  onClose: () => void;
  settleItem: PartnerLedgerItem | null;
  vouchers: PaymentVoucher[];
  voucherOpts: SelectOption[];
  vouchersLoading: boolean;
  selectedVoucher: PaymentVoucher | undefined;
  form: SettleForm;
  setForm: React.Dispatch<React.SetStateAction<SettleForm>>;
  onVoucherSelect: (voucherId: string) => void;
  loading: boolean;
  error: string | null;
  onSave: () => void;
  t: TFunc;
}

export function SettlementDrawer({
  open,
  onClose,
  settleItem,
  vouchers,
  voucherOpts,
  vouchersLoading,
  selectedVoucher,
  form,
  setForm,
  onVoucherSelect,
  loading,
  error,
  onSave,
  t,
}: SettlementDrawerProps) {
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("ledger.settlement.title")}
      subtitle={settleItem ? `${settleItem.item_no} — ${t("ledger.kpi.open")}: ₫ ${fmtAmt(settleItem.open_amount)}` : t("ledger.settlement.subtitle")}
      zIndex={450}
      actions={[{ label: loading ? t("ledger.settlement.saving") : t("ledger.settlement.save"), primary: true, loading, onClick: onSave }]}
    >
      <DrawerSection title={t("ledger.settlement.subtitle")}>
        <DrawerField label={t("ledger.settlement.voucher")}>
          {vouchersLoading ? (
            <Skeleton className="h-9 rounded" />
          ) : vouchers.length === 0 ? (
            <div className="text-sm text-[color:var(--muted-fg)]">{t("ledger.settlement.noVouchers")}</div>
          ) : (
            <Combobox options={voucherOpts} value={form.payment_voucher_id} onChange={onVoucherSelect} placeholder={t("ledger.settlement.voucherPlaceholder")} />
          )}
        </DrawerField>
        {selectedVoucher && (
          <div className="mx-0 mb-2 text-xs text-[color:var(--muted-fg)] bg-[color:var(--muted)] rounded px-3 py-2">
            Chứng từ: {selectedVoucher.voucher_no} — Số tiền: {fmtAmt(selectedVoucher.amount)} {selectedVoucher.currency ?? "VND"}
          </div>
        )}
        <DrawerField label={t("ledger.settlement.date")}>
          <DatePicker value={form.settlement_date} onChange={(v) => setForm((f) => ({ ...f, settlement_date: v }))} className="w-full" />
        </DrawerField>
        <DrawerField label={t("ledger.settlement.amount")}>
          <input type="number" className={inputCls} min={0} step={1000} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
        </DrawerField>
        <DrawerField label={t("ledger.settlement.note")}>
          <input className={inputCls} placeholder={t("ledger.settlement.notePlaceholder")} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
        </DrawerField>
      </DrawerSection>
      {error && <div className="mx-4 mb-2 text-sm text-[#d92a2a] bg-[#fde8e8] rounded px-3 py-2">{error}</div>}
    </DrawerModal>
  );
}
