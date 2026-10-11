import { useState, useEffect, useCallback } from "react";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import { useGarageCashflowList } from "../../../hooks/useGarageCashflowList";
import type { DrawerModeType } from "./GarageCashflowDrawer.type";

interface UseGarageCashflowDrawerParams {
  open: boolean;
  onClose: () => void;
  voucher: GarageCashflowVoucher | null;
  initialMode?: "view" | "edit" | "create";
}

export function useGarageCashflowDrawer({
  open,
  onClose,
  voucher,
  initialMode = "view",
}: UseGarageCashflowDrawerParams) {
  const { createMutation, updateMutation } = useGarageCashflowList();

  const canCreate = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.CREATE,
  );
  const canUpdate = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.UPDATE,
  );

  const [mode, setMode] = useState<DrawerModeType>(() => {
    if (initialMode === "create") return "edit";
    return initialMode as DrawerModeType;
  });

  const [formData, setFormData] = useState<
    Partial<CreateGarageCashflowVoucherDto>
  >({});

  useEffect(() => {
    if (open) {
      const targetMode =
        initialMode === "create" ? "edit" : (initialMode as DrawerModeType);
      setMode(targetMode);

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

  const canSave = initialMode === "create" ? canCreate : canUpdate;

  const handleSave = useCallback(() => {
    if (!canSave) return;

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
  }, [
    canSave,
    initialMode,
    formData,
    voucher,
    createMutation,
    updateMutation,
    onClose,
  ]);

  return {
    mode,
    setMode,
    formData,
    setFormData,
    canCreate,
    canUpdate,
    canSave,
    handleSave,
    isPending: createMutation.isPending || updateMutation.isPending,
  };
}
