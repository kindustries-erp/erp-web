import React, { useMemo } from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2FormGrid } from "@/v2/shared/components/molecules/v2-form-grid";
import { buildGeneralFieldConfigs } from "./garageCashflowDrawer.generalFields";
import { useGarageCashflowEditSection } from "./useGarageCashflowEditSection";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export const GarageCashflowDrawerGeneralSection: React.FC<
  DrawerSectionProps
> = (props) => {
  const { mode, voucher, formData, setFormData } = props;
  const {
    t,
    isPaymentLocked,
    handleCaseChange,
    voucherTypeOptions,
    paymentStatusOptions,
    receiptStatusOptions,
    caseFallbackLabel,
    caseTooltip,
  } = useGarageCashflowEditSection(props);

  const isReceipt =
    (voucher?.voucherType || formData.voucherType || "").toUpperCase() ===
    "RECEIPT";
  const status = voucher?.paymentStatus || formData.paymentStatus;
  const paymentStatusViewLabel = isReceipt
    ? status === "EXPECTED"
      ? t("garage:cashflowDrawer.statusExpected", "Dự thu")
      : t("garage:cashflowDrawer.statusCollected", "Đã thu")
    : status === "PENDING"
      ? t("garage:cashflowDrawer.statusPending", "Dự chi")
      : status === "APPROVED"
        ? t("garage:cashflowDrawer.statusApproved", "Đã duyệt")
        : status === "PAID"
          ? t("garage:cashflowDrawer.statusPaid", "Đã chi")
          : "—";

  const fields = useMemo(
    () =>
      buildGeneralFieldConfigs({
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
        initialData: props.initialData,
        setFormData,
      }),
    [
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
      props.initialData,
      setFormData,
    ],
  );

  return (
    <DrawerSection
      title={t("garage:cashflowDrawer.generalInfo", "THÔNG TIN CHUNG")}
      collapsible={false}
    >
      <V2FormGrid
        fields={fields}
        values={formData}
        onChange={(name, val) =>
          setFormData((prev) => ({ ...prev, [name]: val }))
        }
        viewing={mode === "view"}
      />
    </DrawerSection>
  );
};
