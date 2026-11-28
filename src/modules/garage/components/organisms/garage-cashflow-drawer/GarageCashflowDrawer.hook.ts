import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/core/config/uiStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { auditCoreApi } from "@/modules/system/api/usersCoreApi";
import { useT } from "@/core/i18n";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import { useGarageCashflowMutations } from "../garage-cashflow-table/GarageCashflowTable.mutations";
import {
  V2DrawerMode,
  type DrawerModeType,
  type InitialCashflowData,
} from "./GarageCashflowDrawer.type";
import { useGarageCashflowDuplicateGuard } from "./useGarageCashflowDuplicateGuard";
import {
  buildInitialFormData,
  buildCreatePayload,
  buildUpdatePayload,
} from "./GarageCashflowDrawer.state";
import {
  duplicateFieldsChanged,
  buildBaselineCashflowAuditItems,
  mergeAuditItems,
} from "./GarageCashflowDrawer.helper";
import { findFormViolation } from "./garageCashflowDrawer.rules";
import { formatGarageVoucherViolation } from "../../../utils/garageCashflowVoucherRules";
import { isQrAccountNumberInvalid } from "./useGarageCashflowPaymentQr.helper";
import type { DrawerAuditLogItem } from "@/shared/components/drawer/DrawerAuditTimeline";
import { useAuthStore } from "@/modules/auth/domain/authStore";

/** Toast của app đi qua V2Toaster; `react-hot-toast` không được mount nên không hiện. */
const showError = (title: string) =>
  useUIStore.getState().showToast({ title, variant: "destructive" });

interface UseGarageCashflowDrawerParams {
  open: boolean;
  onClose: () => void;
  voucher: GarageCashflowVoucher | null;
  initialMode?: V2DrawerMode | "view" | "edit" | "create";
  initialData?: InitialCashflowData;
  onSuccess?: () => void;
}

export function useGarageCashflowDrawer({
  open,
  onClose,
  voucher,
  initialMode = V2DrawerMode.VIEW,
  initialData,
  onSuccess,
}: UseGarageCashflowDrawerParams) {
  const t = useT();
  const { createMutation, updateMutation } = useGarageCashflowMutations();

  const canCreate = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.CREATE,
  );
  const canUpdate = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.UPDATE,
  );

  const [mode, setMode] = useState<DrawerModeType>(() =>
    initialMode === V2DrawerMode.CREATE
      ? V2DrawerMode.EDIT
      : (initialMode as DrawerModeType),
  );

  const [formData, setFormData] = useState<
    Partial<CreateGarageCashflowVoucherDto>
  >(() => buildInitialFormData(voucher, initialData));

  useEffect(() => {
    if (open) {
      setMode(
        initialMode === V2DrawerMode.CREATE
          ? V2DrawerMode.EDIT
          : (initialMode as DrawerModeType),
      );
      setFormData(buildInitialFormData(voucher, initialData));
    }
  }, [open, voucher, initialMode, initialData]);

  const duplicateGuard = useGarageCashflowDuplicateGuard();
  const canSave = initialMode === V2DrawerMode.CREATE ? canCreate : canUpdate;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    if (isQrAccountNumberInvalid(formData.qrAccountNumber)) {
      showError(t("garage:cashflowDrawer.accountNumberInvalid"));
      return;
    }

    const violation = findFormViolation(
      formData,
      initialMode === "create" ? null : voucher,
    );
    if (violation) {
      showError(formatGarageVoucherViolation(violation, t));
      return;
    }

    if (initialMode === "create") {
      const createDto = buildCreatePayload(formData);
      const submit = () =>
        createMutation.mutate(createDto, {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        });
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
      const updateDto = buildUpdatePayload(formData, voucher);
      const submit = () =>
        updateMutation.mutate(
          { id: voucher.id, data: updateDto },
          {
            onSuccess: () => {
              onSuccess?.();
              onClose();
            },
          },
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
            caseId: updateDto.caseId ?? undefined,
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
    duplicateGuard,
    onSuccess,
    onClose,
    t,
  ]);

  const { data: remoteAuditLogs, isLoading: isAuditLoading } = useQuery({
    queryKey: ["garage-cashflow-audit", voucher?.id],
    queryFn: () =>
      auditCoreApi.getEntityTimeline(
        "garage_cashflow_voucher",
        voucher?.id || "",
      ),
    enabled: Boolean(open && voucher?.id),
    staleTime: 30000,
  });

  const currentUserEmail = useAuthStore(
    (s) => s.profile?.email || s.employee?.email,
  );

  const auditItems = useMemo<DrawerAuditLogItem[]>(() => {
    if (!voucher) return [];
    const baseline = buildBaselineCashflowAuditItems(
      voucher,
      t,
      currentUserEmail,
    );
    return mergeAuditItems(baseline, remoteAuditLogs, t);
  }, [voucher, remoteAuditLogs, currentUserEmail, t]);

  return {
    mode,
    setMode,
    formData,
    setFormData,
    canUpdate,
    canSave,
    handleSave,
    isPending: createMutation.isPending || updateMutation.isPending,
    duplicate: duplicateGuard,
    auditItems,
    isAuditLoading,
  };
}
