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
import { useGarageCashflowDuplicateGuard } from "./useGarageCashflowDuplicateGuard";

const normPlate = (v?: string | null) =>
  (v ?? "").replace(/[^0-9a-zA-Z]/g, "").toUpperCase();

function duplicateFieldsChanged(
  form: Partial<CreateGarageCashflowVoucherDto>,
  voucher: GarageCashflowVoucher,
): boolean {
  return (
    Number(form.amount) !== Number(voucher.amount) ||
    (form.transDate || "") !== (voucher.transDate || "").slice(0, 10) ||
    (form.caseId || "") !== (voucher.caseId || "") ||
    normPlate(form.licensePlate) !== normPlate(voucher.licensePlate)
  );
}

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
          paymentContent: voucher.paymentContent || "",
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

  const duplicateGuard = useGarageCashflowDuplicateGuard();

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
        paymentContent: formData.paymentContent?.trim() || undefined,
        referenceNumber: formData.referenceNumber?.trim() || undefined,
        caseId: formData.caseId?.trim() || undefined,
        erpBankTransactionId:
          formData.erpBankTransactionId?.trim() || undefined,
        erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
      };

      const submit = () =>
        createMutation.mutate(createDto, { onSuccess: () => onClose() });
      if (createDto.amount > 0) {
        duplicateGuard.guard(
          {
            amount: createDto.amount,
            transDate: createDto.transDate,
            caseId: createDto.caseId,
            licensePlate: createDto.licensePlate,
          },
          submit,
        );
      } else {
        submit();
      }
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
        paymentContent: formData.paymentContent?.trim() || undefined,
        referenceNumber: formData.referenceNumber?.trim() || undefined,
        caseId: formData.caseId?.trim() || undefined,
        erpBankTransactionId:
          formData.erpBankTransactionId?.trim() || undefined,
        erpCashVoucherId: formData.erpCashVoucherId?.trim() || undefined,
      };

      const submit = () =>
        updateMutation.mutate(
          { id: voucher.id, data: updateDto },
          { onSuccess: () => onClose() },
        );
      if (
        updateDto.amount &&
        updateDto.amount > 0 &&
        duplicateFieldsChanged(formData, voucher)
      ) {
        duplicateGuard.guard(
          {
            amount: updateDto.amount,
            transDate: updateDto.transDate,
            caseId: updateDto.caseId,
            licensePlate: updateDto.licensePlate,
            excludeId: voucher.id,
          },
          submit,
        );
      } else {
        submit();
      }
    }
  }, [
    canSave,
    initialMode,
    formData,
    voucher,
    createMutation,
    updateMutation,
    onClose,
    duplicateGuard,
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
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      duplicateGuard.isChecking,
    duplicate: duplicateGuard,
  };
}
