import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementApi } from "../../../procurement.types";
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

export interface ProcurementRequestSaveVars {
  /** true: lưu và gửi duyệt trong một request (Tạo mới / Cập nhật) */
  submit?: boolean;
  /** Người duyệt đã chọn trước; bỏ trống khi khóa duyệt tắt */
  approverId?: string | null;
}

/**
 * Lưu đề nghị. Lưu nháp: tạo mới, hoặc cập nhật đầu đề và thay dòng khi còn nháp.
 * Tạo mới / Cập nhật (`submit`): một request `saveAndSubmit`, server lưu rồi gửi duyệt trong một
 * transaction nên lỗi gửi duyệt không để lại nháp mồ côi.
 */
export function useProcurementRequestSave(
  input: UseProcurementRequestSaveInput,
) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const { api, queryKey, documentId, creating, form, branchOptional } = input;

  return useMutation<
    { id: string },
    unknown,
    ProcurementRequestSaveVars | undefined
  >({
    mutationFn: async (vars) => {
      if (vars?.submit && api.saveAndSubmit) {
        const approver = vars.approverId ? { approverId: vars.approverId } : {};
        const body = creating
          ? { ...toRequestCreatePayload(form), ...approver }
          : {
              ...toRequestHeaderPayload(form, branchOptional),
              lines: toRequestLinesPayload(form),
              ...approver,
            };
        return api.saveAndSubmit(creating ? null : documentId, body);
      }
      if (creating) return api.create(toRequestCreatePayload(form));
      await api.updateHeader?.(
        documentId!,
        toRequestHeaderPayload(form, branchOptional),
      );
      await api.replaceLines(documentId!, toRequestLinesPayload(form));
      return { id: documentId! };
    },
    onSuccess: ({ id }, vars) => {
      showProcurementSuccess(
        vars?.submit
          ? t(
              "v2.procurement.drawer.submittedRequest",
              "Đã gửi duyệt đề nghị mua",
            )
          : t("v2.procurement.drawer.savedRequest", "Đã lưu đề nghị mua"),
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
