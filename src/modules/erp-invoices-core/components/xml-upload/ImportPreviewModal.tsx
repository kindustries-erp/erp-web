import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileCode,
  FileText,
  Archive,
  CheckCircle2,
  Clock,
  PackageOpen,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  type FileEntry,
  getFilePreviewStatus,
} from "../../hooks/useInvoiceXmlUpload";
import { erpInvoicesCoreApi } from "../../api/erpInvoicesCoreApi";
import { Eye } from "lucide-react";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";

interface Props {
  open: boolean;
  files: FileEntry[];
  direction: "IN" | "OUT";
  onConfirm: (selectedFiles: FileEntry[]) => void;
  onCancel: () => void;
}

/* ── Status config ── */
const STATUS_CONFIG = {
  "new-invoice": {
    label: "Sẽ tạo HĐ mới",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Icon: CheckCircle2,
    iconCls: "text-emerald-600",
  },
  "attach-pdf": {
    label: "Ghép vào HĐ hiện có",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    Icon: Clock,
    iconCls: "text-blue-500",
  },
  "extract-zip": {
    label: "Extract & import",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: PackageOpen,
    iconCls: "text-amber-600",
  },
} as const;

function FileTypeIcon({ type }: { type: FileEntry["type"] }) {
  if (type === "xml")
    return <FileCode className="w-4 h-4 text-blue-500 shrink-0" />;
  if (type === "pdf")
    return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
  return <Archive className="w-4 h-4 text-amber-500 shrink-0" />;
}

function FileBadge({ type }: { type: FileEntry["type"] }) {
  const map = {
    xml: "bg-blue-100 text-blue-700",
    pdf: "bg-red-100 text-red-700",
    zip: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${map[type]}`}
    >
      {type.toUpperCase()}
    </span>
  );
}

export function ImportPreviewModal({ open, files, direction, onConfirm, onCancel }: Props) {
  // Init all files as selected
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(files.map((f) => f.id)),
  );
  
  const [matchedInvoices, setMatchedInvoices] = useState<Record<string, { id: string; invoiceNo: string; serialNo: string | null; totalAmount: string | null } | null>>({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Re-sync when files list changes (e.g. modal reopened with new files)
  const allIds = useMemo(() => files.map((f) => f.id), [files]);
  const selectedCount = allIds.filter((id) => selectedIds.has(id)).length;

  // Reset selection when modal opens with new files
  const [prevFiles, setPrevFiles] = useState(files);
  if (prevFiles !== files) {
    setPrevFiles(files);
    setSelectedIds(new Set(files.map((f) => f.id)));
  }

  // Fetch matches when files change
  useEffect(() => {
    if (!open) return;
    const pdfNames = files
      .filter((f) => f.type === "pdf" && !f.pairedPdf)
      .map((f) => f.file.name);
      
    if (pdfNames.length > 0) {
      erpInvoicesCoreApi.previewPdfMatch(pdfNames, direction).then(res => {
        setMatchedInvoices(res);
      }).catch(err => {
        console.error("Failed to preview pdf match", err);
      });
    }
  }, [open, files, direction]);

  const counts = useMemo(() => {
    return files.reduce(
      (acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [files]);

  function toggleFile(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedCount === files.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(files.map((f) => f.id)));
    }
  }

  if (!open) return null;

  const selectedFiles = files.filter((f) => selectedIds.has(f.id));

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[600] flex items-center justify-center"
        style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      >
        <div
          className="bg-surface rounded-2xl shadow-2xl border border-border flex flex-col"
          style={{ width: "min(860px, calc(100vw - 32px))", maxHeight: "calc(100vh - 48px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Xem trước danh sách file
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bỏ chọn file không muốn import, sau đó xác nhận
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Summary bar */}
          <div className="px-5 py-2.5 bg-muted/30 border-b border-border shrink-0 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedCount}/{files.length} file được chọn
            </span>
            {!!counts["xml"] && (
              <span className="flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-blue-500" />
                {counts["xml"]} XML
              </span>
            )}
            {!!counts["pdf"] && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                {counts["pdf"]} PDF
              </span>
            )}
            {!!counts["zip"] && (
              <span className="flex items-center gap-1">
                <Archive className="w-3.5 h-3.5 text-amber-500" />
                {counts["zip"]} ZIP
              </span>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                <tr className="border-b border-border">
                  {/* Select-all checkbox */}
                  <th className="w-8 px-3 py-2.5 text-center font-medium text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={selectedCount === files.length && files.length > 0}
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selectedCount > 0 && selectedCount < files.length;
                      }}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-20">
                    Loại
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Tên file
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground w-20">
                    Kích thước
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-44">
                    Ghi chú
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-48">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((entry) => {
                  const isChecked = selectedIds.has(entry.id);
                  const status = getFilePreviewStatus(entry);
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors cursor-pointer ${
                        isChecked ? "hover:bg-muted/20" : "opacity-40 bg-muted/10"
                      }`}
                      onClick={() => toggleFile(entry.id)}
                    >
                      {/* Per-row checkbox */}
                      <td
                        className="px-3 py-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFile(entry.id)}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Type */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <FileTypeIcon type={entry.type} />
                          <FileBadge type={entry.type} />
                        </div>
                      </td>

                      {/* Filename */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="truncate block max-w-[260px] font-medium text-foreground"
                            title={entry.file.name}
                          >
                            {entry.file.name}
                          </span>
                          {entry.type === "pdf" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewFile(entry.file);
                              }}
                              className="text-primary hover:text-primary/80 shrink-0"
                              title="Xem trước file"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Size */}
                      <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                        {(entry.file.size / 1024).toFixed(0)} KB
                      </td>

                      {/* Note */}
                      <td className="px-3 py-2">
                        {entry.type === "xml" && entry.pairedPdf && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã ghép PDF
                          </span>
                        )}
                        {entry.type === "pdf" && (
                          <>
                            {matchedInvoices[entry.file.name] ? (
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-700 font-medium text-[11px]">
                                  Ghép vào: HĐ {matchedInvoices[entry.file.name]?.invoiceNo} (KH: {matchedInvoices[entry.file.name]?.serialNo || "N/A"}) - {Number(matchedInvoices[entry.file.name]?.totalAmount).toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">
                                Ghép vào HĐ hiện có
                              </span>
                            )}
                          </>
                        )}
                        {entry.type === "zip" && (
                          <span className="text-muted-foreground text-[11px]">
                            Server sẽ extract
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}
                        >
                          <cfg.Icon className={`w-3 h-3 ${cfg.iconCls}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 border-t border-border flex items-center justify-between shrink-0"
            style={{
              background: "rgba(249,251,255,0.9)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="text-xs text-muted-foreground">
              {selectedCount === 0 ? (
                <span className="text-amber-600 font-medium">Chọn ít nhất 1 file để import</span>
              ) : (
                <>Đã chọn <strong className="text-foreground">{selectedCount}</strong> / {files.length} file</>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Hủy
              </Button>
              <Button
                size="sm"
                disabled={selectedCount === 0}
                onClick={() => onConfirm(selectedFiles)}
              >
                Xác nhận Import ({selectedCount} file)
              </Button>
            </div>
          </div>
        </div>

        <FilePreviewDrawer
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          file={previewFile}
          zIndex={2000}
        />
      </div>
    </>,
    document.body,
  );
}
