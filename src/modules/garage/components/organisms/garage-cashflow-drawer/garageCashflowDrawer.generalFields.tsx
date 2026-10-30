import React from "react";
import { V2FormFieldType } from "@/v2/shared/components/molecules/v2-form-field";
import type { V2FormFieldConfig } from "@/v2/shared/components/molecules/v2-form-grid";
import { V2DrawerMode, type V2DrawerModeType } from "@/v2/shared/types";
import { GarageCashflowFieldKey } from "./garageCashflowDrawer.enum";
import { PAYMENT_METHOD_OPTIONS } from "../../molecules/payment-method-combobox";
import { PAYMENT_CONTENT_OPTIONS } from "../../molecules/payment-content-combobox";
import { GarageCaseCombobox } from "../garage-case-combobox";
import { GarageCashflowDrawerStatusField } from "./GarageCashflowDrawerStatusField";
import { readVietnameseCurrency } from "@/shared/utils/format";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import type { InitialCashflowData } from "./GarageCashflowDrawer.type";

export interface GeneralFieldContext {
  mode: V2DrawerModeType | V2DrawerMode | "view" | "edit";
  voucher: GarageCashflowVoucher | null;
  formData: Partial<CreateGarageCashflowVoucherDto>;
  t: (key: string, fallback?: string) => string;
  isPaymentLocked: boolean;
  voucherTypeOptions: Array<{ label: string; value: string }>;
  paymentStatusOptions: Array<{ label: string; value: string }>;
  receiptStatusOptions: Array<{ label: string; value: string }>;
  paymentStatusViewLabel: string;
  handleCaseChange: (val: string, opt?: any) => void;
  caseFallbackLabel?: string;
  caseTooltip?: React.ReactNode;
  initialData?: InitialCashflowData;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<CreateGarageCashflowVoucherDto>>
  >;
}

export function buildGeneralFieldConfigs(
  ctx: GeneralFieldContext,
): V2FormFieldConfig<Partial<CreateGarageCashflowVoucherDto>>[] {
  const {
    mode,
    voucher,
    formData,
    t,
    isPaymentLocked,
    voucherTypeOptions,
    paymentStatusOptions,
    receiptStatusOptions,
    paymentStatusViewLabel,
    handleCaseChange,
    caseFallbackLabel,
    caseTooltip,
    initialData,
    setFormData,
  } = ctx;

  return [
    {
      name: GarageCashflowFieldKey.TRANS_DATE,
      label: t("garage:cashflowDrawer.transDate", "Ngày giao dịch"),
      type: V2FormFieldType.DATE,
      required: true,
    },
    {
      name: GarageCashflowFieldKey.VOUCHER_CODE,
      label: t("garage:cashflowDrawer.voucherCode", "Mã chứng từ"),
      type: V2FormFieldType.TEXT,
      copyable: true,
      uppercase: true,
      placeholder: t(
        "garage:cashflowDrawer.voucherCodePlaceholder",
        "Tự động sinh nếu để trống",
      ),
    },
    {
      name: GarageCashflowFieldKey.VOUCHER_TYPE,
      label: t("garage:cashflowDrawer.voucherType", "Loại phiếu"),
      type: V2FormFieldType.SELECT,
      required: true,
      options: voucherTypeOptions,
      disabled: isPaymentLocked,
    },
    {
      name: GarageCashflowFieldKey.PAYMENT_STATUS,
      label: t("garage:cashflowDrawer.status", "Trạng thái"),
      required: true,
      renderView: () => paymentStatusViewLabel,
      renderEdit: (_p, _onChange, values) => (
        <GarageCashflowDrawerStatusField
          voucherType={values.voucherType}
          paymentStatus={values.paymentStatus}
          isPaymentLocked={isPaymentLocked}
          paymentStatusOptions={paymentStatusOptions}
          receiptStatusOptions={receiptStatusOptions}
          setFormData={setFormData}
        />
      ),
    },
    {
      name: GarageCashflowFieldKey.PAYMENT_METHOD,
      label: t("garage:cashflowDrawer.paymentMethod", "Phương thức TT"),
      type: V2FormFieldType.SELECT,
      options: PAYMENT_METHOD_OPTIONS,
      placeholder: t(
        "garage:cashflowDrawer.selectPaymentMethod",
        "Chọn phương thức...",
      ),
    },
    {
      name: GarageCashflowFieldKey.PAYMENT_CONTENT,
      label: t("garage:cashflowDrawer.paymentContent", "Nội dung TT"),
      type: V2FormFieldType.SELECT,
      options: PAYMENT_CONTENT_OPTIONS,
      placeholder: t(
        "garage:cashflowDrawer.selectPaymentContent",
        "Chọn hoặc nhập nội dung...",
      ),
    },
    {
      name: GarageCashflowFieldKey.AMOUNT,
      label: t("garage:cashflowDrawer.amount", "Số tiền"),
      type: V2FormFieldType.NUMBER,
      required: true,
      placeholder: "0",
      decimals: 0,
      renderView: (_p, _displayVal, values) =>
        `${(values.amount || 0).toLocaleString("vi-VN")} đ`,
      helperText:
        (formData.amount || 0) > 0 ? (
          <V2Text
            color="muted"
            variant="body-sm"
            className="italic leading-tight pt-0.5"
          >
            {t("garage:cashflowDrawer.amountInWords", "Bằng chữ:")}{" "}
            {readVietnameseCurrency(formData.amount || 0)}
          </V2Text>
        ) : undefined,
    },
    {
      name: GarageCashflowFieldKey.CASE_ID,
      label:
        mode === V2DrawerMode.VIEW
          ? t("garage:cashflowDrawer.caseCodeShort", "Mã Phiếu Dịch Vụ")
          : t(
              "garage:cashflowDrawer.caseCode",
              "Mã Phiếu Dịch Vụ (Garage Case)",
            ),
      renderView: () => voucher?.case?.soChungTu || voucher?.caseId || "—",
      renderEdit: (_p, _onChange, values) => (
        <GarageCaseCombobox
          value={values.caseId || ""}
          onChange={handleCaseChange}
          fallbackLabel={caseFallbackLabel}
          fallbackTooltipContent={caseTooltip}
          customerCode={initialData?.customerCode}
          licensePlate={values.licensePlate || initialData?.licensePlate}
          supplierId={initialData?.supplierId}
          partnerName={values.partnerName || initialData?.partnerName}
        />
      ),
    },
    {
      name: GarageCashflowFieldKey.PARTNER_NAME,
      label: t("garage:cashflowDrawer.partnerName", "Đối tác"),
      type: V2FormFieldType.TEXT,
      renderView: () =>
        voucher?.partnerName || voucher?.case?.khachHangName || "—",
    },
    {
      name: GarageCashflowFieldKey.LICENSE_PLATE,
      label: t("garage:cashflowDrawer.licensePlate", "Biển số xe"),
      type: V2FormFieldType.TEXT,
      uppercase: true,
      placeholder: t(
        "garage:cashflowDrawer.licensePlatePlaceholder",
        "VD: 51A-123.45",
      ),
      renderView: () => voucher?.licensePlate || voucher?.case?.bienSoXe || "—",
    },
    {
      name: GarageCashflowFieldKey.NOTE,
      label: t("garage:cashflowDrawer.note", "Ghi chú"),
      type: V2FormFieldType.TEXTAREA,
      rows: 2,
      colSpan: 2,
    },
  ];
}
