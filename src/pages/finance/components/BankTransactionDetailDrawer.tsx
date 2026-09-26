import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, BookOpen, History, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  StandardFormDrawer,
  DrawerDocumentTraceability,
  DrawerAuditTimeline,
  type DrawerTopTabItem,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { usePosting } from "@/shared/components/accounting/usePosting";
import { PostingSection } from "@/shared/components/accounting/PostingSection";
import { PostedAccountingSummary } from "@/shared/components/accounting/PostedAccountingSummary";
import { InvoiceNetoffSelectionModal } from "@/modules/bank-statements/components/InvoiceNetoffSelectionModal";
import {
  BankTransactionDetailTab,
  type BankTransactionDetailViewMode,
} from "@/modules/bank-statements/components/BankTransactionDetailTab";
import { BankTransactionPartnerRightPanel } from "@/modules/bank-statements/components/BankTransactionPartnerRightPanel";
import { BankTransactionGeneralInfoSection } from "@/modules/bank-statements/components/BankTransactionGeneralInfoSection";
import {
  ModuleEntityCustomFieldsSection,
  validateModuleRequiredFields,
} from "@/shared/components/ModuleEntityCustomFieldsSection";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSaved?: () => void;
  defaultTabKey?: string;
  initialMode?: "view" | "edit";
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
  defaultTabKey = "txn_details",
  initialMode = "view",
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const postingState = usePosting();

  const [editMode, setEditMode] = useState(false);
  const [accountingEnabled, setAccountingEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>(
    {},
  );
  const [globalAttributes, setGlobalAttributes] = useState<Record<string, any>>(
    {},
  );
  const [editBranchId, setEditBranchId] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [subTabKey, setSubTabKey] = useState<BankTransactionDetailViewMode>(
    defaultTabKey === "partner" ? "partner" : "details",
  );
  const [showInvoiceNetOffModal, setShowInvoiceNetOffModal] = useState(false);

  const { data: transaction, isLoading } = useQuery({
    queryKey: ["bank-transaction", transactionId],
    queryFn: () => bankStatementApi.getTransaction(transactionId!),
    enabled: isOpen && Boolean(transactionId),
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
    const netOffs = Array.isArray(transaction.invoiceNetOffs)
      ? transaction.invoiceNetOffs
      : [];
    const netOffTotal = netOffs.reduce(
      (sum: number, item: any) => sum + Number(item.netOffAmount || 0),
      0,
    );
    return {
      netOffCount: netOffs.length,
      netOffTotal,
    };
  }, [transaction]);

  const initialAccountingEnabled = isPosted;

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

    if (!amount) return [];

    const primaryAccountId = defaultAccountId || counterpartAccountId || "";
    if (!primaryAccountId) return [];

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
      setCategoryId(null);
      setCustomAttributes({});
      setGlobalAttributes({});
      setEditBranchId("");
      setEditDescription("");
      setSubTabKey(defaultTabKey === "partner" ? "partner" : "details");
      postingState.reset();
      return;
    }

    if (transaction) {
      setEditMode(initialMode === "edit");
      setAccountingEnabled(initialAccountingEnabled);
      setFormError(null);
      setEditBranchId(transaction.branchId || transaction.branch?.id || "");
      setEditDescription(
        transaction.description || transaction.accountingDescription || "",
      );
      hydratePostingState(transaction);
      moduleConfigApi
        .getEntityValues("BANK_TXN", transaction.id)
        .then((res) => {
          setCategoryId(res.categoryId || null);
          setCustomAttributes(res.attributes || {});
          setGlobalAttributes(res.globalAttributes || {});
        })
        .catch(() => {});
    }
  }, [
    isOpen,
    transactionId,
    transaction?.id,
    transaction?.postingStatus,
    initialAccountingEnabled,
    initialMode,
    defaultTabKey,
  ]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!transactionId) throw new Error("Missing transaction ID");

      // Validate required custom fields (global & category)
      try {
        const globalDefs =
          await moduleConfigApi.getGlobalAttributeDefs("BANK_TXN");
        let categoryDefs: any[] = [];
        let categoryCode: string | null = null;
        if (categoryId) {
          const cats = await moduleConfigApi.getCategories("BANK_TXN");
          const currentCat = cats.find((c) => c.id === categoryId);
          categoryDefs = currentCat?.attributeDefs || [];
          categoryCode = currentCat?.code || null;
        }

        const missingRequired = validateModuleRequiredFields({
          globalDefs,
          globalAttributes,
          categoryDefs,
          attributes: customAttributes,
          hasCategory: Boolean(categoryId),
          moduleKey: "BANK_TXN",
          categoryCode,
        });

        if (missingRequired.length > 0) {
          throw new Error(
            `Vui lòng nhập các trường bắt buộc: ${missingRequired.join(", ")}`,
          );
        }
      } catch (valErr: any) {
        if (valErr.message?.startsWith("Vui lòng nhập các trường bắt buộc")) {
          throw valErr;
        }
      }

      // 1. Save custom fields if present
      if (
        categoryId !== undefined ||
        customAttributes !== undefined ||
        globalAttributes !== undefined
      ) {
        try {
          await moduleConfigApi.saveEntityValues("BANK_TXN", transactionId, {
            categoryId,
            attributes: customAttributes,
            globalAttributes,
          });
        } catch (cfErr: any) {
          console.warn("Failed to save custom attributes", cfErr);
        }
      }

      // 2. Save branchId and description if changed
      const origBranchId = transaction.branchId || transaction.branch?.id || "";
      const origDescription =
        transaction.description || transaction.accountingDescription || "";

      if (
        editBranchId !== origBranchId ||
        editDescription !== origDescription
      ) {
        await bankStatementApi.updateTransaction(transactionId, {
          branchId: editBranchId || undefined,
          description: editDescription,
          accountingDescription: editDescription,
        });
      }

      if (!accountingEnabled) {
        if (isPosted) {
          return bankStatementApi.unpostTransaction(transactionId);
        }
        return;
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
          : "Đã lưu thông tin giao dịch.",
      );
      setEditMode(false);
      setFormError(null);
      await queryClient.invalidateQueries({
        queryKey: ["bank-transaction", transactionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["module-entity-values", "BANK_TXN", transactionId],
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
    setEditBranchId(transaction.branchId || transaction.branch?.id || "");
    setEditDescription(
      transaction.description || transaction.accountingDescription || "",
    );
    setFormError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (transaction) {
      hydratePostingState(transaction);
      setEditBranchId(transaction.branchId || transaction.branch?.id || "");
      setEditDescription(
        transaction.description || transaction.accountingDescription || "",
      );
    }
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

  // Build Audit Logs
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

  const handleSelectInvoicesForNetOff = async (
    selectedInvoices: {
      id: string;
      amount: number;
      maxAmount?: number;
      invoice?: any;
    }[],
  ) => {
    if (!transactionId) return;
    try {
      for (const inv of selectedInvoices) {
        await bankStatementApi.linkInvoice(transactionId, {
          invoiceId: inv.id,
          netOffAmount: inv.amount,
        });
      }
      toast.success("Đã ghép nối hóa đơn thành công.");
      await queryClient.invalidateQueries({
        queryKey: ["bank-transaction", transactionId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi ghép nối hóa đơn");
    }
  };

  const handleUnlinkInvoiceNode = async (node: any) => {
    if (!transactionId) return;
    try {
      await bankStatementApi.removeInvoice(transactionId, node.id);
      toast.success("Đã gỡ liên kết hóa đơn thành công.");
      await queryClient.invalidateQueries({
        queryKey: ["bank-transaction", transactionId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi gỡ liên kết hóa đơn");
    }
  };

  // Top Navigation Tabs (4 Top Tabs chuẩn theo /standardize-drawer)
  const resolvedDrawerTabs: DrawerTopTabItem[] = useMemo(() => {
    if (!transaction) return [];

    return [
      // 1. Tab Chi tiết (Gồm 2 Sub-Tabs: Chi tiết & Chi tiết theo đối tượng)
      {
        key: "txn_details",
        label: t("bankStatement.tabDetails", {
          defaultValue: "Chi tiết",
        }),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <BankTransactionDetailTab
            transaction={transaction}
            defaultViewMode={subTabKey}
            onViewModeChange={setSubTabKey}
          />
        ),
        rightPanel:
          subTabKey === "partner" ? (
            <BankTransactionPartnerRightPanel transaction={transaction} />
          ) : undefined,
      },

      // 2. Tab Hạch toán kế toán
      {
        key: "accounting",
        label: t("bankStatement.tabAccounting", {
          defaultValue: "Hạch toán kế toán",
        }),
        icon: <BookOpen className="w-3.5 h-3.5" />,
        badgeCount: isPosted ? 1 : 0,
        content: (
          <div className="space-y-4">
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {t("bankStatement.tabAccountingTitle", {
                      defaultValue: "Hạch toán & Định khoản kế toán",
                    })}
                  </span>
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              {editMode ? (
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
              )}
            </DrawerSection>
          </div>
        ),
      },

      // 3. Tab Chứng từ liên kết (Traceability Graph - Full Width)
      {
        key: "traceability",
        label: t("bankStatement.tabTraceability", {
          defaultValue: "Chứng từ liên kết",
        }),
        icon: <Link2 className="w-3.5 h-3.5" />,
        badgeCount: transaction.invoiceNetOffs?.length || 0,
        content: (
          <div className="space-y-4">
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {t("bankStatement.linkedDocsTraceability", {
                      defaultValue: "Mạng lưới chứng từ liên kết & Cấn trừ",
                    })}
                  </span>
                  {(transaction.invoiceNetOffs?.length || 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {transaction.invoiceNetOffs.length}
                    </Badge>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="w-full rounded-xl border border-border/70 overflow-hidden bg-background">
                <DrawerDocumentTraceability
                  rootId={transaction.id}
                  rootType="BANK_TXN"
                  fetchGraph={(id) => bankStatementApi.getTraceabilityGraph(id)}
                  editMode={editMode}
                  onAddLink={() => setShowInvoiceNetOffModal(true)}
                  onUnlinkNode={handleUnlinkInvoiceNode}
                />
              </div>
            </DrawerSection>
          </div>
        ),
      },

      // 4. Tab Lịch sử & Kiểm duyệt (Audit Timeline)
      {
        key: "history",
        label: t("bankStatement.tabHistory", {
          defaultValue: "Lịch sử",
        }),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="space-y-4">
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {t("bankStatement.tabHistoryTitle", {
                      defaultValue: "Lịch sử & Nhật ký thao tác",
                    })}
                  </span>
                  {auditItems.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {auditItems.length}
                    </Badge>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <DrawerAuditTimeline
                items={auditItems}
                emptyLabel={t("bankStatement.noHistory", {
                  defaultValue: "Chưa có ghi nhận lịch sử.",
                })}
              />
            </DrawerSection>
          </div>
        ),
      },
    ];
  }, [
    transaction,
    subTabKey,
    t,
    isPosted,
    editMode,
    accountingEnabled,
    postingState,
    defaultPostingDate,
    baseDescription,
    unpostMutation,
    auditItems,
  ]);

  const effectiveDefaultTabKey = useMemo(() => {
    if (defaultTabKey === "partner") return "txn_details";
    return defaultTabKey || "txn_details";
  }, [defaultTabKey]);

  return (
    <>
      <StandardFormDrawer
        open={isOpen}
        onClose={onClose}
        mode={editMode ? "edit" : "view"}
        collapsibleRightPanel={true}
        onToggleEdit={!isLoading && transaction ? startEdit : undefined}
        title={t("bankStatement.actionDetail", {
          defaultValue: "Chi tiết giao dịch",
        })}
        size="xl"
        layout="2-columns"
        confirmOnClose={editMode && postingState.isDirty}
        actions={editMode ? editActions : viewActions}
        error={formError}
        loading={isLoading}
        tabs={resolvedDrawerTabs}
        defaultTabKey={effectiveDefaultTabKey}
        key={`${transactionId || ""}-${effectiveDefaultTabKey}`}
        rightPanel={
          transaction ? (
            <div className="space-y-4">
              <BankTransactionGeneralInfoSection
                transaction={transaction}
                editMode={editMode}
                branchId={editBranchId}
                onBranchChange={setEditBranchId}
                description={editDescription}
                onDescriptionChange={setEditDescription}
              />

              <ModuleEntityCustomFieldsSection
                moduleKey="BANK_TXN"
                entityId={transaction.id}
                editMode={editMode}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                attributes={customAttributes}
                onAttributesChange={setCustomAttributes}
                globalAttributes={globalAttributes}
                onGlobalAttributesChange={setGlobalAttributes}
                title="THUỘC TÍNH TÙY CHỈNH"
                globalTitle="THUỘC TÍNH MẶC ĐỊNH"
              />
            </div>
          ) : null
        }
      />

      {showInvoiceNetOffModal && transaction && (
        <InvoiceNetoffSelectionModal
          open={showInvoiceNetOffModal}
          onClose={() => setShowInvoiceNetOffModal(false)}
          onSelect={handleSelectInvoicesForNetOff}
          existingInvoiceIds={(transaction.invoiceNetOffs || []).map(
            (n: any) => n.invoiceId || n.invoice?.id,
          )}
          maxAvailableAmount={
            Math.max(
              Number(transaction.creditAmount || 0),
              Number(transaction.debitAmount || 0),
            ) - (transactionInsights?.netOffTotal || 0)
          }
          direction={Number(transaction.creditAmount || 0) > 0 ? "OUT" : "IN"}
        />
      )}
    </>
  );
}
