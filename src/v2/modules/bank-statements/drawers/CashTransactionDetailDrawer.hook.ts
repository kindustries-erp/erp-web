import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useCashTransactionQuery } from "../api/queries/useCashTransactionQuery";
import { useBranchOptionsQuery } from "../api/queries/useBranchOptionsQuery";
import { useSaveCashTransactionMutation } from "../api/mutations/useSaveCashTransactionMutation";
import type { CashGeneralDraft } from "../components/organisms/cash-general-info/CashGeneralInfo.type";
import {
  buildHistoryItems,
  stepMessage,
  toDraft,
  isDraftDirty,
} from "./CashTransactionDetailDrawer.helper";
import { buildTransactionPatch } from "../domain/rules/buildTransactionPatch";
import {
  resolveDetailTab,
  type CashDetailTab,
} from "../domain/rules/resolveDetailTab";

export interface CashTransactionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSaved?: () => void;
  /** Khóa tab từ nơi mở drawer (`txn_details`, `txn_partner`, `partner`...) */
  defaultTabKey?: string;
  initialMode?: "view" | "edit";
}

export function useCashTransactionDetailDrawer(
  props: CashTransactionDetailDrawerProps,
) {
  const {
    isOpen,
    transactionId,
    defaultTabKey,
    initialMode = "view",
    onSaved,
  } = props;
  const { t } = useV2Translation();
  const detail = useCashTransactionQuery(transactionId, isOpen);
  const branches = useBranchOptionsQuery(isOpen);
  const save = useSaveCashTransactionMutation();
  const tx = detail.data;

  const [mode, setMode] = React.useState<"view" | "edit">(initialMode);
  const [activeTab, setActiveTab] = React.useState<CashDetailTab>(() =>
    resolveDetailTab(defaultTabKey),
  );
  const [draft, setDraft] = React.useState<CashGeneralDraft | null>(null);
  const [initial, setInitial] = React.useState<CashGeneralDraft | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Mở lại drawer: đặt lại chế độ và tab theo nơi mở
  React.useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setActiveTab(resolveDetailTab(defaultTabKey));
    setFormError(null);
  }, [isOpen, initialMode, defaultTabKey]);

  // Nạp nháp từ dữ liệu server, chỉ khi không đang sửa (tránh ghi đè nội dung đang nhập)
  const editingRef = React.useRef(false);
  editingRef.current = mode === "edit";
  React.useEffect(() => {
    if (!tx || editingRef.current) return;
    const next = toDraft(tx);
    setDraft(next);
    setInitial(next);
  }, [tx]);

  const dirty = Boolean(draft && initial && isDraftDirty(draft, initial));

  const updateDraft = <K extends keyof CashGeneralDraft>(
    key: K,
    value: CashGeneralDraft[K],
  ) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const cancelEdit = () => {
    if (tx) {
      const reset = toDraft(tx);
      setDraft(reset);
      setInitial(reset);
    }
    setFormError(null);
    setMode("view");
  };

  const submit = () => {
    if (!tx || !draft) return;
    const infoPatch = buildTransactionPatch(tx, draft);
    setFormError(null);
    // Đợt này chưa sửa hạch toán: giữ nguyên bút toán hiện có
    save.mutate(
      { transactionId: tx.id, infoPatch, accounting: { mode: "SKIP" } },
      {
        onSuccess: () => {
          setMode("view");
          useV2ToastStore.getState().showToast({
            variant: "success",
            title: t("v2.bankStatements.cashDetail.saveSuccess"),
          });
          onSaved?.();
        },
        onError: (error) => {
          const message = stepMessage(error, t);
          setFormError(message);
          useV2ToastStore.getState().showToast({
            variant: "destructive",
            title: message,
          });
        },
      },
    );
  };

  const historyItems = buildHistoryItems(tx, t);

  return {
    t,
    tx,
    mode,
    setMode,
    activeTab,
    setActiveTab,
    draft,
    updateDraft,
    branchOptions: branches.data ?? [],
    dirty,
    loading: detail.isFetching,
    saving: save.isPending,
    formError,
    historyItems,
    cancelEdit,
    submit,
  };
}
