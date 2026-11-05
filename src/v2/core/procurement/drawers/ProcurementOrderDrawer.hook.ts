import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { todayIsoDate } from "../procurement.rules";
import {
  emptyOrderForm,
  hasOrderFormErrors,
  orderFormFromDetail,
  toOrderCreatePayload,
  toOrderHeaderPayload,
  validateOrderForm,
  type ProcurementOrderFormErrors,
  type ProcurementOrderFormValue,
} from "../form/procurementOrder.form";
import { toOrderLinePayload } from "../form/procurementLine.form";
import type {
  ProcurementOrderDetail,
  ProcurementPoDraft,
  ProcurementRequestDetail,
} from "../procurement.types";
import { orderFormFromRequestDraft } from "../form/procurementOrder.form";
import {
  showProcurementError,
  showProcurementSuccess,
  showProcurementWarning,
} from "../procurement.toast";
import type { ProcurementDrawerProps } from "./procurementDrawer.type";

/** Trạng thái drawer PO: tải chi tiết, form, lưu. Sửa được khi đơn còn nháp. */
export function useProcurementOrderDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const creating = !props.documentId;
  const [mode, setMode] = React.useState(props.mode);
  const [form, setForm] = React.useState<ProcurementOrderFormValue>(() =>
    emptyOrderForm(todayIsoDate()),
  );
  const [errors, setErrors] = React.useState<ProcurementOrderFormErrors>({});

  const detail = useQuery({
    queryKey: [props.queryKey, "detail", props.documentId],
    queryFn: () =>
      props.api.get(props.documentId!) as Promise<ProcurementOrderDetail>,
    enabled: props.open && !creating,
  });

  // Tạo PO từ PR: đọc PR và bản nháp còn lại để điền sẵn
  const fromRequest = useQuery({
    queryKey: [props.queryKey, "from-request", props.fromRequestId],
    queryFn: async () => {
      const id = props.fromRequestId!;
      const [request, draft] = await Promise.all([
        props.requestApi!.get(id) as Promise<ProcurementRequestDetail>,
        props.requestApi!.poDraft!(id) as Promise<ProcurementPoDraft>,
      ]);
      return { request, draft };
    },
    enabled:
      props.open &&
      creating &&
      Boolean(props.fromRequestId) &&
      Boolean(props.requestApi?.poDraft),
  });

  React.useEffect(() => setMode(props.mode), [props.mode, props.open]);

  React.useEffect(() => {
    if (!props.open) return;
    setErrors({});
    if (detail.data) setForm(orderFormFromDetail(detail.data));
    else if (creating && fromRequest.data)
      setForm(
        orderFormFromRequestDraft(
          fromRequest.data.request,
          fromRequest.data.draft,
        ),
      );
    else if (creating) setForm(emptyOrderForm(todayIsoDate()));
  }, [props.open, detail.data, creating, fromRequest.data]);

  const status = detail.data?.status ?? "DRAFT";
  const editable = creating || status === "DRAFT";
  const viewing = !editable || mode === "view";

  const save = useMutation({
    mutationFn: async () => {
      if (creating) return props.api.create(toOrderCreatePayload(form));
      const id = props.documentId!;
      await props.api.updateHeader?.(id, toOrderHeaderPayload(form));
      await props.api.replaceLines(id, form.lines.map(toOrderLinePayload));
      return { id };
    },
    onSuccess: () => {
      showProcurementSuccess(
        t("v2.procurement.drawer.saved", "Đã lưu đơn mua"),
      );
      void queryClient.invalidateQueries({ queryKey: [props.queryKey] });
      props.onClose();
    },
    onError: (error) =>
      showProcurementError(
        error,
        t("v2.procurement.drawer.saveError", "Không lưu được đơn mua"),
      ),
  });

  const setField = <K extends keyof ProcurementOrderFormValue>(
    key: K,
    value: ProcurementOrderFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const next = validateOrderForm(form);
    setErrors(next);
    if (hasOrderFormErrors(next)) {
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
    viewing,
    branchLocked: !creating,
    editable,
    mode,
    setMode,
    status,
    detail: detail.data,
    loading: detail.isFetching || fromRequest.isFetching,
    saving: save.isPending,
    submit,
  };
}
