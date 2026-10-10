import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  DrawerRow,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";

import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { DatePicker } from "@/shared/components/DatePicker";

import { PaymentMethodCombobox } from "../../molecules/payment-method-combobox";
import { GarageCaseCombobox } from "../garage-case-combobox";
import { ErpBankTransactionCombobox } from "../erp-bank-transaction-combobox";
import { ErpCashVoucherCombobox } from "../erp-cash-voucher-combobox";

import type {
  GarageCashflowVoucher,
  CreateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";
import { useGarageCashflowList } from "../../../hooks/useGarageCashflowList";

export interface GarageCashflowDrawerProps {
  open: boolean;
  onClose: () => void;
  voucher: GarageCashflowVoucher | null;
  initialMode?: "view" | "edit" | "create";
}

type DrawerModeType = "view" | "edit";

export const GarageCashflowDrawer: React.FC<GarageCashflowDrawerProps> = ({
  open,
  onClose,
  voucher,
  initialMode = "view",
}) => {
  const { createMutation, updateMutation } = useGarageCashflowList();
  const [mode, setMode] = useState<DrawerModeType>(
    initialMode === "create" ? "edit" : (initialMode as DrawerModeType),
  );

  const [formData, setFormData] = useState<
    Partial<CreateGarageCashflowVoucherDto>
  >({});

  useEffect(() => {
    if (open) {
      setMode(
        initialMode === "create" ? "edit" : (initialMode as DrawerModeType),
      );
      if (voucher) {
        setFormData({
          ...voucher,
          voucherType: (voucher.voucherType || "").toUpperCase() as
            | "RECEIPT"
            | "PAYMENT",
          voucherCode: voucher.voucherCode || "",
          transDate: voucher.transDate
            ? voucher.transDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          amount: voucher.amount,
          partnerName: voucher.partnerName || voucher.case?.khachHangName || "",
          partnerPhone: voucher.partnerPhone || "",
          note: voucher.note || "",
          paymentMethod: voucher.paymentMethod || "",
          referenceNumber: voucher.referenceNumber || "",
          caseId: voucher.caseId || "",
          erpBankTransactionId: voucher.erpBankTransactionId || "",
          erpCashVoucherId: voucher.erpCashVoucherId || "",
        });
      } else {
        setFormData({
          voucherType: "RECEIPT",
          transDate: new Date().toISOString().slice(0, 10),
          amount: 0,
        });
      }
    }
  }, [open, voucher, initialMode]);

  const handleSave = () => {
    if (initialMode === "create") {
      createMutation.mutate(formData as CreateGarageCashflowVoucherDto, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (voucher) {
      updateMutation.mutate(
        { id: voucher.id, data: formData },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <StandardFormDrawer
      open={open}
      onClose={onClose}
      mode={mode}
      onToggleEdit={() => setMode("edit")}
      layout="1-column"
      size="md"
      title={
        initialMode === "create"
          ? "Tạo Phiếu Thu Chi Mới"
          : `Phiếu ${voucher?.voucherCode || ""}`
      }
      titleExtra={
        voucher && (
          <Badge variant="outline">
            {(voucher.voucherType || "").toUpperCase() === "RECEIPT"
              ? "Thu"
              : "Chi"}
          </Badge>
        )
      }
      actions={[
        { label: "Đóng", onClick: onClose, variant: "outline" },
        ...(mode === "edit"
          ? [
              {
                label: "Lưu",
                onClick: handleSave,
                primary: true,
                loading: createMutation.isPending || updateMutation.isPending,
              },
            ]
          : []),
      ]}
      confirmOnClose={mode === "edit"}
      leftPanel={
        <div className="space-y-4 pb-4">
          <DrawerSection title="THÔNG TIN CHUNG">
            {mode === "edit" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DrawerField label="Ngày giao dịch" required>
                  <DatePicker
                    value={formData.transDate || ""}
                    onChange={(val: string) =>
                      setFormData({ ...formData, transDate: val })
                    }
                    className="w-full"
                  />
                </DrawerField>
                <DrawerField label="Loại phiếu" required>
                  <Combobox
                    value={formData.voucherType || ""}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        voucherType: val as "RECEIPT" | "PAYMENT",
                      })
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Phương thức TT">
                  <PaymentMethodCombobox
                    value={formData.paymentMethod || ""}
                    onChange={(val: string) =>
                      setFormData({
                        ...formData,
                        paymentMethod: val,
                      })
                    }
                  />
                </DrawerField>
                <DrawerField label="Mã chứng từ">
                  <Input
                    value={formData.voucherCode || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, voucherCode: e.target.value })
                    }
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
                      setFormData({ ...formData, ...updates });
                    }}
                    fallbackLabel={
                      voucher?.case?.soChungTu
                        ? voucher.case.soChungTu
                        : undefined
                    }
                  />
                </DrawerField>
                <DrawerField label="Đối tác">
                  <Input
                    value={formData.partnerName || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, partnerName: e.target.value })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="SĐT Đối tác">
                  <Input
                    value={formData.partnerPhone || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        partnerPhone: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <div className="col-span-1 md:col-span-2">
                  <DrawerField label="Ghi chú">
                    <Textarea
                      value={formData.note || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
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
                <DrawerRow
                  label="Mã chứng từ"
                  value={voucher?.voucherCode || "—"}
                />
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
                  value={
                    voucher?.partnerName || voucher?.case?.khachHangName || "—"
                  }
                />
                <DrawerRow
                  label="SĐT Đối tác"
                  value={voucher?.partnerPhone || "—"}
                />
                <div className="col-span-1 md:col-span-2">
                  <DrawerRow label="Ghi chú" value={voucher?.note || "—"} />
                </div>
              </div>
            )}
          </DrawerSection>

          <DrawerSection
            title="THAM CHIẾU LIÊN KẾT"
            collapsible
            defaultCollapsed={false}
          >
            {mode === "edit" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DrawerField label="Tham chiếu ERP Bank">
                  <ErpBankTransactionCombobox
                    value={formData.erpBankTransactionId || ""}
                    onChange={(val: string) =>
                      setFormData({
                        ...formData,
                        erpBankTransactionId: val,
                      })
                    }
                    fallbackLabel={
                      voucher?.erpBankTransaction
                        ? voucher.erpBankTransaction.referenceNumber ||
                          voucher.erpBankTransaction.seqNo ||
                          voucher.erpBankTransaction.id
                        : undefined
                    }
                  />
                </DrawerField>
                <DrawerField label="Tham chiếu ERP Cash">
                  <ErpCashVoucherCombobox
                    value={formData.erpCashVoucherId || ""}
                    onChange={(val: string) =>
                      setFormData({
                        ...formData,
                        erpCashVoucherId: val,
                      })
                    }
                    fallbackLabel={
                      voucher?.erpCashVoucher
                        ? voucher.erpCashVoucher.referenceNumber ||
                          voucher.erpCashVoucher.seqNo ||
                          voucher.erpCashVoucher.id
                        : undefined
                    }
                  />
                </DrawerField>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <DrawerRow
                  label="Tham chiếu ERP Bank"
                  value={
                    voucher?.erpBankTransaction
                      ? voucher.erpBankTransaction.referenceNumber ||
                        voucher.erpBankTransaction.seqNo ||
                        voucher.erpBankTransaction.id
                      : voucher?.erpBankTransactionId || "—"
                  }
                />
                <DrawerRow
                  label="Tham chiếu ERP Cash"
                  value={
                    voucher?.erpCashVoucher
                      ? voucher.erpCashVoucher.referenceNumber ||
                        voucher.erpCashVoucher.seqNo ||
                        voucher.erpCashVoucher.id
                      : voucher?.erpCashVoucherId || "—"
                  }
                />
              </div>
            )}
          </DrawerSection>
        </div>
      }
    />
  );
};
