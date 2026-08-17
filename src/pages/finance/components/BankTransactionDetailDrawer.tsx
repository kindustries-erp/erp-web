import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  StandardFormDrawer,
  DrawerDocumentTraceability,
  DrawerAuditTimeline,
  type DrawerRelatedTabItem,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatGMT7, money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { Link2, BookOpen, History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePosting } from "@/shared/components/accounting/usePosting";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSaved?: () => void;
}

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function BankTransactionDetailDrawer({
  isOpen,
  onClose,
  transactionId,
  onSaved,
}: Props) {
  const queryClient = useQueryClient();
  const postingState = usePosting();
  const [editMode, setEditMode] = useState(false);
  const [accountingEnabled, setAccountingEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: transaction, isLoading } = useQuery({
    queryKey: ["bank-transaction", transactionId],
    queryFn: () => bankStatementApi.getTransaction(transactionId!),
    enabled: isOpen && !!transactionId,
  });

  const isPosted = transaction?.postingStatus === "POSTED";

  const baseDescription = useMemo(() => {
    if (!transaction) return "";
    return (
      transaction.accountingDescription ||
      transaction.description ||
      transaction.referenceNumber ||
      ""
    );
  }, [transaction]);

  const defaultPostingDate = useMemo(() => {
    if (!transaction?.transDate) return new Date().toISOString().slice(0, 10);
    return transaction.transDate.slice(0, 10);
  }, [transaction]);

  const transactionInsights = useMemo(() => {
    if (!transaction) return null;

    const sourceLabel =
      transaction.sourceType === "BANK"
        ? [
            transaction.bankAccount?.bankName,
            transaction.bankAccount?.accountNumber,
          ]
            .filter(Boolean)
            .join(" - ") || "—"
        : transaction.cashBook?.name || "—";

    const sourceAccountLabel =
      transaction.sourceType === "BANK"
        ? [
            transaction.bankAccount?.accountName,
            transaction.bankAccount?.accountNumber,
          ]
            .filter(Boolean)
            .join(" - ") ||
          transaction.bankAccount?.accountingAccountId ||
          "—"
        : transaction.cashBook?.name ||
          transaction.cashBook?.accountingAccountId ||
          "—";

    const branchLabel =
      transaction.branch?.name ||
      transaction.branch?.branchName ||
      transaction.branchName ||
      transaction.branchId ||
      "—";

    const netOffs = Array.isArray(transaction.invoiceNetOffs)
      ? transaction.invoiceNetOffs
      : [];
    const netOffTotal = netOffs.reduce(
      (sum: number, item: any) => sum + Number(item.netOffAmount || 0),
      0,
    );

    const counterpartLabel = [
      transaction.correspondentName,
      transaction.correspondentAccount,
      transaction.correspondentBank,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      sourceLabel,
      sourceAccountLabel,
      branchLabel,
      netOffCount: netOffs.length,
      netOffTotal,
      counterpartLabel: counterpartLabel || "—",
      balanceLabel:
        transaction.balance !== null && transaction.balance !== undefined
          ? money(transaction.balance)
          : "—",
      seqNoLabel: transaction.seqNo || transaction.stt || "—",
      efdDateLabel: transaction.efdDate
        ? formatGMT7(transaction.efdDate, "date")
        : "—",
    };
  }, [transaction]);

  const initialAccountingEnabled = isPosted;

  const bankTheme = useMemo(() => {
    const rawCode = String(
      transaction?.bankAccount?.bankCode || "",
    ).toUpperCase();
    const rawName = String(
      transaction?.bankAccount?.bankName || "",
    ).toUpperCase();
    const normalized = `${rawCode} ${rawName}`;

    if (normalized.includes("BIDV")) {
      return {
        code: "BIDV",
        bankLabel: "BIDV",
        paperTone: "from-cyan-50 via-white to-cyan-50/30",
        titleColor: "text-cyan-800",
        accentBorder: "border-cyan-200",
        accentBox: "bg-cyan-50/70",
        stripe: "from-cyan-700 to-teal-600",
      };
    }

    if (normalized.includes("TCB") || normalized.includes("TECHCOMBANK")) {
      return {
        code: "TCB",
        bankLabel: "TECHCOMBANK",
        paperTone: "from-red-50 via-white to-rose-50/40",
        titleColor: "text-red-700",
        accentBorder: "border-red-200",
        accentBox: "bg-red-50/70",
        stripe: "from-red-700 to-red-500",
      };
    }

    return {
      code: "DEFAULT",
      bankLabel: transaction?.bankAccount?.bankName || "Ngân hàng",
      paperTone: "from-slate-100 via-white to-slate-100",
      titleColor: "text-slate-800",
      accentBorder: "border-slate-200",
      accentBox: "bg-slate-50",
      stripe: "from-slate-700 to-slate-500",
    };
  }, [transaction]);

  const buildDefaultLines = (tx: any) => {
    const amount = Math.max(
      Number(tx?.creditAmount || 0),
      Number(tx?.debitAmount || 0),
    );
    const defaultAccountId =
      tx?.sourceType === "BANK"
        ? tx?.bankAccount?.accountingAccountId || ""
        : tx?.cashBook?.accountingAccountId || "";
    const counterpartAccountId = tx?.correspondentAccountingAccountId || "";
    const isReceipt = Number(tx?.creditAmount || 0) > 0;

    if (!amount) {
      return [];
    }

    const primaryAccountId = defaultAccountId || counterpartAccountId || "";
    if (!primaryAccountId) {
      return [];
    }

    return [
      {
        id: createClientId(),
        accountId: primaryAccountId,
        debit: isReceipt ? amount : 0,
        credit: isReceipt ? 0 : amount,
        description: baseDescription,
      },
      {
        id: createClientId(),
        accountId: "",
        debit: isReceipt ? 0 : amount,
        credit: isReceipt ? amount : 0,
        description: baseDescription,
      },
    ];
  };

  const hydratePostingState = (tx: any) => {
    const postingLines =
      tx?.postingStatus === "POSTED" && Array.isArray(tx?.lines)
        ? tx.lines
        : [];

    postingState.setAllState({
      postingDate: tx?.postingDate || defaultPostingDate,
      description: tx?.description || baseDescription,
      lines:
        postingLines.length > 0
          ? postingLines.map((line: any) => ({
              id: line.id || createClientId(),
              accountId: line.accountId || "",
              debit: Number(line.debit || 0),
              credit: Number(line.credit || 0),
              description: line.description || "",
            }))
          : buildDefaultLines(tx),
    });
    postingState.setIsDirty(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setEditMode(false);
      setAccountingEnabled(initialAccountingEnabled);
      setFormError(null);
      postingState.reset();
      return;
    }

    if (transaction) {
      setEditMode(false);
      setAccountingEnabled(initialAccountingEnabled);
      setFormError(null);
      hydratePostingState(transaction);
    }
  }, [
    isOpen,
    transactionId,
    transaction?.id,
    transaction?.postingStatus,
    initialAccountingEnabled,
  ]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!transactionId) throw new Error("Missing transaction ID");

      if (!accountingEnabled) {
        if (isPosted) {
          return bankStatementApi.unpostTransaction(transactionId);
        }
        throw new Error("Vui lòng bật hạch toán trước khi lưu.");
      }

      if (!postingState.postingDate) {
        throw new Error("Vui lòng chọn ngày hạch toán.");
      }

      const normalizedLines = postingState.lines
        .map((line) => ({
          accountId: line.accountId,
          debit: Number(line.debit || 0),
          credit: Number(line.credit || 0),
          description: line.description || postingState.description || "",
        }))
        .filter((line) => line.debit > 0 || line.credit > 0 || line.accountId);

      if (normalizedLines.length === 0) {
        throw new Error("Vui lòng nhập ít nhất 1 dòng hạch toán.");
      }

      if (normalizedLines.some((line) => !line.accountId)) {
        throw new Error(
          "Vui lòng chọn tài khoản cho tất cả các dòng hạch toán.",
        );
      }

      if (!postingState.isBalanced) {
        throw new Error(
          "Hạch toán không cân bằng. Vui lòng kiểm tra lại tổng Nợ và Có.",
        );
      }

      return bankStatementApi.postTransaction(transactionId, {
        postingDate: postingState.postingDate,
        description: postingState.description,
        lines: normalizedLines,
      });
    },
    onSuccess: async () => {
      toast.success(
        accountingEnabled
          ? "Đã lưu hạch toán giao dịch."
          : "Đã bỏ hạch toán giao dịch.",
      );
      setEditMode(false);
      setFormError(null);
      await queryClient.invalidateQueries({
        queryKey: ["bank-transaction", transactionId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      onSaved?.();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || "Lỗi lưu hạch toán";
      setFormError(message);
      toast.error(message);
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
      await queryClient.invalidateQueries({
        queryKey: ["bank-transaction", transactionId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      onSaved?.();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || "Lỗi bỏ hạch toán";
      setFormError(message);
      toast.error(message);
    },
  });

  const startEdit = () => {
    if (!transaction) return;
    hydratePostingState(transaction);
    setAccountingEnabled(isPosted);
    setFormError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (transaction) hydratePostingState(transaction);
    setAccountingEnabled(isPosted);
    setFormError(null);
    setEditMode(false);
  };

  const viewActions = [
    {
      label: "Đóng",
      onClick: onClose,
      variant: "outline" as const,
    },
  ];

  const editActions = [
    {
      label: "Hủy",
      onClick: cancelEdit,
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
  ];

  const previewDocumentType =
    Number(transaction?.debitAmount || 0) > 0 ? "Ủy nhiệm chi" : "Giấy báo có";

  // Build Audit Logs & Related Tabs
  const auditItems: DrawerAuditLogItem[] = [];
  if (transaction?.createdAt) {
    auditItems.push({
      id: "created",
      actionType: "CREATE",
      actionLabel: "Khởi tạo / Import sao kê",
      timestamp: transaction.createdAt,
      message: `Giao dịch số tham chiếu ${transaction.referenceNumber || transaction.id}`,
    });
  }
  if (transaction?.postingDate) {
    auditItems.push({
      id: "posted",
      actionType: "SYNC",
      actionLabel: "Hạch toán sổ cái",
      timestamp: transaction.postingDate,
      message: `Đã ghi nhận bút toán sổ cái mã #${transaction.journalEntryId || ""}`,
    });
  }

  const resolvedRelatedTabs: DrawerRelatedTabItem[] = transaction
    ? [
        {
          key: "traceability",
          label: "Chứng từ liên kết",
          icon: <Link2 className="w-3.5 h-3.5" />,
          badgeCount: transaction.invoiceNetOffs?.length || 0,
          content: (
            <DrawerDocumentTraceability
              rootId={transaction.id}
              rootType="BANK_TXN"
              fetchGraph={(id) => bankStatementApi.getTraceabilityGraph(id)}
              editMode={editMode}
            />
          ),
        },
        {
          key: "accounting",
          label: "Hạch toán kế toán",
          icon: <BookOpen className="w-3.5 h-3.5" />,
          badgeCount: isPosted ? 1 : 0,
          content: editMode ? (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Định khoản nghiệp vụ kế toán
                </span>
                <button
                  type="button"
                  onClick={() => setAccountingEnabled((value) => !value)}
                  className={`px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors ${
                    accountingEnabled
                      ? "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg"
                      : "border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100"
                  }`}
                >
                  {accountingEnabled ? "Hủy hạch toán" : "Bật hạch toán"}
                </button>
              </div>
              <div
                className={
                  !accountingEnabled
                    ? "opacity-40 grayscale pointer-events-none"
                    : ""
                }
              >
                <PostingSection
                  postingState={postingState}
                  editMode={true}
                  isPosted={isPosted}
                  journalEntryId={transaction.journalEntryId}
                  defaultDate={defaultPostingDate}
                  defaultDescription={baseDescription}
                  autoBalanceOnAddLine
                  onUnpost={() => unpostMutation.mutate()}
                  unposting={unpostMutation.isPending}
                />
              </div>
            </div>
          ) : (
            <div className="py-1">
              <PostedAccountingSummary
                isPosted={isPosted}
                journalEntryId={transaction.journalEntryId}
                postingDate={transaction.postingDate}
              />
            </div>
          ),
        },
        {
          key: "history",
          label: "Lịch sử",
          icon: <History className="w-3.5 h-3.5" />,
          badgeCount: auditItems.length,
          content: (
            <DrawerAuditTimeline
              items={auditItems}
              emptyLabel="Chưa có ghi nhận lịch sử."
            />
          ),
        },
      ]
    : [];

  return (
    <StandardFormDrawer
      open={isOpen}
      onClose={onClose}
      mode={editMode ? "edit" : "view"}
      collapsibleRightPanel={true}
      onToggleEdit={!isLoading && transaction ? startEdit : undefined}
      title="Chi tiết giao dịch"
      size="xl"
      layout="2-columns"
      confirmOnClose={editMode && postingState.isDirty}
      actions={editMode ? editActions : viewActions}
      error={formError}
      loading={isLoading}
      panelClassName="w-full md:w-[96vw] lg:w-[92vw] xl:w-[1400px] 2xl:w-[1500px]"
      relatedTabs={resolvedRelatedTabs}
      defaultRelatedTabKey="traceability"
      leftPanel={
        <div className="flex flex-col gap-5">
          {transaction ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-3 md:p-5">
              <div
                className={`mx-auto min-h-[420px] max-w-[960px] rounded-[20px] border border-slate-200 bg-gradient-to-br ${bankTheme.paperTone} p-5 shadow-sm md:p-7`}
              >
                <div
                  className={`h-1.5 w-full rounded-full bg-gradient-to-r ${bankTheme.stripe}`}
                />
                <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div
                      className={`text-xl font-extrabold tracking-wide ${bankTheme.titleColor}`}
                    >
                      {bankTheme.bankLabel}
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Statement Preview
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-base font-bold uppercase ${bankTheme.titleColor}`}
                    >
                      {previewDocumentType}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatGMT7(transaction.transDate, "datetime") || "—"}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-5 rounded-2xl border ${bankTheme.accentBorder} ${bankTheme.accentBox} p-4`}
                >
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Tài khoản trích nợ/có
                      </div>
                      <div className="font-semibold text-slate-800 break-words">
                        {transactionInsights?.sourceLabel || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Người hưởng/đối ứng
                      </div>
                      <div className="font-semibold text-slate-800 break-words">
                        {transactionInsights?.counterpartLabel || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Số tiền bằng số
                      </div>
                      <div className="font-semibold text-slate-900">
                        {money(
                          Math.max(
                            Number(transaction.creditAmount || 0),
                            Number(transaction.debitAmount || 0),
                          ),
                        ) || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Số dư sau giao dịch
                      </div>
                      <div className="font-semibold text-slate-900">
                        {transactionInsights?.balanceLabel || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                    Nội dung giao dịch
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-800 break-words">
                    {transaction.description || "—"}
                  </div>
                  <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                    <div>
                      <span className="font-medium">Tham chiếu:</span>{" "}
                      <span className="break-all">
                        {transaction.referenceNumber || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">EFD:</span>{" "}
                      {transactionInsights?.efdDateLabel || "—"}
                    </div>
                    <div>
                      <span className="font-medium">STT/Seq:</span>{" "}
                      {transactionInsights?.seqNoLabel || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 py-4 text-center text-sm">
              Không tìm thấy thông tin giao dịch.
            </div>
          )}
        </div>
      }
      rightPanel={
        transaction ? (
          <div className="space-y-4">
            <DrawerSection title="THÔNG TIN CHUNG">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Chi nhánh</div>
                  <div className="font-medium break-words">
                    {transactionInsights?.branchLabel || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tài khoản nguồn</div>
                  <div className="font-medium break-all">
                    {transactionInsights?.sourceAccountLabel || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    TK kế toán đối ứng
                  </div>
                  <div className="font-medium break-all">
                    {transaction.correspondentAccountingAccountId || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ngày giao dịch</div>
                  <div className="font-medium">
                    {formatGMT7(transaction.transDate, "date") || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Trạng thái</div>
                  {isPosted ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Đã hạch toán
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      Chưa hạch toán
                    </span>
                  )}
                </div>
              </div>
            </DrawerSection>
          </div>
        ) : null
      }
    />
  );
}
