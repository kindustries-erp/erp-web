import { Checkbox } from "@/v2/shared/ui";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import type { NetOffOpenInvoice } from "../domain/rules/debtNetOffRules";
import type { DebtNetOffDrawerState } from "./DebtNetOffDrawer.hook";
import { formatNetOffAmount } from "./DebtNetOffDrawer.helper";

interface Props {
  state: DebtNetOffDrawerState;
}

/** Danh sách hóa đơn còn mở của đối tác, nhập số tiền phân bổ từng hóa đơn */
export function DebtNetOffInvoiceSection({ state }: Props) {
  const { t, invoices, amounts, loadError } = state;

  return (
    <DrawerSection
      title={t("v2.invoiceDebts.netOff.openInvoices", "Hóa đơn còn mở")}
      count={invoices.length}
    >
      {loadError && (
        <V2Text variant="body-sm" className="text-destructive">
          {t("v2.invoiceDebts.netOff.loadError", "Không thể tải hóa đơn")}
        </V2Text>
      )}
      {!loadError && invoices.length === 0 && !state.loading && (
        <V2Text variant="body-sm" className="text-muted-foreground">
          {t("v2.invoiceDebts.netOff.empty", "Không còn hóa đơn nào còn mở")}
        </V2Text>
      )}
      <ul className="divide-y divide-border rounded-md border border-border">
        {invoices.map((invoice) => (
          <InvoiceRow
            key={invoice.id}
            invoice={invoice}
            checked={invoice.id in amounts}
            amount={amounts[invoice.id] ?? null}
            onToggle={() => state.toggleInvoice(invoice)}
            onAmountChange={(value) => state.setAmount(invoice.id, value)}
            t={t}
          />
        ))}
      </ul>
      <Summary state={state} />
    </DrawerSection>
  );
}

interface RowProps {
  invoice: NetOffOpenInvoice;
  checked: boolean;
  amount: number | null;
  onToggle: () => void;
  onAmountChange: (value: number | null) => void;
  t: DebtNetOffDrawerState["t"];
}

function InvoiceRow({
  invoice,
  checked,
  amount,
  onToggle,
  onAmountChange,
  t,
}: RowProps) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <div className="min-w-0 flex-1">
        <V2Text variant="body-sm" className="font-medium">
          {invoice.invoiceNo}
        </V2Text>
        <V2Text variant="body-sm" className="text-muted-foreground">
          {invoice.invoiceDate} · {t("v2.invoiceDebts.netOff.balance", "Còn")}{" "}
          {formatNetOffAmount(invoice.balanceAmount)}
        </V2Text>
      </div>
      <V2NumberInput
        className="w-36"
        disabled={!checked}
        value={checked ? amount : null}
        max={invoice.balanceAmount}
        min={0}
        onValueChange={onAmountChange}
        aria-label={t("v2.invoiceDebts.netOff.amount", "Phân bổ")}
      />
    </li>
  );
}

function Summary({ state }: { state: DebtNetOffDrawerState }) {
  const { t, allocatedAmount, remainingAmount, validationError } = state;
  return (
    <div className="mt-3 space-y-1">
      <V2Text variant="body-sm">
        {t("v2.invoiceDebts.netOff.allocated", "Đã phân bổ")}:{" "}
        {formatNetOffAmount(allocatedAmount)} ·{" "}
        {t("v2.invoiceDebts.netOff.remaining", "Còn lại")}:{" "}
        {formatNetOffAmount(remainingAmount)}
      </V2Text>
      {validationError && (
        <V2Text variant="body-sm" className="text-destructive">
          {t(`v2.invoiceDebts.netOff.errors.${validationError}`)}
        </V2Text>
      )}
    </div>
  );
}
