import {
  getFileViewUrl,
  type PaymentVoucherAttachment,
} from "@/modules/finance/api/financeApi";
import { IconPaperclip } from "@/shared/components/icons";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function attachmentFileId(a: PaymentVoucherAttachment): string {
  if (!a.file) return "";
  return typeof a.file === "object" ? a.file.id : a.file;
}

export function attachmentFileName(a: PaymentVoucherAttachment): string {
  if (!a.file) return "File không còn tồn tại";
  if (typeof a.file === "object") {
    return a.file.filename_download ?? a.file.filename_disk ?? a.file.id;
  }
  return `File ${a.file.slice(0, 8)}`;
}

// ── AttachmentRow ─────────────────────────────────────────────────────────────

interface AttachmentRowProps {
  item: PaymentVoucherAttachment;
  onDelete?: (item: PaymentVoucherAttachment) => void;
  onPreview?: (url: string, fileName: string) => void;
}

/**
 * Một dòng đính kèm trong Drawer — hiển thị tên file, loại, ghi chú và nút Xem/Xóa.
 */
export function AttachmentRow({
  item,
  onDelete,
  onPreview,
}: AttachmentRowProps) {
  const fileId = attachmentFileId(item);
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--border-light)] last:border-b-0 bg-[color:var(--muted)]/35">
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-foreground">
          {attachmentFileName(item)}
        </div>
        <div className="text-[11px] text-[color:var(--muted-fg)]">
          {item.attachment_type ?? "OTHER"}
          {item.note ? ` · ${item.note}` : ""}
        </div>
      </div>
      <button
        type="button"
        disabled={!fileId}
        onClick={() => {
          const url = getFileViewUrl(fileId);
          if (onPreview) {
            onPreview(url, attachmentFileName(item));
          } else {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        }}
        className="px-2 py-1 rounded-lg border border-border bg-surface text-xs text-foreground hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Xem
      </button>
      {onDelete && (
        <button
          type="button"
          title="Xóa đính kèm"
          onClick={() => onDelete(item)}
          className="px-2 py-1 rounded-lg border border-border bg-surface text-xs text-[color:var(--warn-fg)] hover:bg-surface-hover"
        >
          Xóa
        </button>
      )}
    </div>
  );
}

// ── AttachmentCell ────────────────────────────────────────────────────────────

interface AttachmentCellProps {
  attachments: PaymentVoucherAttachment[];
}

/**
 * Ô hiển thị số lượng đính kèm trong bảng danh sách chứng từ.
 */
export function AttachmentCell({ attachments }: AttachmentCellProps) {
  if (!attachments.length) {
    return <span className="text-[color:var(--faint)]">—</span>;
  }
  return (
    <span
      title={attachments.map(attachmentFileName).join("\n")}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-[color:var(--muted)] text-[color:var(--muted-fg)]"
    >
      <IconPaperclip />
    </span>
  );
}
