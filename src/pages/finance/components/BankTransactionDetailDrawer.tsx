import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatGMT7, money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePosting } from "@/shared/components/accounting/usePosting";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
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
        // Counterpart line is intentionally left blank for user to choose.
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
      setFormError(null);
      postingState.reset();
      return;
    }

    if (transaction) {
      setEditMode(false);
      setFormError(null);
      hydratePostingState(transaction);
    }
  }, [isOpen, transactionId, transaction?.id, transaction?.postingStatus]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!transactionId) throw new Error("Missing transaction ID");

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
      toast.success("Đã lưu hạch toán giao dịch.");
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
    setFormError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (transaction) hydratePostingState(transaction);
    setFormError(null);
    setEditMode(false);
  };

  const openErpInvoice = (id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: { type: "erp_invoice", id },
    });
    window.dispatchEvent(event);
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
      label: saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi",
      primary: true,
      loading: saveMutation.isPending,
      disabled: saveMutation.isPending,
      onClick: () => saveMutation.mutate(),
    },
  ];

  return (
    <StandardFormDrawer
      open={isOpen}
      onClose={onClose}
      mode={editMode ? "edit" : "view"}
      onToggleEdit={!isLoading && transaction ? startEdit : undefined}
      title="Chi tiết giao dịch"
      size="xl"
      layout="1-column"
      confirmOnClose={editMode && postingState.isDirty}
      actions={editMode ? editActions : viewActions}
      error={formError}
      loading={isLoading}
      leftPanel={
        <div className="flex flex-col gap-6">
          {transaction ? (
            <>
              <DrawerSection title="Thông tin chung">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Ngày giao dịch
                    </span>
                    <span className="font-medium">
                      {formatGMT7(transaction.transDate, "date") || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Tham chiếu
                    </span>
                    <span className="font-medium">
                      {transaction.referenceNumber || "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs">
                      Diễn giải
                    </span>
                    <span className="font-medium">
                      {transaction.description || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Số tiền (Vào)
                    </span>
                    <span className="font-medium text-green-600">
                      {money(transaction.creditAmount) || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Số tiền (Ra)
                    </span>
                    <span className="font-medium text-red-600">
                      {money(transaction.debitAmount) || "—"}
                    </span>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection title="HẠCH TOÁN KẾ TOÁN">
                <PostingSection
                  postingState={postingState}
                  editMode={editMode}
                  isPosted={isPosted}
                  journalEntryId={transaction.journalEntryId}
                  defaultDate={defaultPostingDate}
                  defaultDescription={baseDescription}
                  autoBalanceOnAddLine
                  onUnpost={() => unpostMutation.mutate()}
                  unposting={unpostMutation.isPending}
                />
              </DrawerSection>

              <DrawerSection title="Hóa đơn VAT đã cấn trừ">
                {transaction.invoiceNetOffs &&
                transaction.invoiceNetOffs.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 font-medium">Số HĐ</th>
                          <th className="px-3 py-2 font-medium">
                            Khách hàng / NCC
                          </th>
                          <th className="px-3 py-2 font-medium text-right">
                            Số tiền cấn trừ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {transaction.invoiceNetOffs.map((link: any) => {
                          const inv = link.invoice || link.erpInvoice || {};
                          return (
                            <tr
                              key={link.id}
                              className="hover:bg-gray-50 group"
                            >
                              <td className="px-3 py-2">
                                <span
                                  className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                                  onClick={() => openErpInvoice(inv.id)}
                                >
                                  {inv.invoiceNo || "—"}
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {inv.direction === "IN"
                                  ? inv.sellerName
                                  : inv.buyerName || "—"}
                              </td>
                              <td className="px-3 py-2 text-right font-medium">
                                {money(Number(link.netOffAmount || 0))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
                    Chưa có hóa đơn nào được cấn trừ.
                  </div>
                )}
              </DrawerSection>
            </>
          ) : (
            <div className="text-gray-500 py-4 text-center text-sm">
              Không tìm thấy thông tin giao dịch.
            </div>
          )}
        </div>
      }
    ></StandardFormDrawer>
  );
}
