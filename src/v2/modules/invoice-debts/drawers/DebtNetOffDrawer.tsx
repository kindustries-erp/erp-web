import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { DebtNetOffInvoiceSection } from "./DebtNetOffInvoiceSection";
import { DebtNetOffTransactionSection } from "./DebtNetOffTransactionSection";
import {
  useDebtNetOffDrawer,
  type DebtNetOffDrawerProps,
} from "./DebtNetOffDrawer.hook";

/** Cấn trừ một khoản sao kê/quỹ chưa phân bổ vào các hóa đơn còn mở của đối tác */
export function DebtNetOffDrawer(props: DebtNetOffDrawerProps) {
  const state = useDebtNetOffDrawer(props);
  const { t } = state;

  return (
    <V2StandardDrawer
      id={`debt-net-off-${props.transaction?.id ?? "none"}`}
      open={props.open}
      onClose={props.onClose}
      mode="edit"
      title={t("v2.invoiceDebts.netOff.title", "Cấn trừ công nợ")}
      subtitle={props.taxCode}
      layout="1-column"
      size="lg"
      loading={state.loading}
      actions={[
        {
          label: t("v2.common.cancel", "Hủy"),
          onClick: props.onClose,
          variant: "outline",
          disabled: state.saving,
        },
        {
          label: t("v2.invoiceDebts.netOff.save", "Cấn trừ"),
          onClick: state.submit,
          primary: true,
          loading: state.saving,
          disabled: !state.canSave,
        },
      ]}
    >
      <DebtNetOffTransactionSection transaction={props.transaction} t={t} />
      <DebtNetOffInvoiceSection state={state} />
    </V2StandardDrawer>
  );
}
