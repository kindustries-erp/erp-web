import React from "react";
import {
  DrawerSection,
  DrawerField,
  DrawerRow,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { DatePicker } from "@/shared/components/DatePicker";
import { PaymentMethodCombobox } from "../../molecules/payment-method-combobox";
import { GarageCaseCombobox } from "../garage-case-combobox";
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
          <DrawerField label="Phương thức TT">
            <PaymentMethodCombobox
              value={formData.paymentMethod || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, paymentMethod: val }))
              }
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
                setFormData((prev) => ({ ...prev, ...updates }));
              }}
              fallbackLabel={
                voucher?.case?.soChungTu ? voucher.case.soChungTu : undefined
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
          <DrawerField label="SĐT Đối tác">
            <Input
              value={formData.partnerPhone || ""}
              onChange={handleFieldChange("partnerPhone")}
              className="w-full h-8 text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <DrawerRow
            label="Ngày giao dịch"
            value={
              voucher?.transDate
                ? new Date(voucher.transDate).toLocaleDateString("vi-VN")
                : "—"
            }
          />
          <DrawerRow
            label="Loại phiếu"
            value={
              (voucher?.voucherType || "").toUpperCase() === "RECEIPT"
                ? "Phiếu Thu"
                : "Phiếu Chi"
            }
          />
          <DrawerRow
            label="Số tiền"
            value={`${(voucher?.amount || 0).toLocaleString("vi-VN")} đ`}
          />
          <DrawerRow
            label="Phương thức TT"
            value={voucher?.paymentMethod || "—"}
          />
          <DrawerRow label="Mã chứng từ" value={voucher?.voucherCode || "—"} />
          <DrawerRow
            label="Mã Phiếu Dịch Vụ"
            value={
              voucher?.case?.soChungTu
                ? voucher.case.soChungTu
                : voucher?.caseId || "—"
            }
          />
          <DrawerRow
            label="Đối tác"
            value={voucher?.partnerName || voucher?.case?.khachHangName || "—"}
          />
          <DrawerRow label="SĐT Đối tác" value={voucher?.partnerPhone || "—"} />
          <div className="col-span-1 md:col-span-2">
            <DrawerRow label="Ghi chú" value={voucher?.note || "—"} />
          </div>
        </div>
      )}
    </DrawerSection>
  );
};
