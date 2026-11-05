import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { todayIsoDate } from "../procurement.rules";
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
} from "../form/procurementRequest.form";
import type { ProcurementRequestDetail } from "../procurement.types";
import {
  showProcurementError,
  showProcurementSuccess,
  showProcurementWarning,
} from "../procurement.toast";
import type { ProcurementDrawerProps } from "./procurementDrawer.type";

/**
 * Trạng thái drawer PR. Đầu đề (chi nhánh, ngày, nội dung) chỉ nhập lúc tạo;
 * khi nháp, sửa được dòng hàng qua `replaceLines`.
 */
export function useProcurementRequestDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const creating = !props.documentId;
  const [mode, setMode] = React.useState(props.mode);
  const [form, setForm] = React.useState<ProcurementRequestFormValue>(() =>
    emptyRequestForm(todayIsoDate()),
  );
  const [errors, setErrors] = React.useState<ProcurementRequestFormErrors>({});

  const detail = useQuery({
    queryKey: [props.queryKey, "detail", props.documentId],
    queryFn: () =>
      props.api.get(props.documentId!) as Promise<ProcurementRequestDetail>,
    enabled: props.open && !creating,
  });

  React.useEffect(() => setMode(props.mode), [props.mode, props.open]);

  React.useEffect(() => {
    if (!props.open) return;
    setErrors({});
    if (detail.data) setForm(requestFormFromDetail(detail.data));
    else if (creating) setForm(emptyRequestForm(todayIsoDate()));
  }, [props.open, detail.data, creating]);

  const status = detail.data?.status ?? "DRAFT";
  const editable = creating || status === "DRAFT";
  const readOnly = !editable || mode === "view";
  const headerViewing = !creating && readOnly;
  const linesViewing = !creating && readOnly;

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
    onSuccess: () => {
      showProcurementSuccess(
        t("v2.procurement.drawer.savedRequest", "Đã lưu đề nghị mua"),
      );
      void queryClient.invalidateQueries({ queryKey: [props.queryKey] });
      props.onClose();
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

  return {
    form,
    setField,
    errors,
    creating,
    headerViewing,
    linesViewing,
    editable,
    viewing: !creating && readOnly,
    /** Chi nhánh khóa sau khi tạo: PO đã liên kết có thể đang dùng chi nhánh cũ */
    branchLocked: !creating,
    mode,
    setMode,
    status,
    detail: detail.data,
    loading: detail.isFetching,
    saving: save.isPending,
    submit,
  };
}
