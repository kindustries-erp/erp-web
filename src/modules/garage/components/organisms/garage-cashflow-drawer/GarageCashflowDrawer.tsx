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
          amount: voucher.amount,
          partnerName: voucher.partnerName || "",
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
                <DrawerField label="Diễn giải">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
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
                  label="Đối tác"
                  value={voucher?.partnerName || "—"}
                />
                <DrawerRow
                  label="SĐT Đối tác"
                  value={voucher?.partnerPhone || "—"}
                />
                <DrawerRow label="Diễn giải" value={voucher?.note || "—"} />
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
                <DrawerField label="Phương thức TT">
                  <Input
                    value={formData.paymentMethod || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                    placeholder="Tiền mặt, Chuyển khoản..."
                  />
                </DrawerField>
                <DrawerField label="Mã tham chiếu">
                  <Input
                    value={formData.referenceNumber || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        referenceNumber: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Mã Phiếu Dịch Vụ (Garage Case)">
                  <Input
                    value={formData.caseId || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, caseId: e.target.value })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Tham chiếu ERP Bank">
                  <Input
                    value={formData.erpBankTransactionId || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        erpBankTransactionId: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Tham chiếu ERP Cash">
                  <Input
                    value={formData.erpCashVoucherId || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        erpCashVoucherId: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <DrawerRow
                  label="Phương thức TT"
                  value={voucher?.paymentMethod || "—"}
                />
                <DrawerRow
                  label="Mã tham chiếu"
                  value={voucher?.referenceNumber || "—"}
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
                  label="Tham chiếu ERP Bank"
                  value={
                    voucher?.erpBankTransaction?.transactionCode
                      ? voucher.erpBankTransaction.transactionCode
                      : voucher?.erpBankTransactionId || "—"
                  }
                />
                <DrawerRow
                  label="Tham chiếu ERP Cash"
                  value={voucher?.erpCashVoucherId || "—"}
                />
              </div>
            )}
          </DrawerSection>
        </div>
      }
    />
  );
};
