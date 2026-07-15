import {
  getFileViewUrl,
  type PaymentVoucherAttachment,
} from "@/modules/finance/api/financeApi";
import { IconPaperclip } from "@/shared/components/icons";
import { Eye, X } from "lucide-react";

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
        title="Xem tài liệu"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Eye className="w-4 h-4" />
      </button>
      {onDelete && (
        <button
          type="button"
          title="Xóa đính kèm"
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-lg border border-border bg-surface text-[color:var(--warn-fg)] hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
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
