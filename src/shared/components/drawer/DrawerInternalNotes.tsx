import React, { useState } from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { MessageSquare, Send, CornerDownLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export interface DrawerInternalNoteItem {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  createdAt: string | Date;
  content: string;
  isSystem?: boolean;
}

export interface DrawerInternalNotesProps {
  notes: DrawerInternalNoteItem[];
  onAddNote?: (content: string) => Promise<void> | void;
  readOnly?: boolean;
  loading?: boolean;
  emptyLabel?: string;
  className?: string;
}

function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DrawerInternalNotes({
  notes,
  onAddNote,
  readOnly = false,
  loading = false,
  emptyLabel,
  className,
}: DrawerInternalNotesProps) {
  const t = useT();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || submitting || !onAddNote) return;

    setSubmitting(true);
    try {
      await onAddNote(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input section (if not readOnly and onAddNote provided) */}
      {!readOnly && onAddNote && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative rounded-xl border border-border/80 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all p-2.5 shadow-2xs">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("Thêm ghi chú nội bộ (Ctrl + Enter để gửi)...")}
              rows={2}
              className="w-full text-xs bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground">
                <CornerDownLeft className="w-3 h-3 inline mr-1" />
                Ctrl + Enter
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!content.trim() || submitting}
                className="h-7 px-3 text-xs"
              >
                {submitting ? (
                  <svg
                    className="animate-spin w-3 h-3 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <Send className="w-3 h-3 mr-1" />
                )}
                {t("Gửi ghi chú")}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Notes Stream */}
      {loading ? (
        <div className="space-y-2.5 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2.5 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-8 bg-muted/60 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
          <MessageSquare className="w-5 h-5 text-muted-foreground/50 mb-1" />
          <span>{emptyLabel || t("Chưa có ghi chú nội bộ.")}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const initials = getInitials(note.authorName);
            const dateStr = formatDate(note.createdAt);

            return (
              <div key={note.id} className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                  {initials}
                </div>

                <div className="flex-1 min-w-0 bg-surface border border-border/70 rounded-xl p-2.5 shadow-2xs group-hover:border-border transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {note.authorName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
