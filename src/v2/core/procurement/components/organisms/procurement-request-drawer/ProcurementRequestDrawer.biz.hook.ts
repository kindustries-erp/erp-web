import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import type {
  DrawerAction,
  V2DropdownEntry,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementActionKey } from "../../../procurement.rules";
import type {
  ProcurementApi,
  ProcurementDocumentRef,
  ProcurementRequestDetail,
} from "../../../procurement.types";
import {
  toRequestCreatePayload,
  toRequestHeaderPayload,
  toRequestLinesPayload,
  type ProcurementRequestFormValue,
} from "../../../form/procurementRequest.form";
import {
  showProcurementError,
  showProcurementSuccess,
} from "../../../procurement.toast";

export interface UseProcurementDrawerActionsInput {
  viewing: boolean;
  canUpdate: boolean;
  availableActions: ProcurementActionKey[];
  detail?: ProcurementRequestDetail;
  saving: boolean;
  loading: boolean;
  onClose: () => void;
  /** Hủy sửa: về chế độ xem (có xác nhận nếu đã đổi) */
  onCancelEdit: () => void;
  onSubmit: () => void;
  onTransition?: (
    action: ProcurementActionKey,
    row?: ProcurementDocumentRef,
  ) => void;
}

/** Hook quản lý thanh nút và menu thao tác của Drawer đề nghị mua. */
export function useProcurementDrawerActions(
  input: UseProcurementDrawerActionsInput,
) {
  const { t } = useV2Translation();
  const {
    viewing,
    canUpdate,
    availableActions,
    detail,
    saving,
    loading,
    onClose,
    onCancelEdit,
    onSubmit,
    onTransition,
  } = input;

  const currentUserId = useAuthStore((s) => s.profile?.id ?? null);
  const currentUserEmail = useAuthStore(
    (s) => s.profile?.email ?? s.employee?.email ?? null,
  );

  const isSubmitAllowed = React.useMemo(() => {
    if (!detail) return true;
    const hasCreatorInfo = Boolean(detail.createdBy || detail.createdByEmail);
    if (!hasCreatorInfo) return true;
    const idMatch = Boolean(
      detail.createdBy && currentUserId && detail.createdBy === currentUserId,
    );
    const emailMatch = Boolean(
      detail.createdByEmail &&
      currentUserEmail &&
      detail.createdByEmail.toLowerCase() === currentUserEmail.toLowerCase(),
    );
    return idMatch || emailMatch;
  }, [detail, currentUserId, currentUserEmail]);

  const actionDropdownItems: V2DropdownEntry[] = React.useMemo(() => {
    if (!viewing || !canUpdate || !onTransition) return [];
    return availableActions.map((action) => {
      let disabled = false;
      let disabledReason: string | undefined;
      if (action === "submit" && !isSubmitAllowed) {
        disabled = true;
        disabledReason = t(
          "v2.procurement.actions.submitNotCreatorReason",
          "Chỉ người tạo mới được gửi duyệt",
        );
      }
      return {
        id: action,
        label: t(`v2.procurement.actions.${action}`, action),
        onClick: () => !disabled && onTransition(action, detail),
        danger: action === "cancel" || action === "reject",
        disabled,
        disabledReason,
      };
    });
  }, [
    viewing,
    canUpdate,
    onTransition,
    availableActions,
    detail,
    isSubmitAllowed,
    t,
  ]);

  const actions: DrawerAction[] = React.useMemo(() => {
    if (viewing) {
      const list: DrawerAction[] = [
        {
          label: t("v2.common.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ];
      if (canUpdate && onTransition) {
        // Nút chính đứng sau "Đóng" để nằm bên phải (footer render theo thứ tự mảng)
        if (availableActions.includes("approve")) {
          list.push({
            label: t("v2.procurement.actions.approve", "Duyệt"),
            onClick: () => onTransition("approve", detail),
            primary: true,
          });
        } else if (availableActions.includes("submit")) {
          list.push({
            label: t("v2.procurement.actions.submit", "Gửi duyệt"),
            onClick: () => isSubmitAllowed && onTransition("submit", detail),
            primary: true,
            disabled: !isSubmitAllowed,
            disabledReason: !isSubmitAllowed
              ? t(
                  "v2.procurement.actions.submitNotCreatorReason",
                  "Chỉ người tạo mới được gửi duyệt",
                )
              : undefined,
          });
        }
      }
      return list;
    }
    return [
      {
        label: t("v2.common.cancel", "Hủy"),
        onClick: onCancelEdit,
        variant: "outline",
        disabled: saving,
      },
      {
        label: t("v2.procurement.actions.saveDraft", "Lưu nháp"),
        onClick: onSubmit,
        primary: true,
        loading: saving,
        disabled: saving || loading,
      },
    ];
  }, [
    viewing,
    onClose,
    onCancelEdit,
    canUpdate,
    onTransition,
    availableActions,
    detail,
    saving,
    onSubmit,
    loading,
    t,
  ]);

  return { actions, actionDropdownItems };
}

export interface UseProcurementRequestSaveInput {
  api: ProcurementApi<unknown>;
  queryKey: string;
  documentId: string | null;
  creating: boolean;
  form: ProcurementRequestFormValue;
  branchOptional: boolean;
  onSaved?: (id: string) => void;
  onClose: () => void;
  /** Cập nhật xong (không phải tạo mới): drawer về chế độ xem */
  onUpdated: () => void;
}

/**
 * Lưu đề nghị: tạo mới, hoặc cập nhật đầu đề và thay dòng khi còn nháp.
 * Thành công: làm mới danh sách; sửa xong thì về view trước khi báo `onSaved`.
 */
export function useProcurementRequestSave(
  input: UseProcurementRequestSaveInput,
) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const { api, queryKey, documentId, creating, form, branchOptional } = input;

  return useMutation({
    mutationFn: async () => {
      if (creating) return api.create(toRequestCreatePayload(form));
      await api.updateHeader?.(
        documentId!,
        toRequestHeaderPayload(form, branchOptional),
      );
      await api.replaceLines(documentId!, toRequestLinesPayload(form));
      return { id: documentId! };
    },
    onSuccess: ({ id }) => {
      showProcurementSuccess(
        t("v2.procurement.drawer.savedRequest", "Đã lưu đề nghị mua"),
      );
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (!creating) input.onUpdated();
      if (input.onSaved) input.onSaved(id);
      else input.onClose();
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.drawer.saveError", "Không lưu được chứng từ"),
      ),
  });
}
