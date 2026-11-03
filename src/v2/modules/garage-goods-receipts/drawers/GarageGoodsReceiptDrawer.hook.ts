import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { garageGoodsReceiptsV2Api } from "@/v2/modules/garage-goods-receipts/api/garageGoodsReceiptsApi";
import {
  useCancelGarageGoodsReceiptMutation,
  usePostGarageGoodsReceiptMutation,
  useSaveGarageGoodsReceiptMutation,
} from "@/v2/modules/garage-goods-receipts/api/mutations/useGarageGoodsReceiptMutations";
import { garageGoodsReceiptsKeys } from "@/v2/modules/garage-goods-receipts/api/queries/garageGoodsReceiptsKeys";
import {
  emptyGarageGoodsReceiptForm,
  type GarageGoodsReceipt,
  type GarageGoodsReceiptFormValue,
} from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import {
  isGarageGoodsReceiptFormDirty,
  validateGarageGoodsReceiptForm,
} from "@/v2/modules/garage-goods-receipts/domain/rules/garageGoodsReceiptRules";

export interface GarageGoodsReceiptDrawerState {
  open: boolean;
  recordId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
}

const toForm = (data: GarageGoodsReceipt): GarageGoodsReceiptFormValue => ({
  receiptNo: data.receiptNo ?? "",
  receiptDate: data.receiptDate ? data.receiptDate.slice(0, 10) : "",
  supplierId: data.supplierId ?? "",
  supplierName: data.supplierName ?? "",
  branchId: data.branchId ?? "",
  branchName: data.branchName ?? "",
  totalAmount: data.totalAmount == null ? "" : String(data.totalAmount),
  status: data.status || "DRAFT",
  paymentStatus: data.paymentStatus || "UNPAID",
  remarks: data.remarks ?? "",
  lines:
    data.lines?.map((l) => ({
      id: l.id,
      itemCode: l.itemCode ?? "",
      itemName: l.itemName ?? "",
      unit: l.unit ?? "Cái",
      qtyReceived: String(l.qtyReceived ?? 0),
      unitCost: String(l.unitCost ?? 0),
      amount: String(l.amount ?? 0),
      notes: l.notes ?? "",
    })) || [],
});

export function useGarageGoodsReceiptDrawer(
  state: GarageGoodsReceiptDrawerState,
) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const [mode, setMode] = React.useState(state.mode);
  const [form, setForm] = React.useState<GarageGoodsReceiptFormValue>(
    emptyGarageGoodsReceiptForm,
  );
  const [initial, setInitial] = React.useState<GarageGoodsReceiptFormValue>(
    emptyGarageGoodsReceiptForm,
  );
  const [errorField, setErrorField] = React.useState<string | null>(null);
  const creating = !state.recordId;

  const detail = useQuery({
    queryKey: garageGoodsReceiptsKeys.detail(state.recordId ?? "new"),
    queryFn: () => garageGoodsReceiptsV2Api.get(state.recordId!),
    enabled: state.open && Boolean(state.recordId),
  });

  React.useEffect(() => setMode(state.mode), [state.mode, state.open]);

  React.useEffect(() => {
    if (!state.open) return;
    setErrorField(null);
    if (detail.data) {
      const loaded = toForm(detail.data);
      setForm(loaded);
      setInitial(loaded);
    } else if (!state.recordId) {
      const fresh = emptyGarageGoodsReceiptForm();
      setForm(fresh);
      setInitial(fresh);
      void garageGoodsReceiptsV2Api.nextCode().then(({ nextCode }) => {
        setForm((value) => ({ ...value, receiptNo: nextCode }));
        setInitial((value) => ({ ...value, receiptNo: nextCode }));
      });
    }
  }, [state.open, state.recordId, detail.data]);

  React.useEffect(() => {
    if (!detail.error) return;
    const fallback = t(
      "v2.garageGoodsReceipts.form.loadError",
      "Không thể tải dữ liệu",
    );
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(detail.error, fallback),
    });
  }, [detail.error, t]);

  const onRefreshDetail = async () => {
    if (state.recordId) {
      await queryClient.invalidateQueries({
        queryKey: garageGoodsReceiptsKeys.detail(state.recordId),
      });
    }
  };

  const save = useSaveGarageGoodsReceiptMutation(t, state.onClose);
  const postMutation = usePostGarageGoodsReceiptMutation(t, onRefreshDetail);
  const cancelMutation = useCancelGarageGoodsReceiptMutation(
    t,
    onRefreshDetail,
  );

  const setField = <K extends keyof GarageGoodsReceiptFormValue>(
    key: K,
    value: GarageGoodsReceiptFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const regenerateCode = () => {
    void garageGoodsReceiptsV2Api
      .nextCode()
      .then(({ nextCode }) => setField("receiptNo", nextCode));
  };

  const submit = () => {
    const missing = validateGarageGoodsReceiptForm(form);
    if (missing) {
      setErrorField(missing);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.garageGoodsReceipts.form.missingInfo", "Thiếu thông tin"),
        description: t(
          "v2.garageGoodsReceipts.form.required",
          "Trường này là bắt buộc",
        ),
      });
      return;
    }
    setErrorField(null);
    save.mutate({ id: state.recordId, form });
  };

  const post = () => {
    if (state.recordId) postMutation.mutate(state.recordId);
  };

  const cancel = () => {
    if (state.recordId) cancelMutation.mutate(state.recordId);
  };

  const canEdit = state.canUpdate && form.status === "DRAFT";
  const canPost =
    state.canUpdate && form.status === "DRAFT" && Boolean(state.recordId);
  const canCancel =
    state.canUpdate && form.status === "POSTED" && Boolean(state.recordId);

  return {
    form,
    setField,
    mode,
    setMode,
    creating,
    codeEditable: creating,
    viewing: mode === "view" && !creating,
    loading: detail.isFetching,
    saving: save.isPending,
    posting: postMutation.isPending,
    cancelling: cancelMutation.isPending,
    dirty: isGarageGoodsReceiptFormDirty(form, initial),
    errorField,
    errorMessage: t(
      "v2.garageGoodsReceipts.form.required",
      "Trường này là bắt buộc",
    ),
    submit,
    post,
    cancel,
    canEdit,
    canPost,
    canCancel,
    regenerateCode,
  };
}
