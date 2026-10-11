import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import type { GarageCashflowDrawerProps } from "./GarageCashflowDrawer.type";
import { useGarageCashflowDrawer } from "./GarageCashflowDrawer.hook";
import { GarageCashflowDrawerGeneralSection } from "./GarageCashflowDrawerGeneralSection";
import { GarageCashflowDrawerSettlementSection } from "./GarageCashflowDrawerSettlementSection";

export const GarageCashflowDrawer: React.FC<GarageCashflowDrawerProps> = ({
  open,
  onClose,
  voucher,
  initialMode = "view",
}) => {
  const {
    mode,
    setMode,
    formData,
    setFormData,
    canUpdate,
    canSave,
    handleSave,
    isPending,
  } = useGarageCashflowDrawer({
    open,
    onClose,
    voucher,
    initialMode,
  });

  const sectionProps = {
    mode,
    voucher,
    formData,
    setFormData,
  };

  return (
    <StandardFormDrawer
      open={open}
      onClose={onClose}
      mode={mode}
      onToggleEdit={canUpdate ? () => setMode("edit") : undefined}
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
        ...(mode === "edit" && canSave
          ? [
              {
                label: "Lưu",
                onClick: handleSave,
                primary: true,
                loading: isPending,
              },
            ]
          : []),
      ]}
      confirmOnClose={mode === "edit"}
      leftPanel={
        <div className="space-y-4 pb-4">
          <GarageCashflowDrawerGeneralSection {...sectionProps} />
          <GarageCashflowDrawerSettlementSection {...sectionProps} />
        </div>
      }
    />
  );
};
