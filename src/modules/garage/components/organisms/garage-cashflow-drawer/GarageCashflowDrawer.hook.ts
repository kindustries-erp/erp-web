import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { auditCoreApi } from "@/modules/system/api/usersCoreApi";
import { useT } from "@/core/i18n";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";
import { useGarageCashflowList } from "../../../hooks/useGarageCashflowList";
import type { DrawerModeType } from "./GarageCashflowDrawer.type";
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
import type { DrawerAuditLogItem } from "@/shared/components/drawer/DrawerAuditTimeline";
import { useAuthStore } from "@/modules/auth/domain/authStore";

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
  const t = useT();
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
  >(() => buildInitialFormData(voucher));

  useEffect(() => {
    if (open) {
      setMode(
        initialMode === "create" ? "edit" : (initialMode as DrawerModeType),
      );
      setFormData(buildInitialFormData(voucher));
    }
  }, [open, voucher, initialMode]);

  const duplicateGuard = useGarageCashflowDuplicateGuard();
  const canSave = initialMode === "create" ? canCreate : canUpdate;

  const handleSave = useCallback(() => {
    if (!canSave) return;

    if (initialMode === "create") {
      const createDto = buildCreatePayload(formData);
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
      const updateDto = buildUpdatePayload(formData);
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
    duplicateGuard,
    onClose,
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
