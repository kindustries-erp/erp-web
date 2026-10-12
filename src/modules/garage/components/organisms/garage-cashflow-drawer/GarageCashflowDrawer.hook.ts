import { useState, useEffect, useCallback } from "react";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type {
  CreateGarageCashflowVoucherDto,
  UpdateGarageCashflowVoucherDto,
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
          voucherType: (voucher.voucherType || "").toUpperCase() as
            | "RECEIPT"
            | "PAYMENT",
          voucherCode: voucher.voucherCode || "",
          transDate: voucher.transDate
            ? voucher.transDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          amount: Number(voucher.amount) || 0,
          partnerName: voucher.partnerName || voucher.case?.khachHangName || "",
          partnerPhone: voucher.partnerPhone || "",
          licensePlate: voucher.licensePlate || voucher.case?.bienSoXe || "",
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
      const createDto: CreateGarageCashflowVoucherDto = {
        voucherType: (formData.voucherType || "RECEIPT").toUpperCase() as
          | "RECEIPT"
          | "PAYMENT",
        amount: Number(formData.amount) || 0,
        transDate: formData.transDate,
        partnerName: formData.partnerName?.trim() || undefined,
        partnerPhone: formData.partnerPhone?.trim() || undefined,
        licensePlate: formData.licensePlate?.trim() || undefined,
        note: formData.note?.trim() || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        referenceNumber: formData.referenceNumber?.trim() || undefined,
        caseId: formData.caseId?.trim() || undefined,
        erpBankTransactionId:
          formData.erpBankTransactionId?.trim() || undefined,
        erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
      };

      createMutation.mutate(createDto, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (voucher) {
      const updateDto: UpdateGarageCashflowVoucherDto = {
        voucherType: formData.voucherType
          ? (formData.voucherType.toUpperCase() as "RECEIPT" | "PAYMENT")
          : undefined,
        amount: Number(formData.amount) || 0,
        transDate: formData.transDate,
        partnerName: formData.partnerName?.trim() || undefined,
        partnerPhone: formData.partnerPhone?.trim() || undefined,
        licensePlate: formData.licensePlate?.trim() || undefined,
        note: formData.note?.trim() || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        referenceNumber: formData.referenceNumber?.trim() || undefined,
        caseId: formData.caseId?.trim() || undefined,
        erpBankTransactionId:
          formData.erpBankTransactionId?.trim() || undefined,
        erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
      };

      updateMutation.mutate(
        { id: voucher.id, data: updateDto },
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
