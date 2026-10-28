import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useCashTransactionQuery } from "../api/queries/useCashTransactionQuery";
import { useBranchOptionsQuery } from "../api/queries/useBranchOptionsQuery";
import { useChartOfAccountsQuery } from "../api/queries/useChartOfAccountsQuery";
import { useSaveCashTransactionMutation } from "../api/mutations/useSaveCashTransactionMutation";
import type { CashGeneralDraft } from "../components/organisms/cash-general-info/CashGeneralInfo.type";
import {
  buildHistoryItems,
  isDraftDirty,
  postingErrorMessage,
  stepMessage,
  toAccountOptions,
  toDraft,
} from "./CashTransactionDetailDrawer.helper";
import {
  postingViewOf,
  useCashPostingDraft,
  type PostingRequest,
} from "./useCashPostingDraft";
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
  /** Mở giao dịch khác từ bảng kê đối tượng */
  onSelectTransaction?: (id: string) => void;
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
  const accountsQuery = useChartOfAccountsQuery(isOpen);
  const save = useSaveCashTransactionMutation();
  const posting = useCashPostingDraft();
  const tx = detail.data;
  const isPosted = tx?.postingStatus === "POSTED";

  const [mode, setMode] = React.useState<"view" | "edit">(initialMode);
  const [activeTab, setActiveTab] = React.useState<CashDetailTab>(() =>
    resolveDetailTab(defaultTabKey),
  );
  const [draft, setDraft] = React.useState<CashGeneralDraft | null>(null);
  const [initial, setInitial] = React.useState<CashGeneralDraft | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [confirmUnpost, setConfirmUnpost] = React.useState(false);

  // Mở lại drawer: đặt lại chế độ và tab theo nơi mở
  React.useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setActiveTab(resolveDetailTab(defaultTabKey));
    setFormError(null);
    setConfirmUnpost(false);
  }, [isOpen, initialMode, defaultTabKey]);

  // Nạp nháp từ dữ liệu server, chỉ khi không đang sửa (tránh ghi đè nội dung đang nhập)
  const editingRef = React.useRef(false);
  editingRef.current = mode === "edit";
  React.useEffect(() => {
    if (!tx || editingRef.current) return;
    const next = toDraft(tx);
    setDraft(next);
    setInitial(next);
    posting.hydrate(tx);
  }, [tx]);

  const dirty =
    Boolean(draft && initial && isDraftDirty(draft, initial)) || posting.dirty;

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
      posting.reset(tx);
    }
    setFormError(null);
    setMode("view");
  };

  const fail = (message: string) => {
    setFormError(message);
    useV2ToastStore
      .getState()
      .showToast({ variant: "destructive", title: message });
  };

  const runSave = (request: PostingRequest) => {
    if (!tx || !draft) return;
    const infoPatch = buildTransactionPatch(tx, draft);
    setFormError(null);
    save.mutate(
      { transactionId: tx.id, infoPatch, accounting: request },
      {
        onSuccess: () => {
          setMode("view");
          useV2ToastStore.getState().showToast({
            variant: "success",
            title: t("v2.bankStatements.cashDetail.saveSuccess"),
          });
          onSaved?.();
        },
        onError: (error) => fail(stepMessage(error, t)),
      },
    );
  };

  /** Lưu: kiểm tra hạch toán trước; bỏ hạch toán thì xin xác nhận trước khi gửi */
  const submit = () => {
    if (!tx || !draft) return;
    const built = posting.buildRequest(isPosted);
    if (built.error) {
      fail(postingErrorMessage(built.error, t));
      return;
    }
    const request = built.request ?? { mode: "SKIP" as const };
    if (request.mode === "UNPOST") {
      setConfirmUnpost(true);
      return;
    }
    runSave(request);
  };

  const confirmUnpostAction = () => {
    setConfirmUnpost(false);
    runSave({ mode: "UNPOST" });
  };

  return {
    t,
    tx,
    mode,
    setMode,
    activeTab,
    setActiveTab,
    draft,
    updateDraft,
    posting: postingViewOf(tx, posting.form),
    postingActions: posting,
    accounts: toAccountOptions(accountsQuery.data ?? []),
    branchOptions: branches.data ?? [],
    dirty,
    loading: detail.isFetching,
    saving: save.isPending,
    formError,
    historyItems: buildHistoryItems(tx, t),
    confirmUnpost,
    setConfirmUnpost,
    confirmUnpostAction,
    cancelEdit,
    submit,
  };
}
