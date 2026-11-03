import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { CashVoucherFormSections } from "../components/organisms/cash-voucher-form";
import {
  useCashVoucherDrawer,
  type CashVoucherDrawerProps,
} from "./CashVoucherDrawer.hook";

/** Drawer tạo mới phiếu thu/chi tiền mặt (chỉ tạo, không sửa) */
export function CashVoucherDrawer(props: CashVoucherDrawerProps) {
  const state = useCashVoucherDrawer(props);
  const { t } = state;

  return (
    <V2StandardDrawer
      id="cash-voucher-create"
      open={props.open}
      onClose={props.onClose}
      mode="edit"
      title={t("v2.cashVouchers.form.create", "Tạo mới phiếu thu/chi tiền mặt")}
      layout="1-column"
      size="md"
      loading={state.loadingCashBooks}
      confirmOnClose={state.dirty}
      actions={[
        {
          label: t("v2.common.cancel", "Hủy"),
          onClick: props.onClose,
          variant: "outline",
          disabled: state.saving,
        },
        {
          label: t("v2.common.save", "Lưu"),
          onClick: state.submit,
          primary: true,
          loading: state.saving,
          disabled: state.saving,
        },
      ]}
    >
      <CashVoucherFormSections
        form={state.form}
        cashBooks={state.cashBooks}
        errorField={state.errorField}
        errorMessage={t(
          "v2.cashVouchers.form.required",
          "Trường này là bắt buộc",
        )}
        amountErrorMessage={t(
          "v2.cashVouchers.form.amountRule",
          "Nhập đúng một trong hai: Thu hoặc Chi",
        )}
        t={t}
        setField={state.setField}
      />
    </V2StandardDrawer>
  );
}
