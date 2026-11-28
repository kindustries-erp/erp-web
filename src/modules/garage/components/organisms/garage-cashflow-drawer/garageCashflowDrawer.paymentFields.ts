import { V2FormFieldType } from "@/v2/shared/components/molecules/v2-form-field";
import type { V2FormFieldConfig } from "@/v2/shared/components/molecules/v2-form-grid";
import { GarageCashflowFieldKey } from "./garageCashflowDrawer.enum";
import { PAYMENT_METHOD_OPTIONS } from "../../molecules/payment-method-combobox";
import { getPaymentContentSelectOptions } from "../../molecules/payment-content-combobox";
import { requiresCase } from "../../../utils/garageCashflowCatalog";
import {
  isGarageContentAllowed,
  isGarageVoucherSettled,
} from "../../../utils/garageCashflowVoucherRules";
import { toRuleState } from "./garageCashflowDrawer.rules";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

type FormData = Partial<CreateGarageCashflowVoucherDto>;
type SelectOption = { label: string; value: string };

/** Giá trị đang lưu nằm ngoài danh sách vẫn phải hiện được trong ô chọn. */
const withCurrent = (
  options: SelectOption[],
  current?: string,
): SelectOption[] =>
  !current || options.some((o) => o.value === current)
    ? options
    : [...options, { label: current, value: current }];

export function buildPaymentFieldConfigs(
  formData: FormData,
  voucher: GarageCashflowVoucher | null,
  t: (key: string, fallback?: string) => string,
): V2FormFieldConfig<FormData>[] {
  const state = toRuleState(formData);
  const settled = isGarageVoucherSettled(state);
  const { paymentMethod, paymentContent } = formData;

  const methodHint =
    paymentMethod &&
    !PAYMENT_METHOD_OPTIONS.some((o) => o.value === paymentMethod)
      ? t(
          "garage:cashflowDrawer.methodLegacyWarning",
          "Phương thức đang lưu không còn trong danh sách, nên chọn lại.",
        )
      : undefined;

  let contentHint: string | undefined;
  if (!isGarageContentAllowed(state, voucher ?? undefined)) {
    contentHint = t(
      "garage:cashflowDrawer.contentLegacyWarning",
      "Nội dung đang lưu không đúng loại phiếu, nên chọn lại.",
    );
  } else if (requiresCase(paymentContent) && !formData.caseId) {
    contentHint = t(
      "garage:cashflowDrawer.contentCaseHint",
      "Nội dung này cần gắn phiếu dịch vụ, hoặc ghi lý do vào Ghi chú.",
    );
  }

  return [
    {
      name: GarageCashflowFieldKey.PAYMENT_METHOD,
      label: t("garage:cashflowDrawer.paymentMethod", "Phương thức TT"),
      type: V2FormFieldType.SELECT,
      required: settled,
      options: withCurrent(PAYMENT_METHOD_OPTIONS, paymentMethod),
      helperText: methodHint,
      placeholder: t(
        "garage:cashflowDrawer.selectPaymentMethod",
        "Chọn phương thức...",
      ),
    },
    {
      name: GarageCashflowFieldKey.PAYMENT_CONTENT,
      label: t("garage:cashflowDrawer.paymentContent", "Nội dung TT"),
      type: V2FormFieldType.SELECT,
      required: settled,
      options: withCurrent(
        getPaymentContentSelectOptions(state.voucherType),
        paymentContent,
      ),
      helperText: contentHint,
      placeholder: t(
        "garage:cashflowDrawer.selectPaymentContent",
        "Chọn hoặc nhập nội dung...",
      ),
    },
  ];
}
