import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
  validateRequestForm,
  type ProcurementRequestFormErrors,
  type ProcurementRequestFormValue,
} from "../../../form/procurementRequest.form";
import { isProcurementFormDirty } from "../../../form/procurementDirty";
import {
  applyApprovalGate,
  NO_APPROVAL_GATE,
} from "../../../approval/approval.gate";
import type { ProcurementRequestDetail } from "../../../procurement.types";
import { showProcurementWarning } from "../../../procurement.toast";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import { useProcurementRequestSave } from "./ProcurementRequestDrawer.biz.hook";

export type ProcurementDrawerTabKey = "general" | "traceability";

/**
 * Trạng thái drawer PR. Đầu đề (chi nhánh, ngày, nội dung) chỉ nhập lúc tạo;
 * khi nháp, sửa được dòng hàng qua `replaceLines`.
 * Chế độ view/edit do `props.mode` quyết định lúc mở; list remount khi đổi mode (key).
 */
export function useProcurementRequestDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const creating = !props.documentId;
  const branchOptional = Boolean(props.branchOptional);
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
    return applyApprovalGate(
      availableProcurementActions(PROCUREMENT_REQUEST_FROM, status),
      props.approval ?? NO_APPROVAL_GATE,
      { approverId: detail.data.approverId, createdBy: detail.data.createdBy },
    );
  }, [creating, detail.data, status, props.approval]);

  const save = useProcurementRequestSave({
    api: props.api,
    queryKey: props.queryKey,
    documentId: props.documentId,
    creating,
    form,
    branchOptional,
    onSaved: props.onSaved,
    onClose: props.onClose,
    onUpdated: () => setMode("view"),
  });

  const setField = <K extends keyof ProcurementRequestFormValue>(
    key: K,
    value: ProcurementRequestFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const next = validateRequestForm(form, branchOptional);
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
    /**
     * Chi nhánh khóa sau khi tạo (luồng thường). Với chi nhánh tùy chọn, được sửa khi còn nháp
     * vì header chỉ hiện ở chế độ sửa khi là nháp.
     */
    branchLocked: branchOptional ? false : !creating,
    branchOptional,
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
