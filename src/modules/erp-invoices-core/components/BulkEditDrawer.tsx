import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useUIStore } from "@/core/config/uiStore";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { CopyCheck } from "lucide-react";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

// ── Types ──────────────────────────────────────────────────────────────────

interface BranchOption {
  label: string;
  value: string;
}

interface BulkEditDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  invoices: ErpInvoice[];
  branches: BranchOption[];
  onSuccess: () => void;
}

// ── NotesInputCell (memoized + debounce) ───────────────────────────────────

interface NotesInputCellProps {
  invId: string;
  initialValue: string;
  onNotesChange: (id: string, value: string) => void;
  t: any;
}

const NotesInputCell = React.memo(function NotesInputCell({
  invId,
  initialValue,
  onNotesChange,
  t,
}: NotesInputCellProps) {
  const [localNotes, setLocalNotes] = useState(initialValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalNotes(initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalNotes(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onNotesChange(invId, val);
      }, 300);
    },
    [invId, onNotesChange],
  );

  return (
    <input
      type="text"
      className="form-input w-full h-8 text-sm"
      placeholder={t("bulkEditNotesPlaceholder", "Nhập ghi chú...")}
      value={localNotes}
      onChange={handleChange}
    />
  );
});

// ── BulkEditDrawer ─────────────────────────────────────────────────────────

export function BulkEditDrawer({
  open,
  onClose,
  selectedIds,
  invoices,
  branches,
  onSuccess,
}: BulkEditDrawerProps) {
  const { t } = useTranslation("erpInvoices");
  const showToast = useUIStore((s) => s.showToast);

  // --- Apply-all fields ---
  const [bulkBranchId, setBulkBranchId] = useState<string | null>(null);
  const [bulkNotesValue, setBulkNotesValue] = useState("");

  // --- Per-invoice assignments ---
  const [branchAssignments, setBranchAssignments] = useState<
    Record<string, string>
  >({});
  const [notesAssignments, setNotesAssignments] = useState<
    Record<string, string>
  >({});

  // --- Snapshots để detect dirty ---
  const [initBranch, setInitBranch] = useState<Record<string, string>>({});
  const [initNotes, setInitNotes] = useState<Record<string, string>>({});

  // --- UI state ---
  const [saving, setSaving] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Init / reset khi drawer mở
  useEffect(() => {
    if (open && selectedIds.length > 0) {
      const selectedInvs = invoices.filter((inv) =>
        selectedIds.includes(inv.id),
      );
      const snapshotBranch: Record<string, string> = {};
      const snapshotNotes: Record<string, string> = {};
      selectedInvs.forEach((inv) => {
        snapshotBranch[inv.id] = inv.branchId ?? "";
        snapshotNotes[inv.id] = inv.notes ?? "";
      });
      setBranchAssignments({ ...snapshotBranch });
      setNotesAssignments({ ...snapshotNotes });
      setInitBranch(snapshotBranch);
      setInitNotes(snapshotNotes);
      setBulkBranchId(null);
      setBulkNotesValue("");
      setInvoiceSearch("");
    }
  }, [open, selectedIds, invoices]);

  // isDirty: so sánh assignments hiện tại vs snapshot
  const isDirty = useMemo(
    () =>
      selectedIds.some(
        (id) =>
          (branchAssignments[id] ?? "") !== (initBranch[id] ?? "") ||
          (notesAssignments[id] ?? "") !== (initNotes[id] ?? ""),
      ),
    [selectedIds, branchAssignments, notesAssignments, initBranch, initNotes],
  );

  // Filtered invoice list (client-side search)
  const filteredInvoices = useMemo(() => {
    const s = invoiceSearch.toLowerCase();
    return invoices
      .filter((inv) => selectedIds.includes(inv.id))
      .filter(
        (inv) =>
          !s ||
          inv.invoiceNo?.toLowerCase().includes(s) ||
          inv.serialNo?.toLowerCase().includes(s) ||
          inv.sellerName?.toLowerCase().includes(s) ||
          inv.buyerName?.toLowerCase().includes(s),
      );
  }, [invoiceSearch, invoices, selectedIds]);

  const handleBranchChange = useCallback((id: string, value: string) => {
    setBranchAssignments((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleNotesChange = useCallback((id: string, value: string) => {
    setNotesAssignments((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Columns definition for DataTable
  const columns = useMemo<DataTableColumn<ErpInvoice>[]>(
    () => [
      {
        key: "invoiceNo",
        header: t("invoiceNo", "Số HĐ"),
        size: 120,
        cell: (inv) => (
          <div className="font-medium text-xs text-slate-800">
            {inv.invoiceNo}
          </div>
        ),
      },
      {
        key: "serialNo",
        header: t("serialNo", "Ký hiệu"),
        size: 120,
        cell: (inv) => (
          <div className="text-xs text-slate-800">{inv.serialNo || "---"}</div>
        ),
      },
      {
        key: "partner",
        header: t("partner", "Đối tác"),
        size: 200,
        cell: (inv) => {
          const text = inv.sellerName || inv.buyerName || "---";
          return (
            <Tooltip content={text}>
              <div className="text-[11px] text-slate-500 truncate">{text}</div>
            </Tooltip>
          );
        },
      },
      {
        key: "branch",
        header: t("bulkEditBranch", "Chi nhánh"),
        size: 200,
        cell: (inv) => (
          <Combobox
            options={branches}
            value={branchAssignments[inv.id] ?? ""}
            onChange={(v) => handleBranchChange(inv.id, v ?? "")}
            placeholder={t("bulkEditBranchPlaceholder", "Chọn chi nhánh...")}
          />
        ),
      },
      {
        key: "notes",
        header: t("bulkEditNotes", "Ghi chú"),
        size: 200,
        cell: (inv) => (
          <NotesInputCell
            invId={inv.id}
            initialValue={notesAssignments[inv.id] ?? ""}
            onNotesChange={handleNotesChange}
            t={t}
          />
        ),
      },
    ],
    [
      branches,
      branchAssignments,
      notesAssignments,
      handleBranchChange,
      handleNotesChange,
      t,
    ],
  );

  // Apply-all handlers
  const applyAllBranch = useCallback(() => {
    if (!bulkBranchId) return;
    const updated: Record<string, string> = {};
    selectedIds.forEach((id) => {
      updated[id] = bulkBranchId;
    });
    setBranchAssignments(updated);
  }, [bulkBranchId, selectedIds]);

  const applyAllNotes = useCallback(() => {
    const updated: Record<string, string> = {};
    selectedIds.forEach((id) => {
      updated[id] = bulkNotesValue;
    });
    setNotesAssignments(updated);
  }, [bulkNotesValue, selectedIds]);

  // Save handler — dirty check + group by value + parallel calls
  const handleSave = useCallback(async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      const tasks: Promise<void>[] = [];
      let branchUpdated = 0;
      let notesUpdated = 0;

      // Branch: group các invoice có thay đổi theo giá trị mới
      const branchGroups: Record<string, string[]> = {};
      selectedIds.forEach((id) => {
        const newVal = branchAssignments[id] ?? "";
        if (newVal !== (initBranch[id] ?? "")) {
          if (!branchGroups[newVal]) branchGroups[newVal] = [];
          branchGroups[newVal].push(id);
        }
      });
      if (Object.keys(branchGroups).length > 0) {
        tasks.push(
          Promise.all(
            Object.entries(branchGroups).map(async ([bId, ids]) => {
              const res = await erpInvoicesCoreApi.bulkSetBranch(
                ids,
                bId || null,
              );
              branchUpdated += res.updated || ids.length;
            }),
          ).then(() => {}),
        );
      }

      // Notes: group các invoice có thay đổi theo giá trị mới
      const notesGroups: Record<string, string[]> = {};
      selectedIds.forEach((id) => {
        const newVal = notesAssignments[id] ?? "";
        if (newVal !== (initNotes[id] ?? "")) {
          if (!notesGroups[newVal]) notesGroups[newVal] = [];
          notesGroups[newVal].push(id);
        }
      });
      if (Object.keys(notesGroups).length > 0) {
        tasks.push(
          Promise.all(
            Object.entries(notesGroups).map(async ([noteVal, ids]) => {
              const res = await erpInvoicesCoreApi.bulkSetNotes(ids, noteVal);
              notesUpdated += res.updated || ids.length;
            }),
          ).then(() => {}),
        );
      }

      if (tasks.length === 0) {
        onClose();
        return;
      }

      // Branch & notes calls chạy song song
      await Promise.all(tasks);

      const parts: string[] = [];
      if (branchUpdated > 0)
        parts.push(t("bulkEditSuccessBranch", { count: branchUpdated }));
      if (notesUpdated > 0)
        parts.push(t("bulkEditSuccessNotes", { count: notesUpdated }));
      showToast({
        title: t("bulkEditSuccessTitle", { fields: parts.join(", ") }),
        variant: "default",
      });
      onSuccess();
      onClose();
    } catch {
      showToast({
        title: t("bulkEditErrorTitle", "Không thể cập nhật"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    selectedIds,
    branchAssignments,
    notesAssignments,
    initBranch,
    initNotes,
    t,
    showToast,
    onSuccess,
    onClose,
  ]);

  return (
    <StandardFormDrawer
      open={open}
      onClose={onClose}
      mode="edit" // StandardFormDrawer needs mode
      collapsibleRightPanel={true}
      confirmOnClose={isDirty}
      size="xl"
      layout="2-columns"
      title={t("bulkEditTitle", {
        count: selectedIds.length,
        defaultValue: `Chỉnh sửa hàng loạt ${selectedIds.length} hóa đơn`,
      })}
      actions={[
        {
          label: t("bulkEditCancel", "Hủy"),
          onClick: onClose,
          variant: "outline" as const,
          disabled: saving,
        },
        {
          label: saving
            ? t("bulkEditSaving", "Đang lưu...")
            : t("bulkEditConfirm", "Xác nhận"),
          onClick: handleSave,
          primary: true,
          disabled: saving,
          loading: saving,
        },
      ]}
      leftPanel={
        <div className="space-y-4 pr-1 flex flex-col h-full min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <label className="text-xs font-semibold text-slate-700 shrink-0">
              {t("bulkEditInvoiceListLabel", "Chi tiết theo từng hóa đơn")} (
              {filteredInvoices.length}/{selectedIds.length})
            </label>
            <div className="w-full md:w-64 shrink-0">
              <SearchInput
                value={invoiceSearch}
                onChange={setInvoiceSearch}
                placeholder={t(
                  "bulkEditSearchPlaceholder",
                  "Tìm kiếm hóa đơn...",
                )}
                className="w-full"
                inputClassName="h-8 text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-white flex flex-col">
            <DataTable<ErpInvoice>
              variant="spreadsheet"
              items={filteredInvoices}
              columns={columns}
              getRowKey={(r) => r.id}
              emptyLabel={t(
                "bulkEditNoResults",
                "Không tìm thấy hóa đơn phù hợp",
              )}
              minWidth={800}
              enableColumnResizing={true}
            />
          </div>
        </div>
      }
      rightPanelTitle={t("bulkEditApplyAllCommon", "Áp dụng chung cho tất cả")}
      rightPanelDefaultCollapsed={false}
      rightPanel={
        <div className="space-y-4">
          {/* Branch apply-all */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 font-medium">
              {t("bulkEditBranch", "Chi nhánh")}
            </label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <Combobox
                  options={branches}
                  value={bulkBranchId ?? ""}
                  onChange={(v) => setBulkBranchId(v ?? null)}
                  placeholder={t(
                    "bulkEditBranchPlaceholderCommon",
                    "Chọn chi nhánh...",
                  )}
                />
              </div>
              <Tooltip content={t("bulkEditApplyAll", "Áp dụng tất cả")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-slate-400 hover:text-primary"
                  disabled={!bulkBranchId}
                  onClick={applyAllBranch}
                >
                  <CopyCheck size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Notes apply-all */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 font-medium">
              {t("bulkEditNotes", "Ghi chú")}
            </label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  className="form-input w-full h-9 text-sm"
                  placeholder={t(
                    "bulkEditNotesPlaceholderCommon",
                    "Nhập ghi chú chung...",
                  )}
                  value={bulkNotesValue}
                  onChange={(e) => setBulkNotesValue(e.target.value)}
                />
              </div>
              <Tooltip content={t("bulkEditApplyAll", "Áp dụng tất cả")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-slate-400 hover:text-primary transition-colors"
                  onClick={applyAllNotes}
                >
                  <CopyCheck size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      }
    />
  );
}
