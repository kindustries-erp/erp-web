import type React from "react";
import { useT } from "@/core/i18n";
import { renderGarageCaseTooltipContent } from "../garage-case-combobox";
import type { CreateGarageCashflowVoucherDto } from "../../../api/garageCashflowApi";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export function useGarageCashflowEditSection({
  voucher,
  formData,
  setFormData,
}: DrawerSectionProps) {
  const t = useT();

  const isPaymentLocked =
    voucher?.voucherType === "PAYMENT" && voucher?.paymentStatus === "PAID";

  const handleFieldChange =
    (field: keyof CreateGarageCashflowVoucherDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCaseChange = (val: string, opt?: any) => {
    const updates: Partial<CreateGarageCashflowVoucherDto> = { caseId: val };
    if (opt?.originalName) updates.partnerName = opt.originalName;
    if (opt?.originalLicensePlate && !formData.licensePlate) {
      updates.licensePlate = opt.originalLicensePlate;
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const voucherTypeOptions = [
    {
      label: t("garage:cashflowDrawer.typeReceiptOption", "Thu (RECEIPT)"),
      value: "RECEIPT",
    },
    {
      label: t("garage:cashflowDrawer.typePaymentOption", "Chi (PAYMENT)"),
      value: "PAYMENT",
    },
  ];

  const paymentStatusOptions = [
    {
      label: t("garage:cashflowDrawer.statusPending", "Chờ duyệt"),
      value: "PENDING",
    },
    {
      label: t("garage:cashflowDrawer.statusApproved", "Đã duyệt"),
      value: "APPROVED",
    },
    {
      label: t("garage:cashflowDrawer.statusPaid", "Đã chi"),
      value: "PAID",
    },
  ];

  const receiptStatusOptions = [
    {
      label: t("garage:cashflowDrawer.statusExpected", "Dự thu"),
      value: "EXPECTED",
    },
    {
      label: t("garage:cashflowDrawer.statusCollected", "Đã thu"),
      value: "PAID",
    },
  ];

  const caseFallbackLabel = voucher?.case?.soChungTu
    ? voucher.case.bienSoXe
      ? `${voucher.case.bienSoXe} - ${voucher.case.soChungTu}`
      : voucher.case.soChungTu
    : undefined;

  const caseTooltip = voucher?.case
    ? renderGarageCaseTooltipContent({
        bienSoXe: voucher.case.bienSoXe,
        soChungTu: voucher.case.soChungTu,
        id: voucher.case.id,
        khachHangName: voucher.case.khachHangName,
      })
    : undefined;

  return {
    t,
    isPaymentLocked,
    handleFieldChange,
    handleCaseChange,
    voucherTypeOptions,
    paymentStatusOptions,
    receiptStatusOptions,
    caseFallbackLabel,
    caseTooltip,
  };
}
