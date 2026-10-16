import React from "react";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";
import { PaymentMethodCombobox } from "../../molecules/payment-method-combobox";
import { PaymentContentCombobox } from "../../molecules/payment-content-combobox";
import { CashflowAmountInput } from "../../molecules/cashflow-amount-input";
import {
  GarageCaseCombobox,
  renderGarageCaseTooltipContent,
} from "../garage-case-combobox";
import { GarageCashflowDrawerViewSection } from "./GarageCashflowDrawerViewSection";
import type { CreateGarageCashflowVoucherDto } from "../../../api/garageCashflowApi";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export const GarageCashflowDrawerGeneralSection: React.FC<
  DrawerSectionProps
> = ({ mode, voucher, formData, setFormData }) => {
  const t = useT();

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

  return (
    <DrawerSection
      title={t("garage:cashflowDrawer.generalInfo", "THÔNG TIN CHUNG")}
    >
      {mode === "edit" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DrawerField
            label={t("garage:cashflowDrawer.transDate", "Ngày giao dịch")}
            required
          >
            <DatePicker
              value={formData.transDate || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, transDate: val }))
              }
              className="w-full"
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.voucherCode", "Mã chứng từ")}
          >
            <Input
              value={formData.voucherCode || ""}
              onChange={handleFieldChange("voucherCode")}
              placeholder={t(
                "garage:cashflowDrawer.voucherCodePlaceholder",
                "Tự động sinh nếu để trống",
              )}
              className="w-full h-8 text-sm"
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.voucherType", "Loại phiếu")}
            required
          >
            <Combobox
              value={formData.voucherType || ""}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, voucherType: val as any }))
              }
              options={voucherTypeOptions}
              placeholder={t(
                "garage:cashflowDrawer.selectPlaceholder",
                "— Chọn —",
              )}
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.paymentMethod", "Phương thức TT")}
          >
            <PaymentMethodCombobox
              value={formData.paymentMethod || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, paymentMethod: val }))
              }
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.paymentContent", "Nội dung TT")}
          >
            <PaymentContentCombobox
              value={formData.paymentContent || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, paymentContent: val }))
              }
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.amount", "Số tiền")}
            required
          >
            <CashflowAmountInput
              value={formData.amount || 0}
              onChange={(val: number) =>
                setFormData((prev) => ({ ...prev, amount: val }))
              }
            />
          </DrawerField>
          <DrawerField
            label={t(
              "garage:cashflowDrawer.caseCode",
              "Mã Phiếu Dịch Vụ (Garage Case)",
            )}
          >
            <GarageCaseCombobox
              value={formData.caseId || ""}
              onChange={handleCaseChange}
              fallbackLabel={caseFallbackLabel}
              fallbackTooltipContent={caseTooltip}
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.partnerName", "Đối tác")}
          >
            <Input
              value={formData.partnerName || ""}
              onChange={handleFieldChange("partnerName")}
              className="w-full h-8 text-sm"
            />
          </DrawerField>
          <DrawerField
            label={t("garage:cashflowDrawer.licensePlate", "Biển số xe")}
          >
            <Input
              value={formData.licensePlate || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  licensePlate: e.target.value.toUpperCase(),
                }))
              }
              placeholder={t(
                "garage:cashflowDrawer.licensePlatePlaceholder",
                "VD: 51A-123.45",
              )}
              className="w-full h-8 text-sm font-mono uppercase"
            />
          </DrawerField>
          <div className="col-span-1 md:col-span-2">
            <DrawerField label={t("garage:cashflowDrawer.note", "Ghi chú")}>
              <Textarea
                value={formData.note || ""}
                onChange={handleFieldChange("note")}
                rows={2}
                className="w-full text-sm"
              />
            </DrawerField>
          </div>
        </div>
      ) : (
        <GarageCashflowDrawerViewSection voucher={voucher} />
      )}
    </DrawerSection>
  );
};
