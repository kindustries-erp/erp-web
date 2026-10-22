import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usePosting } from "@/shared/components/accounting/usePosting";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import type {
  CashflowClassification,
  CashflowPurpose,
} from "@/modules/bank-statements/constants/cashflowAttributes";
import type { DrawerAuditLogItem } from "@/shared/components/StandardFormDrawer";
import type {
  BankTransactionDetailDrawerProps,
  BankTransactionDetailSubTabKey,
  BankTransactionPartnerSubTabKey,
} from "./BankTransactionDetailDrawer.type";

function createClientId() {
  const c = (globalThis as any)?.crypto;
  return c?.randomUUID
    ? c.randomUUID()
    : `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useBankTransactionDetailDrawer(
  props: BankTransactionDetailDrawerProps,
) {
  const {
    isOpen,
    onClose,
    transactionId,
    onSaved,
    defaultTabKey = "txn_details",
    initialMode = "view",
  } = props;
  const queryClient = useQueryClient();
  const postingState = usePosting();

  const [editMode, setEditMode] = useState(false);
  const [accountingEnabled, setAccountingEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [editBranchId, setEditBranchId] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [cashflowClassification, setCashflowClassification] =
    useState<CashflowClassification | null>(null);
  const [cashflowPurpose, setCashflowPurpose] =
    useState<CashflowPurpose | null>(null);
  const [subTabKey, setSubTabKey] =
    useState<BankTransactionDetailSubTabKey>("details");
  const [partnerSubTabKey, setPartnerSubTabKey] =
    useState<BankTransactionPartnerSubTabKey>("partner");
  const [showInvoiceNetOffModal, setShowInvoiceNetOffModal] = useState(false);

  const { data: transaction, isLoading } = useQuery({
    queryKey: ["bank-transaction", transactionId],
    queryFn: () => bankStatementApi.getTransaction(transactionId!),
    enabled: isOpen && Boolean(transactionId),
  });

  const isPosted = transaction?.postingStatus === "POSTED";
  const baseDescription = useMemo(
    () =>
      transaction?.accountingDescription ||
      transaction?.description ||
      transaction?.referenceNumber ||
      "",
    [transaction],
  );
  const defaultPostingDate = useMemo(
    () =>
      transaction?.transDate
        ? transaction.transDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    [transaction],
  );

  const transactionInsights = useMemo(() => {
    if (!transaction) return null;
    const netOffs = Array.isArray(transaction.invoiceNetOffs)
      ? transaction.invoiceNetOffs
      : [];
    return {
      netOffCount: netOffs.length,
      netOffTotal: netOffs.reduce(
        (s: number, i: any) => s + Number(i.netOffAmount || 0),
        0,
      ),
    };
  }, [transaction]);

  const buildDefaultLines = useCallback(
    (tx: any) => {
      const amt = Math.max(
        Number(tx?.creditAmount || 0),
        Number(tx?.debitAmount || 0),
      );
      const defAcc =
        tx?.sourceType === "BANK"
          ? tx?.bankAccount?.accountingAccountId || ""
          : tx?.cashBook?.accountingAccountId || "";
      const pAcc = defAcc || tx?.correspondentAccountingAccountId || "";
      const isRec = Number(tx?.creditAmount || 0) > 0;
      if (!amt || !pAcc) return [];
      return [
        {
          id: createClientId(),
          accountId: pAcc,
          debit: isRec ? amt : 0,
          credit: isRec ? 0 : amt,
          description: baseDescription,
        },
        {
          id: createClientId(),
          accountId: "",
          debit: isRec ? 0 : amt,
          credit: isRec ? amt : 0,
          description: baseDescription,
        },
      ];
    },
    [baseDescription],
  );

  const hydratePostingState = useCallback(
    (tx: any) => {
      const pLines =
        tx?.postingStatus === "POSTED" && Array.isArray(tx?.lines)
          ? tx.lines
          : [];
      postingState.setAllState({
        postingDate: tx?.postingDate || defaultPostingDate,
        description: tx?.description || baseDescription,
        lines:
          pLines.length > 0
            ? pLines.map((l: any) => ({
                id: l.id || createClientId(),
                accountId: l.accountId || "",
                debit: Number(l.debit || 0),
                credit: Number(l.credit || 0),
                description: l.description || "",
              }))
            : buildDefaultLines(tx),
      });
      postingState.setIsDirty(false);
    },
    [baseDescription, defaultPostingDate, buildDefaultLines, postingState],
  );

  useEffect(() => {
    if (!isOpen) {
      setEditMode(false);
      setAccountingEnabled(isPosted);
      setFormError(null);
      setEditBranchId("");
      setEditDescription("");
      setCashflowClassification(null);
      setCashflowPurpose(null);
      setSubTabKey("details");
      postingState.reset();
      return;
    }
    if (transaction) {
      setEditMode(initialMode === "edit");
      setAccountingEnabled(isPosted);
      setFormError(null);
      setEditBranchId(transaction.branchId || transaction.branch?.id || "");
      setEditDescription(
        transaction.description || transaction.accountingDescription || "",
      );
      setCashflowClassification(transaction.cashflowClassification ?? null);
      setCashflowPurpose(transaction.cashflowPurpose ?? null);
      hydratePostingState(transaction);
    }
  }, [
    isOpen,
    transactionId,
    transaction?.id,
    isPosted,
    initialMode,
    defaultTabKey,
  ]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!transactionId) throw new Error("Missing transaction ID");
      const oBranch = transaction.branchId || transaction.branch?.id || "";
      const oDesc =
        transaction.description || transaction.accountingDescription || "";
      const oClassification = transaction.cashflowClassification ?? null;
      const oPurpose = transaction.cashflowPurpose ?? null;
      if (
        editBranchId !== oBranch ||
        editDescription !== oDesc ||
        cashflowClassification !== oClassification ||
        cashflowPurpose !== oPurpose
      ) {
        await bankStatementApi.updateTransaction(transactionId, {
          branchId: editBranchId || undefined,
          description: editDescription,
          accountingDescription: editDescription,
          cashflowClassification,
          cashflowPurpose: cashflowClassification ? cashflowPurpose : null,
        });
      }
      if (!accountingEnabled)
        return isPosted
          ? bankStatementApi.unpostTransaction(transactionId)
          : undefined;
      if (!postingState.postingDate)
        throw new Error("Vui lòng chọn ngày hạch toán.");
      const norm = postingState.lines
        .map((l) => ({
          accountId: l.accountId,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
          description: l.description || postingState.description || "",
        }))
        .filter((l) => l.debit > 0 || l.credit > 0 || l.accountId);
      if (norm.length === 0)
        throw new Error("Vui lòng nhập ít nhất 1 dòng hạch toán.");
      if (norm.some((l) => !l.accountId))
        throw new Error(
          "Vui lòng chọn tài khoản cho tất cả các dòng hạch toán.",
        );
      if (!postingState.isBalanced)
        throw new Error(
          "Hạch toán không cân bằng. Vui lòng kiểm tra lại tổng Nợ và Có.",
        );
      return bankStatementApi.postTransaction(transactionId, {
        postingDate: postingState.postingDate,
        description: postingState.description,
        lines: norm,
      });
    },
    onSuccess: async () => {
      toast.success(
        accountingEnabled
          ? "Đã lưu hạch toán giao dịch."
          : "Đã lưu thông tin giao dịch.",
      );
      setEditMode(false);
      setFormError(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bank-transaction", transactionId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["module-entity-values", "BANK_TXN", transactionId],
        }),
        queryClient.invalidateQueries({ queryKey: ["bank-transactions"] }),
      ]);
      onSaved?.();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Lỗi lưu hạch toán";
      setFormError(msg);
      toast.error(msg);
    },
  });

  const unpostMutation = useMutation({
    mutationFn: async () => {
      if (!transactionId) throw new Error("Missing transaction ID");
      return bankStatementApi.unpostTransaction(transactionId);
    },
    onSuccess: async () => {
      toast.success("Đã bỏ hạch toán giao dịch.");
      setFormError(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bank-transaction", transactionId],
        }),
        queryClient.invalidateQueries({ queryKey: ["bank-transactions"] }),
      ]);
      onSaved?.();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Lỗi bỏ hạch toán";
      setFormError(msg);
      toast.error(msg);
    },
  });

  const handleUnlinkInvoiceNode = useCallback(
    async (node: any) => {
      if (!transactionId || !node?.id) return;
      try {
        await bankStatementApi.removeInvoice(transactionId, node.id);
        toast.success("Đã gỡ liên kết hóa đơn thành công.");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["bank-transaction", transactionId],
          }),
          queryClient.invalidateQueries({ queryKey: ["bank-transactions"] }),
        ]);
        onSaved?.();
      } catch (err: any) {
        toast.error(err?.message || "Lỗi gỡ liên kết hóa đơn");
      }
    },
    [transactionId, queryClient, onSaved],
  );

  const handleSelectInvoicesForNetOff = useCallback(
    async (selected: any[]) => {
      if (!transactionId) return;
      try {
        for (const inv of selected)
          await bankStatementApi.linkInvoice(transactionId, {
            invoiceId: inv.id,
            netOffAmount: inv.amount,
          });
        toast.success("Đã liên kết hóa đơn thành công.");
        setShowInvoiceNetOffModal(false);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["bank-transaction", transactionId],
          }),
          queryClient.invalidateQueries({ queryKey: ["bank-transactions"] }),
        ]);
        onSaved?.();
      } catch (err: any) {
        toast.error(err?.message || "Lỗi liên kết hóa đơn");
      }
    },
    [transactionId, queryClient, onSaved],
  );

  const auditItems: DrawerAuditLogItem[] = useMemo(() => {
    const items: DrawerAuditLogItem[] = [];
    if (transaction?.createdAt)
      items.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: "Khởi tạo / Import sao kê",
        timestamp: transaction.createdAt,
        message: `Giao dịch số tham chiếu ${transaction.referenceNumber || transaction.id}`,
      });
    if (transaction?.postingDate)
      items.push({
        id: "posted",
        actionType: "SYNC",
        actionLabel: "Hạch toán sổ cái",
        timestamp: transaction.postingDate,
        message: `Đã ghi nhận bút toán sổ cái mã #${transaction.journalEntryId || ""}`,
      });
    return items;
  }, [transaction]);

  return {
    editMode,
    setEditMode,
    startEdit: () => {
      if (!transaction) return;
      hydratePostingState(transaction);
      setAccountingEnabled(isPosted);
      setFormError(null);
      setEditMode(true);
    },
    cancelEdit: () => {
      if (transaction) hydratePostingState(transaction);
      setAccountingEnabled(isPosted);
      setFormError(null);
      setEditMode(false);
    },
    accountingEnabled,
    setAccountingEnabled,
    formError,
    cashflowClassification,
    setCashflowClassification,
    cashflowPurpose,
    setCashflowPurpose,
    editBranchId,
    setEditBranchId,
    editDescription,
    setEditDescription,
    subTabKey,
    setSubTabKey,
    partnerSubTabKey,
    setPartnerSubTabKey,
    showInvoiceNetOffModal,
    setShowInvoiceNetOffModal,
    transaction,
    isLoading,
    isPosted,
    baseDescription,
    defaultPostingDate,
    postingState,
    saveMutation,
    unpostMutation,
    handleUnlinkInvoiceNode,
    handleSelectInvoicesForNetOff,
    transactionInsights,
    auditItems,
    queryClient,
    viewActions: [
      { label: "Đóng", onClick: onClose, variant: "outline" as const },
    ],
    editActions: [
      {
        label: "Hủy",
        onClick: () => {
          if (transaction) hydratePostingState(transaction);
          setEditMode(false);
        },
        variant: "outline" as const,
        disabled: saveMutation.isPending,
      },
      {
        label: saveMutation.isPending
          ? "Đang lưu..."
          : !accountingEnabled && isPosted
            ? "Hủy hạch toán"
            : "Lưu thay đổi",
        primary: true,
        loading: saveMutation.isPending,
        disabled: saveMutation.isPending,
        onClick: () => saveMutation.mutate(),
      },
    ],
  };
}
