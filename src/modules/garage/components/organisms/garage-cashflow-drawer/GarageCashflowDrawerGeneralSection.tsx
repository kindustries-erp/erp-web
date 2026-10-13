import React from "react";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { DatePicker } from "@/shared/components/DatePicker";
import { PaymentMethodCombobox } from "../../molecules/payment-method-combobox";
import { PaymentContentCombobox } from "../../molecules/payment-content-combobox";
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
  const handleFieldChange =
    (field: keyof CreateGarageCashflowVoucherDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <DrawerSection title="THÔNG TIN CHUNG">
      {mode === "edit" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DrawerField label="Ngày giao dịch" required>
            <DatePicker
              value={formData.transDate || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, transDate: val }))
              }
              className="w-full"
            />
          </DrawerField>
          <DrawerField label="Mã chứng từ">
            <Input
              value={formData.voucherCode || ""}
              onChange={handleFieldChange("voucherCode")}
              placeholder="Tự động sinh nếu để trống"
              className="w-full h-8 text-sm"
            />
          </DrawerField>
          <DrawerField label="Loại phiếu" required>
            <Combobox
              value={formData.voucherType || ""}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  voucherType: val as "RECEIPT" | "PAYMENT",
                }))
              }
              options={[
                { label: "Thu (RECEIPT)", value: "RECEIPT" },
                { label: "Chi (PAYMENT)", value: "PAYMENT" },
              ]}
              placeholder="— Chọn —"
            />
          </DrawerField>
          <DrawerField label="Phương thức TT">
            <PaymentMethodCombobox
              value={formData.paymentMethod || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, paymentMethod: val }))
              }
            />
          </DrawerField>
          <DrawerField label="Nội dung TT">
            <PaymentContentCombobox
              value={formData.paymentContent || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, paymentContent: val }))
              }
            />
          </DrawerField>
          <DrawerField label="Số tiền" required>
            <Input
              type="number"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
              className="w-full h-8 text-sm"
            />
          </DrawerField>
          <DrawerField label="Mã Phiếu Dịch Vụ (Garage Case)">
            <GarageCaseCombobox
              value={formData.caseId || ""}
              onChange={(val: string, selectedOption?: any) => {
                const updates: Partial<CreateGarageCashflowVoucherDto> = {
                  caseId: val,
                };
                if (selectedOption?.originalName) {
                  updates.partnerName = selectedOption.originalName;
                }
                if (
                  selectedOption?.originalLicensePlate &&
                  !formData.licensePlate
                ) {
                  updates.licensePlate = selectedOption.originalLicensePlate;
                }
                setFormData((prev) => ({ ...prev, ...updates }));
              }}
              fallbackLabel={
                voucher?.case?.soChungTu
                  ? voucher.case.bienSoXe
                    ? `${voucher.case.bienSoXe} - ${voucher.case.soChungTu}`
                    : voucher.case.soChungTu
                  : undefined
              }
              fallbackTooltipContent={
                voucher?.case
                  ? renderGarageCaseTooltipContent({
                      bienSoXe: voucher.case.bienSoXe,
                      soChungTu: voucher.case.soChungTu,
                      id: voucher.case.id,
                      khachHangName: voucher.case.khachHangName,
                    })
                  : undefined
              }
            />
          </DrawerField>
          <DrawerField label="Đối tác">
            <Input
              value={formData.partnerName || ""}
              onChange={handleFieldChange("partnerName")}
              className="w-full h-8 text-sm"
            />
          </DrawerField>
          <DrawerField label="Biển số xe">
            <Input
              value={formData.licensePlate || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  licensePlate: e.target.value.toUpperCase(),
                }))
              }
              placeholder="VD: 51A-123.45"
              className="w-full h-8 text-sm font-mono uppercase"
            />
          </DrawerField>
          <div className="col-span-1 md:col-span-2">
            <DrawerField label="Ghi chú">
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
