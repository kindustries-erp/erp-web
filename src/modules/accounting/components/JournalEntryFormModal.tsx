import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { accountingApi } from "../api/accountingApi";
import type { AccountOption } from "../api/accountingApi";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { money } from "@/shared/utils/format";

interface JournalEntryFormModalProps {
  open: boolean;
  onClose: () => void;
}

interface LineState {
  id: number;
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

export function JournalEntryFormModal({
  open,
  onClose,
}: JournalEntryFormModalProps) {
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<LineState[]>([
    { id: 1, account_id: "", debit: 0, credit: 0, description: "" },
    { id: 2, account_id: "", debit: 0, credit: 0, description: "" },
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState("");

  const { data: accountsData, isFetching: loadingAccounts } = useQuery({
    queryKey: ["accounting-accounts", accountSearch],
    queryFn: () => accountingApi.getAccountOptions(accountSearch),
    enabled: open,
  });

  const accountOptions = useMemo(() => {
    if (!accountsData) return [];
    return (accountsData as AccountOption[]).map((a) => ({
      value: a.id,
      label: `${a.account_code} - ${a.account_name}`,
    }));
  }, [accountsData]);

  const addLine = () => {
    setLines([
      ...lines,
      { id: Date.now(), account_id: "", debit: 0, credit: 0, description: "" },
    ]);
  };

  const removeLine = (id: number) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (
    id: number,
    field: keyof LineState,
    value: string | number,
  ) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce(
    (sum, l) => sum + (Number(l.credit) || 0),
    0,
  );
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        date,
        description,
        lines: lines.map((l, i) => ({
          account_id: l.account_id,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description,
          sort: i,
        })),
      };
      const res = await accountingApi.createJournalEntry(payload);

      // Upload files if any
      if (files.length > 0) {
        for (const f of files) {
          await accountingApi.uploadAttachment(res.id, f);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      onClose();
      // Reset form
      setDate("");
      setDescription("");
      setFiles([]);
      setLines([
        { id: 1, account_id: "", debit: 0, credit: 0, description: "" },
        { id: 2, account_id: "", debit: 0, credit: 0, description: "" },
      ]);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setSaveError(
        err?.response?.data?.message ?? err.message ?? "Lỗi tạo bút toán",
      );
    },
  });

  const handleSave = () => {
    setSaveError(null);
    if (!date) {
      setSaveError("Vui lòng nhập ngày hạch toán.");
      return;
    }
    if (!isBalanced) {
      setSaveError("Bút toán mất cân bằng hoặc tổng phát sinh = 0.");
      return;
    }
    for (const l of lines) {
      if (!l.account_id) {
        setSaveError("Vui lòng chọn tài khoản cho tất cả các dòng.");
        return;
      }
    }
    mutation.mutate();
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Tạo Phiếu Khác"
      subtitle="Hạch toán thủ công các nghiệp vụ phát sinh ngoài"
      actions={[
        { label: "Hủy", onClick: onClose },
        {
          label: "Lưu",
          primary: true,
          disabled: mutation.isPending,
          loading: mutation.isPending,
          onClick: handleSave,
        },
      ]}
    >
      <DrawerSection title="Thông tin chung">
        <DrawerField label="Ngày hạch toán" required>
          <input
            type="date"
            className={inputCls}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </DrawerField>

        <DrawerField label="Diễn giải chung">
          <textarea
            className={`${inputCls} min-h-[60px] resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả nghiệp vụ..."
            rows={2}
          />
        </DrawerField>
      </DrawerSection>

      <DrawerSection title="Chi tiết hạch toán">
        <div className="space-y-3">
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="p-3 border border-border rounded-lg bg-surface relative"
            >
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">
                  #{index + 1}
                </span>
                {lines.length > 2 && (
                  <button
                    onClick={() => removeLine(line.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-semibold text-faint mb-1 uppercase tracking-wider">
                    Tài khoản *
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={line.account_id}
                    onChange={(v) => updateLine(line.id, "account_id", v)}
                    placeholder="Chọn tài khoản"
                    searchPlaceholder="Tìm tài khoản..."
                    onSearch={setAccountSearch}
                    loading={loadingAccounts}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-faint mb-1 uppercase tracking-wider">
                    Nợ (Debit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={line.debit || ""}
                    onChange={(e) =>
                      updateLine(line.id, "debit", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-faint mb-1 uppercase tracking-wider">
                    Có (Credit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={line.credit || ""}
                    onChange={(e) =>
                      updateLine(line.id, "credit", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[11px] font-semibold text-faint mb-1 uppercase tracking-wider">
                    Diễn giải chi tiết
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    value={line.description}
                    onChange={(e) =>
                      updateLine(line.id, "description", e.target.value)
                    }
                    placeholder="Diễn giải dòng..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm dòng
          </button>
        </div>

        <div className="mt-4 flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border">
          <div className="text-sm font-semibold text-[color:var(--muted-fg)]">
            Tổng cộng:
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-[color:var(--faint)] mr-2">Nợ:</span>
              <span
                className={`font-mono font-semibold ${totalDebit !== totalCredit ? "text-red-500" : ""}`}
              >
                {money(totalDebit)}
              </span>
            </div>
            <div>
              <span className="text-[color:var(--faint)] mr-2">Có:</span>
              <span
                className={`font-mono font-semibold ${totalDebit !== totalCredit ? "text-red-500" : ""}`}
              >
                {money(totalCredit)}
              </span>
            </div>
          </div>
        </div>
      </DrawerSection>

      <DrawerSection title="Tệp đính kèm">
        <FileUploadBox
          multiple
          files={files}
          onFilesChange={setFiles}
          maxSizeMb={10}
        />
      </DrawerSection>

      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mb-3 mt-4">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}
