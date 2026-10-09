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
          voucher_type: (voucher.voucher_type || "").toUpperCase() as
            | "RECEIPT"
            | "PAYMENT",
          amount: voucher.amount,
          partner_name: voucher.partner_name || "",
          partner_phone: voucher.partner_phone || "",
          description: voucher.description || "",
          payment_method: voucher.payment_method || "",
          reference_number: voucher.reference_number || "",
          case_id: voucher.case_id || "",
          erp_bank_transaction_id: voucher.erp_bank_transaction_id || "",
          erp_cash_transaction_id: voucher.erp_cash_transaction_id || "",
        });
      } else {
        setFormData({
          voucher_type: "RECEIPT",
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
          : `Phiếu ${voucher?.voucher_code || ""}`
      }
      titleExtra={
        voucher && (
          <Badge variant="outline">
            {(voucher.voucher_type || "").toUpperCase() === "RECEIPT"
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
                    value={formData.voucher_type || ""}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        voucher_type: val as "RECEIPT" | "PAYMENT",
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
                    value={formData.partner_name || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, partner_name: e.target.value })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="SĐT Đối tác">
                  <Input
                    value={formData.partner_phone || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        partner_phone: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Diễn giải">
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
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
                    (voucher?.voucher_type || "").toUpperCase() === "RECEIPT"
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
                  value={voucher?.partner_name || "—"}
                />
                <DrawerRow
                  label="SĐT Đối tác"
                  value={voucher?.partner_phone || "—"}
                />
                <DrawerRow
                  label="Diễn giải"
                  value={voucher?.description || "—"}
                />
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
                    value={formData.payment_method || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                    placeholder="Tiền mặt, Chuyển khoản..."
                  />
                </DrawerField>
                <DrawerField label="Mã tham chiếu">
                  <Input
                    value={formData.reference_number || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        reference_number: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Mã Phiếu Dịch Vụ (Garage Case)">
                  <Input
                    value={formData.case_id || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, case_id: e.target.value })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Tham chiếu ERP Bank">
                  <Input
                    value={formData.erp_bank_transaction_id || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        erp_bank_transaction_id: e.target.value,
                      })
                    }
                    className="w-full h-8 text-sm"
                  />
                </DrawerField>
                <DrawerField label="Tham chiếu ERP Cash">
                  <Input
                    value={formData.erp_cash_transaction_id || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        erp_cash_transaction_id: e.target.value,
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
                  value={voucher?.payment_method || "—"}
                />
                <DrawerRow
                  label="Mã tham chiếu"
                  value={voucher?.reference_number || "—"}
                />
                <DrawerRow
                  label="Mã Phiếu Dịch Vụ"
                  value={voucher?.case_id || "—"}
                />
                <DrawerRow
                  label="Tham chiếu ERP Bank"
                  value={voucher?.erp_bank_transaction_id || "—"}
                />
                <DrawerRow
                  label="Tham chiếu ERP Cash"
                  value={voucher?.erp_cash_transaction_id || "—"}
                />
              </div>
            )}
          </DrawerSection>
        </div>
      }
    />
  );
};
