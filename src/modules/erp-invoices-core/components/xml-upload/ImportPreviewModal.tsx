import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Combobox } from "@/shared/components/Combobox";
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
import { StandardTable } from "@/shared/components/StandardTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { type DataTableColumn } from "@/shared/components/DataTable";

interface Props {
  open: boolean;
  files: FileEntry[];
  direction: "IN" | "OUT";
  onConfirm: (
    selectedFiles: FileEntry[],
    manualMatches: Record<string, string>,
  ) => void;
  onCancel: () => void;
}

function ManualMatchSelect({
  direction,
  value,
  onChange,
  initialOptions,
}: {
  direction: "IN" | "OUT";
  value: string;
  onChange: (val: string) => void;
  initialOptions: { value: string; label: string }[];
}) {
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setOptions(initialOptions);
      return;
    }
    try {
      setLoading(true);
      const res = await erpInvoicesCoreApi.list({
        direction,
        search: query,
        pageSize: 20,
      });
      setOptions(
        res.items.map((inv) => ({
          value: inv.id,
          label: `[${inv.serialNo || "N/A"}] HĐ: ${inv.invoiceNo} - ${Number(inv.totalAmount).toLocaleString("vi-VN")}đ`,
        })),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      loading={loading}
      placeholder="Chọn ghép thủ công..."
      searchPlaceholder="Tìm số HĐ, ký hiệu..."
      emptyLabel="Không tìm thấy hóa đơn"
      className="w-full min-w-[150px]"
      fallbackLabel="Đã chọn hóa đơn"
    />
  );
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

export function ImportPreviewModal({
  open,
  files,
  direction,
  onConfirm,
  onCancel,
}: Props) {
  // Init all files as selected
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      files.forEach((f) => (init[f.id] = true));
      return init;
    },
  );

  const [matchedInvoices, setMatchedInvoices] = useState<
    Record<
      string,
      {
        id: string;
        invoiceNo: string;
        serialNo: string | null;
        totalAmount: string | null;
      } | null
    >
  >({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [manualMatches, setManualMatches] = useState<Record<string, string>>(
    {},
  );
  const [candidateInvoices, setCandidateInvoices] = useState<
    { value: string; label: string }[]
  >([]);

  // Re-sync when files list changes (e.g. modal reopened with new files)
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  // Reset selection when modal opens with new files
  const [prevFiles, setPrevFiles] = useState(files);
  if (prevFiles !== files) {
    setPrevFiles(files);
    const init: Record<string, boolean> = {};
    files.forEach((f) => (init[f.id] = true));
    setRowSelection(init);
    setManualMatches({});
  }

  // Fetch matches when files change
  useEffect(() => {
    if (!open) return;
    const pdfNames = files
      .filter((f) => f.type === "pdf" && !f.pairedPdf)
      .map((f) => f.file.name);

    if (pdfNames.length > 0) {
      erpInvoicesCoreApi
        .previewPdfMatch(pdfNames, direction)
        .then((res) => {
          setMatchedInvoices(res);
        })
        .catch((err) => {
          console.error("Failed to preview pdf match", err);
        });

      erpInvoicesCoreApi.list({ direction, pageSize: 50 }).then((res) => {
        setCandidateInvoices(
          res.items.map((inv) => ({
            value: inv.id,
            label: `[${inv.serialNo || "N/A"}] HĐ: ${inv.invoiceNo} - ${Number(inv.totalAmount).toLocaleString("vi-VN")}đ`,
          })),
        );
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

  const columns: DataTableColumn<FileEntry>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Loại",
        size: 120,
        minSize: 120,
        maxSize: 120,
        cell: (entry) => {
          return (
            <div className="flex items-center gap-1.5">
              <FileTypeIcon type={entry.type} />
              <FileBadge type={entry.type} />
            </div>
          );
        },
      },
      {
        key: "name",
        header: "Tên file",
        size: 200,
        minSize: 200,
        cell: (entry) => {
          return (
            <div className="flex items-center gap-2">
              <TableText
                text={entry.file.name}
                tooltip
                className="max-w-[160px]"
                textClassName="font-medium text-foreground"
              />
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
          );
        },
      },
      {
        key: "size",
        header: <div className="text-right">Kích thước</div>,
        size: 120,
        minSize: 120,
        maxSize: 120,
        cell: (entry) => (
          <div className="text-right text-muted-foreground tabular-nums">
            {(entry.file.size / 1024).toFixed(0)} KB
          </div>
        ),
      },
      {
        key: "note",
        header: "Ghi chú",
        size: 200,
        cell: (entry) => {
          if (entry.type === "xml" && entry.pairedPdf) {
            return (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3" />
                Đã ghép PDF
              </span>
            );
          }
          if (entry.type === "pdf") {
            if (manualMatches[entry.id]) {
              return (
                <TableText
                  text="Đã chọn ghép thủ công (chờ import)"
                  tooltip
                  textClassName="text-blue-700 font-medium text-[11px]"
                />
              );
            }
            if (matchedInvoices[entry.file.name]) {
              const matched = matchedInvoices[entry.file.name]!;
              const text = `Tự động: HĐ ${matched.invoiceNo} (KH: ${matched.serialNo || "N/A"}) - ${Number(matched.totalAmount).toLocaleString("vi-VN")}đ`;
              return (
                <div className="flex items-center gap-2">
                  <TableText
                    text={text}
                    tooltip
                    textClassName="text-emerald-700 font-medium text-[11px]"
                  />
                </div>
              );
            }
            return (
              <TableText
                text="File mồ côi"
                tooltip
                textClassName="text-muted-foreground text-[11px]"
              />
            );
          }
          if (entry.type === "zip") {
            return (
              <TableText
                text="Server sẽ extract"
                tooltip
                textClassName="text-muted-foreground text-[11px]"
              />
            );
          }
          return null;
        },
      },
      {
        key: "manual",
        header: "Ghép HĐ (Thủ công)",
        size: 200,
        minSize: 200,
        cell: (entry) => {
          if (entry.type === "pdf" && !entry.pairedPdf) {
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <ManualMatchSelect
                  direction={direction}
                  initialOptions={candidateInvoices}
                  value={manualMatches[entry.id] || ""}
                  onChange={(val) => {
                    setManualMatches((prev) => ({
                      ...prev,
                      [entry.id]: val,
                    }));
                    if (val && !rowSelection[entry.id]) {
                      setRowSelection((prev) => ({
                        ...prev,
                        [entry.id]: true,
                      }));
                    }
                  }}
                />
              </div>
            );
          }
          return null;
        },
      },
      {
        key: "status",
        header: "Trạng thái",
        size: 144,
        cell: (entry) => {
          const status = getFilePreviewStatus(entry);
          const cfg = STATUS_CONFIG[status];

          let variant: "outline" | "secondary" | "destructive" | "default" =
            "outline";
          let label: string = cfg.label;
          let iconCls: string = cfg.iconCls;
          let containerCls: string = cfg.className;

          // Orphan PDF logic
          if (entry.type === "pdf" && !entry.pairedPdf) {
            const hasManual = !!manualMatches[entry.id];
            const hasAuto = !!matchedInvoices[entry.file.name];
            if (!hasManual && !hasAuto) {
              variant = "secondary";
              label = "Cần chọn HĐ";
              iconCls = "text-amber-600";
              containerCls = "bg-amber-100/50 text-amber-700 border-amber-200";
            }
          }

          return (
            <Badge
              variant={variant}
              className={`gap-1 rounded-full ${containerCls || ""}`}
            >
              <cfg.Icon className={`w-3 h-3 ${iconCls}`} />
              {label}
            </Badge>
          );
        },
      },
    ],
    [
      direction,
      candidateInvoices,
      manualMatches,
      matchedInvoices,
      rowSelection,
    ],
  );

  if (!open) return null;

  const selectedFiles = files.filter((f) => rowSelection[f.id]);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[600] flex items-center justify-center"
        style={{
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          className="bg-surface rounded-2xl shadow-2xl border border-border flex flex-col"
          style={{
            width: "min(1100px, calc(100vw - 32px))",
            maxHeight: "calc(100vh - 48px)",
          }}
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
          <div className="px-5 py-2.5 bg-muted/30 shrink-0 flex items-center gap-4 text-xs text-muted-foreground">
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
          <div className="flex-1 overflow-hidden min-h-0 bg-surface rounded-b-2xl">
            <StandardTable
              items={files}
              columns={columns}
              getRowKey={(f) => f.id}
              variant="spreadsheet"
              minWidth={1050}
              containerClassName="border-0 shadow-none mx-5 rounded-none"
              enableColumnResizing={true}
              enableRowSelection={true}
              rowSelection={rowSelection}
              onRowSelectionChange={(updater) => {
                if (typeof updater === "function") {
                  setRowSelection(updater(rowSelection));
                } else {
                  setRowSelection(updater);
                }
              }}
              onRowClick={(f) => {
                setRowSelection((prev) => ({
                  ...prev,
                  [f.id]: !prev[f.id],
                }));
              }}
            />
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 flex items-center justify-between shrink-0"
            style={{
              background: "rgba(249,251,255,0.9)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="text-xs text-muted-foreground">
              {selectedCount === 0 ? (
                <span className="text-amber-600 font-medium">
                  Chọn ít nhất 1 file để import
                </span>
              ) : (
                <>
                  Đã chọn{" "}
                  <strong className="text-foreground">{selectedCount}</strong> /{" "}
                  {files.length} file
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Hủy
              </Button>
              <Button
                size="sm"
                disabled={selectedCount === 0}
                onClick={() => onConfirm(selectedFiles, manualMatches)}
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
