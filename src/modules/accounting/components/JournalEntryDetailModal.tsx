import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Trash2 } from "lucide-react";
import { accountingApi } from "../api/accountingApi";
import type { AccountOption } from "../api/accountingApi";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
import { money, fmtDate } from "@/shared/utils/format";

// We can just use fmtDate directly.
function fDate(d: string | null | undefined) {
  if (!d) return "—";
  return fmtDate(d);
}

interface LineEditState {
  id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalEntryDetailModalProps {
  open: boolean;
  onClose: () => void;
  journalId: string | null;
}

export function JournalEntryDetailModal({
  open,
  onClose,
  journalId,
}: JournalEntryDetailModalProps) {
  const queryClient = useQueryClient();

  const [lines, setLines] = useState<LineEditState[]>([]);
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [filesToAdd, setFilesToAdd] = useState<File[]>([]);
  const [accountSearch, setAccountSearch] = useState("");

  const { data: journal, isFetching: loadingJournal } = useQuery({
    queryKey: ["journal-entry", journalId],
    queryFn: async () => {
      if (!journalId) return null;
      return accountingApi.getJournalEntry(journalId);
    },
    enabled: !!journalId && open,
  });

  const { data: sourceDoc } = useQuery({
    queryKey: ["journal-source-doc", journalId],
    queryFn: async () => {
      if (!journalId || !journal?.reference_id) return null;
      return accountingApi.getSourceDocument(journalId);
    },
    enabled: !!journalId && !!journal?.reference_id && open,
  });

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

  useEffect(() => {
    if (open && journal) {
      setLines(
        journal.lines?.map((l) => ({
          id: l.id,
          account_id: l.account_id,
          debit: l.debit,
          credit: l.credit,
          description: l.description ?? "",
        })) ?? [],
      );
      setDescription(journal.description || "");
      setFilesToAdd([]);
      setSaveError(null);
      setEditing(false);
    }
  }, [open, journal]);

  const updateLine = (
    id: string,
    field: keyof LineEditState,
    value: string | number,
  ) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!journalId) return;
      const payload = {
        description,
        lines: lines.map((l) => ({
          id: l.id,
          account_id: l.account_id,
          description: l.description,
        })),
      };
      await accountingApi.updateJournalEntry(journalId, payload);

      if (filesToAdd.length > 0) {
        for (const f of filesToAdd) {
          await accountingApi.uploadAttachment(journalId, f);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entry", journalId] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setEditing(false);
      setFilesToAdd([]);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setSaveError(
        err?.response?.data?.message ?? err.message ?? "Lỗi cập nhật bút toán",
      );
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      if (!journalId) return;
      await accountingApi.deleteAttachment(journalId, attachmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entry", journalId] });
    },
  });

  const handleDownload = async (attachmentId: string) => {
    if (!journalId) return;
    try {
      const url = await accountingApi.getAttachmentUrl(journalId, attachmentId);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (!journal && !loadingJournal) return null;

  return (
    <DrawerModal
      open={open}
      onClose={() => {
        setEditing(false);
        onClose();
      }}
      title={`Chi tiết Phiếu: ${journal?.voucher_no || "..."}`}
      subtitle={
        journal?.reference_type
          ? `Tham chiếu từ: ${journal.reference_type}`
          : "Phiếu hạch toán thủ công"
      }
      actions={
        editing
          ? [
              { label: "Hủy", onClick: () => setEditing(false) },
              {
                label: "Lưu thay đổi",
                primary: true,
                disabled: mutation.isPending,
                loading: mutation.isPending,
                onClick: () => mutation.mutate(),
              },
            ]
          : [
              {
                label: "Sửa phiếu",
                onClick: () => setEditing(true),
              },
              { label: "Đóng", onClick: onClose },
            ]
      }
    >
      <DrawerSection title="Thông tin chung">
        {editing ? (
          <DrawerField label="Diễn giải chung">
            <textarea
              className={`${inputCls} min-h-[60px] resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </DrawerField>
        ) : (
          <>
            <DrawerRow label="Ngày hạch toán" value={fDate(journal?.date)} />
            <DrawerRow label="Diễn giải" value={journal?.description} />
            <DrawerRow label="Trạng thái" value={journal?.status} />
          </>
        )}
      </DrawerSection>

      <DrawerSection title="Chi tiết hạch toán">
        {editing && (
          <div className="text-[11px] text-[color:var(--muted-fg)] mb-3 bg-[color:var(--warn-bg)] text-[color:var(--warn-fg)] p-2 rounded border border-[color:var(--warn-border)]">
            * Lưu ý: Chỉ được phép cập nhật Tài khoản và Diễn giải. Ngày tháng
            và Số tiền không thể chỉnh sửa để đảm bảo tính toàn vẹn của sổ sách.
          </div>
        )}

        <div className="space-y-3">
          {lines.map((line, index) => {
            const isDebit = line.debit > 0;
            return (
              <div
                key={line.id}
                className="p-3 border border-border rounded-lg bg-surface"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-primary">
                    #{index + 1}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium ${isDebit ? "text-green-600" : "text-blue-600"}`}
                  >
                    {isDebit
                      ? `Nợ: ${money(line.debit)}`
                      : `Có: ${money(line.credit)}`}
                  </span>
                </div>

                {editing ? (
                  <div className="grid gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-faint mb-1">
                        Tài khoản
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
                      <label className="block text-[11px] font-semibold text-faint mb-1">
                        Diễn giải chi tiết
                      </label>
                      <input
                        type="text"
                        className={inputCls}
                        value={line.description}
                        onChange={(e) =>
                          updateLine(line.id, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[color:var(--muted-fg)]">
                    <div className="font-medium text-foreground mb-1">
                      {accountOptions.find((o) => o.value === line.account_id)
                        ?.label || line.account_id}
                    </div>
                    <div>{line.description}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DrawerSection>

      <DrawerSection title="Tệp đính kèm">
        {journal?.attachments && journal.attachments.length > 0 && (
          <div className="space-y-2 mb-4">
            {journal.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{att.file_name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(att.id)}
                    className="p-1.5 hover:bg-surface-hover rounded text-primary"
                    title="Tải xuống"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Bạn có chắc chắn muốn xóa tệp này?")) {
                          deleteAttachmentMutation.mutate(att.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                      title="Xóa tệp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <FileUploadBox
            multiple
            files={filesToAdd}
            onFilesChange={setFilesToAdd}
            maxSizeMb={10}
          />
        )}
      </DrawerSection>

      {journal?.reference_id && (
        <DrawerSection title="Chứng từ gốc">
          <div className="p-3 bg-muted/50 rounded-lg border border-border text-xs">
            <div className="mb-2 font-medium">
              Ref ID: <span className="font-mono">{journal.reference_id}</span>
            </div>
            {sourceDoc ? (
              <pre className="p-2 bg-surface rounded overflow-x-auto text-[10px] text-faint max-h-40">
                {JSON.stringify(sourceDoc, null, 2)}
              </pre>
            ) : (
              <div className="text-faint">
                Đang tải chi tiết chứng từ gốc...
              </div>
            )}
          </div>
        </DrawerSection>
      )}

      {saveError && (
        <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mb-3 mt-4">
          {saveError}
        </div>
      )}
    </DrawerModal>
  );
}
