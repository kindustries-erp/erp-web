import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import {
  StandardFormDrawer,
  DrawerAuditTimeline,
  type DrawerTopTabItem,
  type DrawerAuditLogItem,
} from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  DrawerRow,
  type DrawerAction,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Plus,
  Trash2,
  Scale,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  Receipt,
  ExternalLink,
  Landmark,
} from "lucide-react";
import {
  accountingApi,
  type ChartOfAccountItem,
  type UpdateJournalEntryPayload,
} from "@/modules/accounting/api/accountingApi";
import { getBranchesApi, type Branch } from "@/modules/branches/api/branchApi";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export interface JournalEntryDetailDrawerProps {
  open: boolean;
  journalEntryId: string | null;
  initialMode?: "view" | "edit";
  initialData?: any;
  onClose: () => void;
  onSaved?: (entry: any) => void;
}

interface FormLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

function generateLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function JournalEntryDetailDrawer({
  open,
  journalEntryId,
  initialMode = "view",
  initialData,
  onClose,
  onSaved,
}: JournalEntryDetailDrawerProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const isEdit = mode === "edit";

  // Form states
  const [entryNo, setEntryNo] = useState("");
  const [postingDate, setPostingDate] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [branchId, setBranchId] = useState("");
  const [description, setDescription] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [lines, setLines] = useState<FormLine[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync mode when initialMode changes
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  // Fetch Journal Entry details
  const { data: journalEntry } = useQuery({
    queryKey: ["journal-entry-detail", journalEntryId],
    queryFn: () => accountingApi.getJournalEntryById(journalEntryId!),
    enabled: open && !!journalEntryId,
  });

  // Fetch Chart of Accounts for Combobox
  const { data: accountsData } = useQuery({
    queryKey: ["chart-of-accounts-dropdown"],
    queryFn: () => accountingApi.getChartOfAccounts({ page: 1, pageSize: 500 }),
    enabled: open,
    staleTime: 60 * 1000,
  });

  // Fetch Branches for Combobox
  const { data: branchesData } = useQuery({
    queryKey: ["branches-dropdown"],
    queryFn: () => getBranchesApi(),
    enabled: open,
    staleTime: 60 * 1000,
  });

  const accountOptions = useMemo(() => {
    const list: ChartOfAccountItem[] = Array.isArray(accountsData)
      ? accountsData
      : accountsData?.items || [];
    return list
      .filter((a) => a.isActive !== false && a.is_active !== false)
      .map((a) => {
        const code = a.accountCode || a.account_code || "";
        const name = a.accountName || a.account_name || "";
        return {
          value: a.id,
          label: `${code} - ${name}`,
          code,
          name,
        };
      });
  }, [accountsData]);

  const branchOptions = useMemo(() => {
    const list: Branch[] = Array.isArray(branchesData) ? branchesData : [];
    return list.map((b) => ({
      value: b.id,
      label: b.code ? `${b.code} - ${b.name}` : b.name,
    }));
  }, [branchesData]);

  // Populate form state from loaded data or initialData
  const activeData = journalEntry || initialData;

  const populateForm = useCallback((data: any) => {
    if (!data) return;
    setEntryNo(data.entryNo || data.entry_no || data._entryNo || "");
    setPostingDate(
      data.date
        ? String(data.date).slice(0, 10)
        : data._date
          ? String(data._date).slice(0, 10)
          : "",
    );
    setDocumentDate(
      data.documentDate
        ? String(data.documentDate).slice(0, 10)
        : data._documentDate
          ? String(data._documentDate).slice(0, 10)
          : "",
    );
    setBranchId(data.branchId || data.branch_id || data.branch?.id || "");
    setDescription(
      data.description || data._description || data.generalDescription || "",
    );
    setSubjectName(
      data.subjectName || data.subject_name || data._subjectName || "",
    );

    const rawLines = Array.isArray(data.lines)
      ? data.lines
      : Array.isArray(data._lines)
        ? data._lines
        : [];

    if (rawLines.length > 0) {
      setLines(
        rawLines.map((l: any) => ({
          id: l.id || generateLineId(),
          accountId: l.accountId || l.account_id || l.account?.id || "",
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
          description: l.description || "",
        })),
      );
    } else {
      setLines([
        {
          id: generateLineId(),
          accountId: "",
          debit: 0,
          credit: 0,
          description: "",
        },
        {
          id: generateLineId(),
          accountId: "",
          debit: 0,
          credit: 0,
          description: "",
        },
      ]);
    }
    setFormError(null);
  }, []);

  useEffect(() => {
    if (open && activeData) {
      populateForm(activeData);
    }
  }, [open, activeData, populateForm]);

  // Calculations
  const totalDebit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  }, [lines]);

  const difference = useMemo(() => {
    return Math.abs(totalDebit - totalCredit);
  }, [totalDebit, totalCredit]);

  const isBalanced = useMemo(() => {
    return difference < 0.01 && totalDebit > 0;
  }, [difference, totalDebit]);

  // Line operations
  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: generateLineId(),
        accountId: "",
        debit: 0,
        credit: 0,
        description: description || "",
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      // Keep at least 2 lines for double-entry
      setLines((prev) =>
        prev.map((l, i) =>
          i === index
            ? { ...l, accountId: "", debit: 0, credit: 0, description: "" }
            : l,
        ),
      );
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (
    index: number,
    field: keyof FormLine,
    value: any,
  ) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const updated = { ...line, [field]: value };
        // If updating debit > 0, reset credit to 0 (mutually exclusive)
        if (field === "debit" && Number(value) > 0) {
          updated.credit = 0;
        }
        // If updating credit > 0, reset debit to 0 (mutually exclusive)
        if (field === "credit" && Number(value) > 0) {
          updated.debit = 0;
        }
        return updated;
      }),
    );
  };

  // Auto-Balance feature
  const handleAutoBalance = () => {
    if (difference < 0.01) return;

    const diff = Number(difference.toFixed(2));
    const fallbackDesc = description || lines[0]?.description || "";

    if (totalDebit > totalCredit) {
      // Need more credit: find first empty credit line or add new line
      const emptyLineIdx = lines.findIndex(
        (l) => !l.credit && !l.debit && !l.accountId,
      );
      if (emptyLineIdx >= 0) {
        handleUpdateLine(emptyLineIdx, "credit", diff);
      } else {
        setLines((prev) => [
          ...prev,
          {
            id: generateLineId(),
            accountId: "",
            debit: 0,
            credit: diff,
            description: fallbackDesc,
          },
        ]);
      }
    } else {
      // Need more debit: find first empty debit line or add new line
      const emptyLineIdx = lines.findIndex(
        (l) => !l.credit && !l.debit && !l.accountId,
      );
      if (emptyLineIdx >= 0) {
        handleUpdateLine(emptyLineIdx, "debit", diff);
      } else {
        setLines((prev) => [
          ...prev,
          {
            id: generateLineId(),
            accountId: "",
            debit: diff,
            credit: 0,
            description: fallbackDesc,
          },
        ]);
      }
    }
  };

  // Mutation for saving journal entry updates
  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateJournalEntryPayload) => {
      const targetId = activeData?.id || journalEntryId;
      if (!targetId) throw new Error("Missing journal entry ID");
      return accountingApi.updateJournalEntry(targetId, payload);
    },
    onSuccess: (updatedEntry) => {
      showToast({
        title: t("common.success", "Thành công"),
        description: t(
          "journalEntries.drawer.saveSuccess",
          "Cập nhật bút toán thành công",
        ),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({
        queryKey: ["journal-entry-detail", journalEntryId],
      });
      setMode("view");
      if (onSaved) {
        onSaved(updatedEntry);
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("journalEntries.drawer.saveError", "Cập nhật bút toán thất bại");
      setFormError(msg);
      showToast({
        title: t("common.error", "Lỗi"),
        description: msg,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    setFormError(null);

    // Filter valid lines
    const validLines = lines.filter(
      (l) => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0),
    );

    if (validLines.length === 0) {
      setFormError(
        t(
          "journalEntries.form.validationError",
          "Vui lòng nhập ít nhất một dòng định khoản Nợ/Có hợp lệ.",
        ),
      );
      return;
    }

    if (!isBalanced) {
      setFormError(
        t(
          "journalEntries.drawer.unbalancedError",
          "Hạch toán không cân bằng: Tổng Nợ phải bằng Tổng Có.",
        ),
      );
      return;
    }

    const payload: UpdateJournalEntryPayload = {
      entryNo: entryNo.trim() || undefined,
      date: postingDate ? new Date(postingDate).toISOString() : undefined,
      documentDate: documentDate || undefined,
      branchId: branchId || undefined,
      description: description.trim() || undefined,
      subjectName: subjectName.trim() || undefined,
      lines: validLines.map((l) => ({
        id: l.id.startsWith("line-") ? undefined : l.id,
        accountId: l.accountId,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
        description: l.description ? l.description.trim() : description.trim(),
      })),
    };

    updateMutation.mutate(payload);
  };

  const handleCancelEdit = () => {
    if (activeData) {
      populateForm(activeData);
    }
    setMode("view");
  };

  // Status mapping
  const status = activeData?.status || "POSTED";
  const getStatusBadge = () => {
    switch (status) {
      case "POSTED":
        return (
          <Badge
            variant="default"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          >
            {t("journalEntries.drawer.statusPosted", "Đã ghi sổ")}
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {t("journalEntries.drawer.statusDraft", "Bản nháp")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            {t("journalEntries.drawer.statusCancelled", "Đã hủy")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Source Type mapping
  const sourceType =
    activeData?.sourceType || activeData?._sourceType || "OTHER";
  const getSourceTypeBadge = () => {
    switch (sourceType) {
      case "BANK":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800">
            {t("journalEntries.tabs.bank", "Ngân hàng")}
          </Badge>
        );
      case "CASH":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800">
            {t("journalEntries.tabs.cash", "Tiền mặt")}
          </Badge>
        );
      case "INVOICE":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-800">
            {t("journalEntries.tabs.invoice", "Hóa đơn VAT")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {t("journalEntries.tabs.other", "Tổng hợp / Khác")}
          </Badge>
        );
    }
  };

  const handleOpenSourceDocument = useCallback(
    (type: string, id: string | null | undefined) => {
      if (!id) return;
      if (type === "INVOICE") {
        window.dispatchEvent(
          new CustomEvent("open_erp_document", {
            detail: { type: "erp_invoice", id },
          }),
        );
      } else if (type === "BANK") {
        window.dispatchEvent(
          new CustomEvent("open_erp_document", {
            detail: { type: "bank_transaction", id },
          }),
        );
      }
    },
    [],
  );

  // Actions footer
  const actions: DrawerAction[] = isEdit
    ? [
        {
          label: t("common.cancel", "Hủy bỏ"),
          variant: "outline",
          onClick: handleCancelEdit,
          disabled: updateMutation.isPending,
        },
        {
          label: updateMutation.isPending
            ? t("common.saving", "Đang lưu...")
            : t("common.save", "Lưu thay đổi"),
          onClick: handleSave,
          disabled: updateMutation.isPending || !isBalanced,
        },
      ]
    : [
        {
          label: t("common.close", "Đóng"),
          variant: "outline",
          onClick: onClose,
        },
        {
          label: t("common.edit", "Chỉnh sửa"),
          onClick: () => setMode("edit"),
        },
      ];

  const branchName = useMemo(() => {
    const found = branchOptions.find((b) => b.value === branchId);
    return (
      found?.label || activeData?.branch?.name || activeData?._branch || "—"
    );
  }, [branchOptions, branchId, activeData]);

  const auditItems: DrawerAuditLogItem[] = useMemo(() => {
    if (!activeData) return [];
    const items: DrawerAuditLogItem[] = [];

    if (activeData.createdAt) {
      items.push({
        id: "created",
        actionType: "CREATE",
        actionLabel: t(
          "journalEntries.drawer.auditCreated",
          "Khởi tạo bút toán",
        ),
        timestamp: activeData.createdAt,
        message: `Bút toán số ${entryNo || activeData.entryNo || activeData._entryNo || "—"} (${sourceType})`,
      });
    }

    if (activeData.date || activeData._date) {
      items.push({
        id: "posted",
        actionType: "SYNC",
        actionLabel: t("journalEntries.drawer.auditPosted", "Ghi nhận sổ cái"),
        timestamp: activeData.date || activeData._date,
        message: `Đã ghi nhận hạch toán kế toán vào sổ cái ngày ${postingDate || String(activeData.date || activeData._date).slice(0, 10)}.`,
      });
    }

    if (activeData.updatedAt && activeData.updatedAt !== activeData.createdAt) {
      items.push({
        id: "updated",
        actionType: "UPDATE",
        actionLabel: t(
          "journalEntries.drawer.auditUpdated",
          "Cập nhật bút toán",
        ),
        timestamp: activeData.updatedAt,
        message: t(
          "journalEntries.drawer.auditUpdatedDesc",
          "Bút toán đã được điều chỉnh định khoản hoặc thông tin chung.",
        ),
      });
    }

    return items;
  }, [activeData, entryNo, sourceType, postingDate, t]);

  const drawerTabs: DrawerTopTabItem[] = useMemo(() => {
    return [
      {
        key: "details",
        label: t("journalEntries.drawer.tabDetails", "Chi tiết"),
        icon: <FileText className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-4 pb-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Section 1: Chi tiết dòng định khoản Nợ / Có */}
            <DrawerSection
              title={`${t("journalEntries.drawer.linesSection", "Chi tiết dòng định khoản Nợ / Có")} (${lines.length})`}
              collapsible
              defaultCollapsed={false}
              titleExtra={
                isEdit ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1.5"
                      onClick={handleAutoBalance}
                      disabled={difference < 0.01}
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {t(
                          "journalEntries.drawer.autoBalance",
                          "Tự động cân đối",
                        )}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1.5"
                      onClick={handleAddLine}
                    >
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {t("journalEntries.drawer.addLine", "Thêm dòng")}
                      </span>
                    </Button>
                  </div>
                ) : null
              }
            >
              {/* Multi-line Posting Table */}
              <div className="border border-border/70 rounded-lg overflow-hidden bg-background">
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/60 text-muted-foreground sticky top-0 z-10 border-b border-border/70 backdrop-blur-sm">
                      <tr>
                        <th className="py-2 px-2.5 text-center font-semibold w-10 min-w-[40px]">
                          #
                        </th>
                        <th className="py-2 px-3 font-semibold min-w-[220px]">
                          {t(
                            "journalEntries.drawer.account",
                            "Tài khoản kế toán",
                          )}
                        </th>
                        <th className="py-2 px-3 font-semibold text-right w-36 min-w-[140px]">
                          {t("journalEntries.drawer.debit", "Phát sinh Nợ")}
                        </th>
                        <th className="py-2 px-3 font-semibold text-right w-36 min-w-[140px]">
                          {t("journalEntries.drawer.credit", "Phát sinh Có")}
                        </th>
                        <th className="py-2 px-3 font-semibold min-w-[200px]">
                          {t(
                            "journalEntries.drawer.lineDesc",
                            "Diễn giải dòng",
                          )}
                        </th>
                        {isEdit && (
                          <th className="py-2 px-2 text-center font-semibold w-12 min-w-[48px]">
                            —
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {lines.map((line, idx) => {
                        const accountName =
                          accountOptions.find((a) => a.value === line.accountId)
                            ?.label ||
                          line.accountId ||
                          "—";

                        return (
                          <tr
                            key={line.id || idx}
                            className="hover:bg-muted/30 transition-colors group"
                          >
                            {/* STT (1-based) */}
                            <td className="py-2 px-2.5 text-center font-mono text-muted-foreground align-top pt-3">
                              {idx + 1}
                            </td>

                            {/* Tài khoản kế toán */}
                            <td className="py-2 px-3 align-top">
                              {isEdit ? (
                                <Combobox
                                  options={accountOptions}
                                  value={line.accountId}
                                  onChange={(val) =>
                                    handleUpdateLine(idx, "accountId", val)
                                  }
                                  placeholder={t(
                                    "journalEntries.drawer.selectAccount",
                                    "Chọn tài khoản",
                                  )}
                                  searchPlaceholder={t(
                                    "common.search",
                                    "Tìm mã hoặc tên...",
                                  )}
                                  className="w-full text-xs h-8"
                                />
                              ) : (
                                <div className="pt-1 font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                                  {accountName}
                                </div>
                              )}
                            </td>

                            {/* Phát sinh Nợ */}
                            <td className="py-2 px-3 text-right align-top">
                              {isEdit ? (
                                <input
                                  type="number"
                                  min={0}
                                  step={1000}
                                  value={line.debit || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    handleUpdateLine(
                                      idx,
                                      "debit",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className={cn(
                                    inputCls,
                                    "text-right h-8 text-xs font-mono font-medium",
                                    Number(line.debit) > 0 &&
                                      "text-slate-900 dark:text-slate-100",
                                  )}
                                />
                              ) : (
                                <div
                                  className={cn(
                                    "pt-1 tabular-nums font-mono text-xs",
                                    Number(line.debit) > 0
                                      ? "font-semibold text-slate-900 dark:text-slate-100"
                                      : "text-muted-foreground/40",
                                  )}
                                >
                                  {Number(line.debit) > 0
                                    ? money(line.debit)
                                    : "—"}
                                </div>
                              )}
                            </td>

                            {/* Phát sinh Có */}
                            <td className="py-2 px-3 text-right align-top">
                              {isEdit ? (
                                <input
                                  type="number"
                                  min={0}
                                  step={1000}
                                  value={line.credit || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    handleUpdateLine(
                                      idx,
                                      "credit",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className={cn(
                                    inputCls,
                                    "text-right h-8 text-xs font-mono font-medium",
                                    Number(line.credit) > 0 &&
                                      "text-slate-900 dark:text-slate-100",
                                  )}
                                />
                              ) : (
                                <div
                                  className={cn(
                                    "pt-1 tabular-nums font-mono text-xs",
                                    Number(line.credit) > 0
                                      ? "font-semibold text-slate-900 dark:text-slate-100"
                                      : "text-muted-foreground/40",
                                  )}
                                >
                                  {Number(line.credit) > 0
                                    ? money(line.credit)
                                    : "—"}
                                </div>
                              )}
                            </td>

                            {/* Diễn giải dòng */}
                            <td className="py-2 px-3 align-top">
                              {isEdit ? (
                                <input
                                  type="text"
                                  value={line.description}
                                  placeholder={
                                    description ||
                                    t(
                                      "journalEntries.drawer.lineDesc",
                                      "Diễn giải dòng...",
                                    )
                                  }
                                  onChange={(e) =>
                                    handleUpdateLine(
                                      idx,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(inputCls, "h-8 text-xs")}
                                />
                              ) : (
                                <div className="pt-1 text-slate-600 dark:text-slate-300 text-xs break-words">
                                  {line.description || description || "—"}
                                </div>
                              )}
                            </td>

                            {/* Nút Xóa dòng (Edit mode) */}
                            {isEdit && (
                              <td className="py-2 px-2 text-center align-top pt-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-colors"
                                  onClick={() => handleRemoveLine(idx)}
                                  title={t("common.delete", "Xóa dòng")}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Footer */}
                <div className="p-3 bg-muted/40 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-muted-foreground">
                        {t("journalEntries.drawer.totalDebit", "Tổng Nợ")}:
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {money(totalDebit)}
                      </span>
                    </div>
                    <div className="h-3.5 w-[1px] bg-border/80" />
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-muted-foreground">
                        {t("journalEntries.drawer.totalCredit", "Tổng Có")}:
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {money(totalCredit)}
                      </span>
                    </div>
                  </div>

                  {/* Balance Status Badge */}
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 py-1 px-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {t(
                            "journalEntries.drawer.balanced",
                            "Cân đối (Δ = 0 đ)",
                          )}
                        </span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1.5 py-1 px-2.5 animate-pulse"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {t("journalEntries.drawer.difference", "Lệch")}:{" "}
                          {money(difference)}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* Section 2: Diễn giải & Đối tượng liên quan */}
            <DrawerSection
              title={t(
                "journalEntries.drawer.description",
                "Diễn giải & Thông tin đối tượng",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="space-y-3">
                <DrawerField
                  label={t(
                    "journalEntries.drawer.description",
                    "Diễn giải chung",
                  )}
                >
                  {isEdit ? (
                    <textarea
                      rows={3}
                      value={description}
                      placeholder={t(
                        "journalEntries.drawer.description",
                        "Nhập diễn giải tổng quát của bút toán...",
                      )}
                      onChange={(e) => setDescription(e.target.value)}
                      className={cn(inputCls, "resize-y py-2 text-xs")}
                    />
                  ) : (
                    <div className="p-2.5 bg-surface/50 border border-border/50 rounded-lg text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {description || "—"}
                    </div>
                  )}
                </DrawerField>

                <DrawerField
                  label={t(
                    "journalEntries.drawer.subjectName",
                    "Đối tượng (Khách hàng / Nhà cung cấp / Người nộp)",
                  )}
                >
                  {isEdit ? (
                    <input
                      type="text"
                      value={subjectName}
                      placeholder={t(
                        "journalEntries.drawer.subjectPlaceholder",
                        "Tên khách hàng / nhà cung cấp / cá nhân...",
                      )}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className={cn(inputCls, "h-8 text-xs")}
                    />
                  ) : (
                    <div className="pt-1 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {subjectName || "—"}
                    </div>
                  )}
                </DrawerField>
              </div>
            </DrawerSection>
          </div>
        ),
      },
      {
        key: "history",
        label: t("journalEntries.drawer.tabHistory", "Lịch sử & Kiểm duyệt"),
        icon: <History className="w-3.5 h-3.5" />,
        badgeCount: auditItems.length,
        content: (
          <div className="p-3 bg-surface/50 rounded-xl border border-border/70">
            <DrawerAuditTimeline
              items={auditItems}
              emptyLabel={t(
                "journalEntries.drawer.noAuditLogs",
                "Chưa có ghi nhận lịch sử.",
              )}
            />
          </div>
        ),
      },
    ];
  }, [
    t,
    formError,
    lines,
    isEdit,
    difference,
    accountOptions,
    description,
    totalDebit,
    totalCredit,
    isBalanced,
    subjectName,
    auditItems,
  ]);

  const rightPanelContent = (
    <div className="space-y-3 pb-3">
      {/* Right Section 1: Thông tin chứng từ */}
      <DrawerSection
        title={t("journalEntries.drawer.entryInfo", "Thông tin chứng từ")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="space-y-2.5">
          {isEdit ? (
            <>
              <DrawerField
                label={t("journalEntries.drawer.entryNo", "Số chứng từ")}
              >
                <input
                  type="text"
                  value={entryNo}
                  onChange={(e) => setEntryNo(e.target.value)}
                  className={cn(inputCls, "h-8 text-xs font-mono font-medium")}
                />
              </DrawerField>

              <DrawerField
                label={t("journalEntries.drawer.postingDate", "Ngày hạch toán")}
              >
                <DatePicker
                  value={postingDate}
                  onChange={(val) => setPostingDate(val || "")}
                  className="w-full text-xs"
                />
              </DrawerField>

              <DrawerField
                label={t("journalEntries.drawer.documentDate", "Ngày chứng từ")}
              >
                <DatePicker
                  value={documentDate}
                  onChange={(val) => setDocumentDate(val || "")}
                  className="w-full text-xs"
                />
              </DrawerField>

              <DrawerField
                label={t("journalEntries.drawer.branch", "Chi nhánh")}
              >
                <Combobox
                  options={branchOptions}
                  value={branchId}
                  onChange={(val) => setBranchId(val)}
                  placeholder={t(
                    "journalEntries.drawer.selectBranch",
                    "Chọn chi nhánh",
                  )}
                  className="w-full text-xs h-8"
                />
              </DrawerField>
            </>
          ) : (
            <>
              <DrawerRow
                label={t("journalEntries.drawer.entryNo", "Số chứng từ")}
                value={
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                    {entryNo || "—"}
                  </span>
                }
              />
              <DrawerRow
                label={t("journalEntries.drawer.postingDate", "Ngày hạch toán")}
                value={postingDate || "—"}
              />
              <DrawerRow
                label={t("journalEntries.drawer.documentDate", "Ngày chứng từ")}
                value={documentDate || "—"}
              />
              <DrawerRow
                label={t("journalEntries.drawer.branch", "Chi nhánh")}
                value={branchName}
              />
            </>
          )}
        </div>
      </DrawerSection>

      {/* Right Section 2: Nguồn gốc & Tham chiếu */}
      <DrawerSection
        title={t(
          "journalEntries.drawer.sourceSection",
          "Nguồn gốc & Tham chiếu",
        )}
        collapsible
        defaultCollapsed={false}
      >
        <div className="space-y-2">
          <DrawerRow
            label={t("journalEntries.drawer.sourceType", "Loại nguồn")}
            value={getSourceTypeBadge()}
          />
          <DrawerRow
            label={t("journalEntries.drawer.reference", "Mã tham chiếu")}
            value={(() => {
              const ref = activeData?.reference || activeData?._reference;
              const srcId = activeData?.sourceId || activeData?._sourceId;
              if (!ref) return "—";

              if (sourceType === "INVOICE" && srcId) {
                return (
                  <button
                    type="button"
                    onClick={() => handleOpenSourceDocument("INVOICE", srcId)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:border-purple-300 transition-all cursor-pointer group shadow-xs"
                    title={t(
                      "journalEntries.drawer.viewInvoice",
                      "Xem hóa đơn VAT liên quan",
                    )}
                  >
                    <Receipt className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>{ref}</span>
                    <ExternalLink className="w-3 h-3 text-purple-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
                );
              }

              if (sourceType === "BANK" && srcId) {
                return (
                  <button
                    type="button"
                    onClick={() => handleOpenSourceDocument("BANK", srcId)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:border-blue-300 transition-all cursor-pointer group shadow-xs"
                    title={t(
                      "journalEntries.drawer.viewBankTxn",
                      "Xem giao dịch ngân hàng",
                    )}
                  >
                    <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>{ref}</span>
                    <ExternalLink className="w-3 h-3 text-blue-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </button>
                );
              }

              return (
                <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                  {ref}
                </span>
              );
            })()}
          />
        </div>
      </DrawerSection>

      {/* Right Section 3: Trạng thái & Thời gian */}
      <DrawerSection
        title={t(
          "journalEntries.drawer.historySection",
          "Trạng thái & Thời gian",
        )}
        collapsible
        defaultCollapsed={true}
      >
        <div className="space-y-2 text-xs">
          <DrawerRow
            label={t("journalEntries.columns.status", "Trạng thái")}
            value={getStatusBadge()}
          />
          <DrawerRow
            label={t("journalEntries.drawer.createdAt", "Ngày tạo")}
            value={
              activeData?.createdAt
                ? new Date(activeData.createdAt).toLocaleString("vi-VN")
                : "—"
            }
          />
          <DrawerRow
            label={t("journalEntries.drawer.updatedAt", "Cập nhật lần cuối")}
            value={
              activeData?.updatedAt
                ? new Date(activeData.updatedAt).toLocaleString("vi-VN")
                : "—"
            }
          />
        </div>
      </DrawerSection>
    </div>
  );

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode(isEdit ? "view" : "edit")}
      title={`${t("journalEntries.drawer.title", "Bút toán:")} ${entryNo || journalEntryId || ""}`}
      titleExtra={getStatusBadge()}
      subtitle={t(
        "journalEntries.drawer.subtitle",
        "Chi tiết và định khoản nghiệp vụ kế toán",
      )}
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      actions={actions}
      confirmOnClose={isEdit}
      tabs={drawerTabs}
      defaultTabKey="details"
      rightPanel={rightPanelContent}
    />
  );
}
