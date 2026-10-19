import React from "react";
import { DrawerField } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { DatePicker } from "@/shared/components/DatePicker";
import { PaymentMethodCombobox } from "../../molecules/payment-method-combobox";
import { PaymentContentCombobox } from "../../molecules/payment-content-combobox";
import { CashflowAmountInput } from "../../molecules/cashflow-amount-input";
import { GarageCaseCombobox } from "../garage-case-combobox";
import { GarageCashflowDrawerStatusField } from "./GarageCashflowDrawerStatusField";
import { useGarageCashflowEditSection } from "./useGarageCashflowEditSection";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export const GarageCashflowDrawerEditSection: React.FC<DrawerSectionProps> = (
  props,
) => {
  const { formData, setFormData } = props;
  const {
    t,
    isPaymentLocked,
    handleFieldChange,
    handleCaseChange,
    voucherTypeOptions,
    paymentStatusOptions,
    receiptStatusOptions,
    caseFallbackLabel,
    caseTooltip,
  } = useGarageCashflowEditSection(props);

  return (
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
          disabled={isPaymentLocked}
          onChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              voucherType: val as any,
              paymentStatus:
                val === "PAYMENT"
                  ? prev.paymentStatus === "EXPECTED"
                    ? "PENDING"
                    : prev.paymentStatus || "PENDING"
                  : prev.paymentStatus === "PENDING" ||
                      prev.paymentStatus === "APPROVED"
                    ? "PAID"
                    : prev.paymentStatus || "PAID",
            }))
          }
          options={voucherTypeOptions}
          placeholder={t("garage:cashflowDrawer.selectPlaceholder", "— Chọn —")}
        />
      </DrawerField>

      <GarageCashflowDrawerStatusField
        voucherType={formData.voucherType}
        paymentStatus={formData.paymentStatus}
        isPaymentLocked={isPaymentLocked}
        paymentStatusOptions={paymentStatusOptions}
        receiptStatusOptions={receiptStatusOptions}
        setFormData={setFormData}
      />

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
      <DrawerField label={t("garage:cashflowDrawer.partnerName", "Đối tác")}>
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
  );
};
