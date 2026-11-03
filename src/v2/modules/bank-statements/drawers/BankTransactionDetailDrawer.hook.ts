import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useCashTransactionQuery } from "../api/queries/useCashTransactionQuery";
import { useBranchOptionsQuery } from "../api/queries/useBranchOptionsQuery";
import { useChartOfAccountsQuery } from "../api/queries/useChartOfAccountsQuery";
import { useSaveCashTransactionMutation } from "../api/mutations/useSaveCashTransactionMutation";
import type { BankGeneralDraft } from "../components/organisms/bank-general-info";
import {
  buildHistoryItems,
  isDraftDirty,
  postingErrorMessage,
  resolveInitialDrawerTabs,
  stepMessage,
  toAccountOptions,
  toDraft,
} from "./BankTransactionDetailDrawer.helper";
import {
  postingViewOf,
  useCashPostingDraft,
  type PostingRequest,
} from "./useCashPostingDraft";
import { buildTransactionPatch } from "../domain/rules/buildTransactionPatch";
import type {
  BankDetailsSubTabKey,
  BankPartnerSubTabKey,
  BankTopTabKey,
  BankTransactionDetailDrawerProps,
} from "./BankTransactionDetailDrawer.type";

export function useBankTransactionDetailDrawer(
  props: BankTransactionDetailDrawerProps,
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

  const resolved = resolveInitialDrawerTabs(defaultTabKey);
  const [mode, setMode] = React.useState<"view" | "edit">(initialMode);
  const [activeTab, setActiveTab] = React.useState<BankTopTabKey>(
    resolved.topTab,
  );
  const [detailsSubTab, setDetailsSubTab] =
    React.useState<BankDetailsSubTabKey>(resolved.detailsSubTab);
  const [partnerSubTab, setPartnerSubTab] =
    React.useState<BankPartnerSubTabKey>("list");
  const [draft, setDraft] = React.useState<BankGeneralDraft | null>(null);
  const [initial, setInitial] = React.useState<BankGeneralDraft | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [confirmUnpost, setConfirmUnpost] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const r = resolveInitialDrawerTabs(defaultTabKey);
    setMode(initialMode);
    setActiveTab(r.topTab);
    setDetailsSubTab(r.detailsSubTab);
    setPartnerSubTab("list");
    setFormError(null);
    setConfirmUnpost(false);
  }, [isOpen, initialMode, defaultTabKey]);

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

  const updateDraft = <K extends keyof BankGeneralDraft>(
    key: K,
    value: BankGeneralDraft[K],
  ) => setDraft((curr) => (curr ? { ...curr, [key]: value } : curr));

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

  const fail = (msg: string) => {
    setFormError(msg);
    useV2ToastStore
      .getState()
      .showToast({ variant: "destructive", title: msg });
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
            title: t("v2.bankStatements.bankDetail.saveSuccess"),
          });
          onSaved?.();
        },
        onError: (err) => fail(stepMessage(err, t)),
      },
    );
  };

  const submit = () => {
    if (!tx || !draft) return;
    const built = posting.buildRequest(isPosted);
    if (built.error) return fail(postingErrorMessage(built.error, t));
    const request = built.request ?? { mode: "SKIP" as const };
    if (request.mode === "UNPOST") return setConfirmUnpost(true);
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
    detailsSubTab,
    setDetailsSubTab,
    partnerSubTab,
    setPartnerSubTab,
    draft,
    updateDraft,
    posting: tx ? postingViewOf(tx, posting.form) : null,
    postingActions: posting,
    accounts: toAccountOptions(accountsQuery.data ?? []),
    branchOptions: branches.data ?? [],
    dirty,
    loading: detail.isFetching,
    saving: save.isPending,
    formError,
    confirmUnpost,
    setConfirmUnpost,
    confirmUnpostAction,
    historyItems: buildHistoryItems(tx, t),
    netOffCount: tx?.invoiceNetOffs?.length || 0,
    cancelEdit,
    submit,
  };
}
