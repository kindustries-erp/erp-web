import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  toOrderCreatePayload,
  toOrderHeaderPayload,
  type ProcurementOrderFormValue,
} from "../../../form/procurementOrder.form";
import { toOrderLinePayload } from "../../../form/procurementLine.form";
import { hasOrderSupplier } from "../../../form/procurementOrder.supplier";
import type { ProcurementApi } from "../../../procurement.types";
import {
  showProcurementError,
  showProcurementSuccess,
  showProcurementWarning,
} from "../../../procurement.toast";

export interface UseProcurementOrderSaveInput {
  api: ProcurementApi<unknown>;
  queryKey: string;
  /** Id đơn đang mở; null khi tạo mới */
  documentId: string | null;
  branchOptional: boolean;
  form: ProcurementOrderFormValue;
  /** Kiểm tra trường bắt buộc và báo lỗi; trả về false nếu còn thiếu */
  validate: () => boolean;
  onSaved?: (id: string) => void;
  onClose: () => void;
}

/**
 * Lưu nháp và gửi duyệt của drawer PO. Sau khi tạo, đơn được nhớ trong phiên (`createdId`)
 * để bấm lại chỉ cập nhật đơn đó, không tạo đơn thứ hai (tránh giữ số lượng PR hai lần).
 * Chống bấm đúp bằng cờ `busy` và trạng thái pending của mutation.
 */
export function useProcurementOrderSave(input: UseProcurementOrderSaveInput) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const { api, queryKey, documentId, branchOptional, form } = input;
  const [createdId, setCreatedId] = React.useState<string | null>(null);
  const targetId = documentId ?? createdId;
  const busy = React.useRef(false);
  const persistedRef = React.useRef(false);

  /** Ghi nháp: tạo đơn (lần đầu) hoặc cập nhật đầu đơn và dòng; trả về id đơn. */
  const persist = async (): Promise<{ id: string }> => {
    persistedRef.current = false;
    if (!targetId) {
      const created = await api.create(toOrderCreatePayload(form));
      setCreatedId(created.id);
      persistedRef.current = true;
      return { id: created.id };
    }
    await api.updateHeader?.(
      targetId,
      toOrderHeaderPayload(form, branchOptional),
    );
    await api.replaceLines(targetId, form.lines.map(toOrderLinePayload));
    persistedRef.current = true;
    return { id: targetId };
  };

  const onDone = () => {
    busy.current = false;
  };

  const finish = (id: string) => {
    void queryClient.invalidateQueries({ queryKey: [queryKey] });
    if (input.onSaved) input.onSaved(id);
    else input.onClose();
  };

  const saveDraftMutation = useMutation({
    mutationFn: persist,
    onSuccess: ({ id }) => {
      showProcurementSuccess(
        t("v2.procurement.drawer.saved", "Đã lưu đơn mua"),
      );
      finish(id);
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.drawer.saveError", "Không lưu được đơn mua"),
      ),
    onSettled: onDone,
  });

  /**
   * Khóa duyệt tắt: lưu rồi ghi nhận luôn. Họ có `saveAndSubmit` (Garage) gọi MỘT request, server
   * lưu và ghi nhận trong một transaction nên lỗi không để lại nháp giữ số lượng PR. Họ khác giữ luồng cũ.
   */
  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (api.saveAndSubmit) {
        const body = targetId
          ? {
              ...toOrderHeaderPayload(form, branchOptional),
              lines: form.lines.map(toOrderLinePayload),
            }
          : toOrderCreatePayload(form);
        persistedRef.current = false;
        return api.saveAndSubmit(targetId, body);
      }
      const { id } = await persist();
      await api.transition(id, "submit");
      return { id };
    },
    onSuccess: ({ id }) => {
      showProcurementSuccess(
        t("v2.procurement.drawer.confirmed", "Đã ghi nhận đơn mua"),
      );
      finish(id);
    },
    onError: (error) =>
      showProcurementError(
        error,
        persistedRef.current
          ? t(
              "v2.procurement.drawer.savedNotConfirmed",
              "Đã lưu nháp, chưa ghi nhận đơn mua",
            )
          : t(
              "v2.procurement.drawer.confirmError",
              "Không ghi nhận được đơn mua",
            ),
      ),
    onSettled: onDone,
  });

  const saveDraft = () => {
    if (busy.current || !input.validate()) return;
    busy.current = true;
    saveDraftMutation.mutate();
  };

  const confirmSubmit = () => {
    if (busy.current || !input.validate()) return;
    if (!hasOrderSupplier(form)) {
      showProcurementWarning(
        t("v2.procurement.drawer.missingInfo", "Thiếu thông tin"),
        t(
          "v2.procurement.drawer.supplierRequired",
          "Cần nhập hoặc chọn nhà cung cấp trước khi gửi duyệt",
        ),
      );
      return;
    }
    busy.current = true;
    confirmMutation.mutate();
  };

  return {
    saveDraft,
    confirmSubmit,
    saving: saveDraftMutation.isPending || confirmMutation.isPending,
  };
}
