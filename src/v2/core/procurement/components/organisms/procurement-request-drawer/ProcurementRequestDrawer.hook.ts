import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  availableProcurementActions,
  PROCUREMENT_REQUEST_FROM,
  todayIsoDate,
  type ProcurementActionKey,
} from "../../../procurement.rules";
import {
  emptyRequestForm,
  hasRequestFormErrors,
  requestFormFromDetail,
  toRequestCreatePayload,
  toRequestHeaderPayload,
  toRequestLinesPayload,
  validateRequestForm,
  type ProcurementRequestFormErrors,
  type ProcurementRequestFormValue,
} from "../../../form/procurementRequest.form";
import { isProcurementFormDirty } from "../../../form/procurementDirty";
import type { ProcurementRequestDetail } from "../../../procurement.types";
import {
  showProcurementError,
  showProcurementSuccess,
  showProcurementWarning,
} from "../../../procurement.toast";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";

export type ProcurementDrawerTabKey = "general" | "audit" | "traceability";

/**
 * Trạng thái drawer PR. Đầu đề (chi nhánh, ngày, nội dung) chỉ nhập lúc tạo;
 * khi nháp, sửa được dòng hàng qua `replaceLines`.
 * Chế độ view/edit do `props.mode` quyết định lúc mở; list remount khi đổi mode (key).
 */
export function useProcurementRequestDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const creating = !props.documentId;
  const [mode, setMode] = React.useState(props.mode);
  const [tab, setTab] = React.useState<ProcurementDrawerTabKey>("general");
  const [form, setForm] = React.useState<ProcurementRequestFormValue>(() =>
    emptyRequestForm(todayIsoDate()),
  );
  const [initial, setInitial] = React.useState<ProcurementRequestFormValue>(
    () => form,
  );
  const [errors, setErrors] = React.useState<ProcurementRequestFormErrors>({});
  const [discardOpen, setDiscardOpen] = React.useState(false);

  const detail = useQuery({
    queryKey: [props.queryKey, "detail", props.documentId],
    queryFn: () =>
      props.api.get(props.documentId!) as Promise<ProcurementRequestDetail>,
    enabled: props.open && !creating,
  });

  React.useEffect(() => {
    if (!props.open) return;
    setErrors({});
    setTab("general");
    if (detail.data) {
      const next = requestFormFromDetail(detail.data);
      setForm(next);
      setInitial(next);
    } else if (creating) {
      const empty = emptyRequestForm(todayIsoDate());
      setForm(empty);
      setInitial(empty);
    }
  }, [props.open, detail.data, creating]);

  const status = detail.data?.status ?? "DRAFT";
  // Chỉ sửa được khi đã tải xong và là nháp; trước khi tải, status mặc định không đáng tin
  const editable = creating || (Boolean(detail.data) && status === "DRAFT");
  const readOnly = !editable || mode === "view";
  const viewing = !creating && readOnly;
  const dirty = isProcurementFormDirty(form, initial);

  const availableActions = React.useMemo<ProcurementActionKey[]>(() => {
    if (creating || !detail.data) return [];
    return availableProcurementActions(PROCUREMENT_REQUEST_FROM, status);
  }, [creating, detail.data, status]);

  const save = useMutation({
    mutationFn: async () => {
      if (creating) return props.api.create(toRequestCreatePayload(form));
      await props.api.updateHeader?.(
        props.documentId!,
        toRequestHeaderPayload(form),
      );
      await props.api.replaceLines(
        props.documentId!,
        toRequestLinesPayload(form),
      );
      return { id: props.documentId! };
    },
    onSuccess: ({ id }) => {
      showProcurementSuccess(
        t("v2.procurement.drawer.savedRequest", "Đã lưu đề nghị mua"),
      );
      void queryClient.invalidateQueries({ queryKey: [props.queryKey] });
      if (props.onSaved) props.onSaved(id);
      else props.onClose();
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.drawer.saveError", "Không lưu được chứng từ"),
      ),
  });

  const setField = <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const next = validateRequestForm(form);
    setErrors(next);
    if (hasRequestFormErrors(next)) {
      showProcurementWarning(
        t("v2.procurement.drawer.missingInfo", "Thiếu thông tin"),
        t(
          "v2.procurement.drawer.fillRequired",
          "Vui lòng điền các trường bắt buộc",
        ),
      );
      return;
    }
    save.mutate();
  };

  /** Hủy sửa: tạo mới thì đóng; bản ghi cũ có thay đổi thì hỏi trước, rồi về chế độ xem. */
  const cancelEdit = () => {
    if (creating) props.onClose();
    else if (dirty) setDiscardOpen(true);
    else setMode("view");
  };

  const confirmDiscard = () => {
    setForm(initial);
    setErrors({});
    setDiscardOpen(false);
    setMode("view");
  };

  return {
    form,
    setField,
    errors,
    creating,
    headerViewing: viewing,
    linesViewing: viewing,
    editable,
    viewing,
    dirty,
    /** Chi nhánh khóa sau khi tạo: PO đã liên kết có thể đang dùng chi nhánh cũ */
    branchLocked: !creating,
    mode,
    setMode,
    tab,
    setTab,
    status,
    availableActions,
    detail: detail.data,
    loading: detail.isFetching,
    saving: save.isPending,
    submit,
    cancelEdit,
    discardOpen,
    closeDiscard: () => setDiscardOpen(false),
    confirmDiscard,
  };
}
