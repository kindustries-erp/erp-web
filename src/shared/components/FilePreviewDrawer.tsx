import React, { useEffect, useState, useMemo } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useT } from "@/core/i18n";
import * as XLSX from "xlsx";
import { AlertCircle, FileType, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// Using unpkg CDN to avoid MIME type issues with .mjs on production servers
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface FilePreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  /** File object (if local) */
  file?: File | null;
  /** Direct URL for the file (if server-side, for non-PDF or no-CORS cases) */
  previewUrl?: string;
  /** File name (useful when providing previewUrl) */
  fileName?: string;
  /** Custom download handler */
  onDownload?: () => void;
  /**
   * For PDF files served behind CORS (e.g. Cloudflare R2 presigned URLs):
   * provide a function that fetches the raw Blob via an authenticated proxy
   * (e.g. through axiosInstance). The result is converted to a blob: URL
   * so react-pdf can render it without CORS restrictions.
   */
  fetchBlobFn?: () => Promise<Blob>;
  zIndex?: number;
}

type FileTypeCategory = "PDF" | "IMAGE" | "EXCEL" | "WORD" | "UNSUPPORTED" | "UNKNOWN";

export function FilePreviewDrawer({
  open,
  onClose,
  file,
  previewUrl,
  fileName,
  onDownload,
  fetchBlobFn,
  zIndex,
}: FilePreviewDrawerProps) {
  const t = useT();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<any[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Derived properties
  const actualFileName = file?.name || fileName || "Document";
  const lowerName = actualFileName.toLowerCase();

  const fileTypeCategory: FileTypeCategory = useMemo(() => {
    if (file?.type === "application/pdf" || lowerName.endsWith(".pdf"))
      return "PDF";
    if (
      file?.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file?.type === "application/vnd.ms-excel" ||
      file?.type === "text/csv" ||
      lowerName.endsWith(".xlsx") ||
      lowerName.endsWith(".xls") ||
      lowerName.endsWith(".csv")
    ) {
      return "EXCEL";
    }
    if (
      file?.type.startsWith("image/") ||
      lowerName.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/)
    ) {
      return "IMAGE";
    }
    if (
      file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file?.type === "application/msword" ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc")
    ) {
      return "WORD";
    }
    return "UNSUPPORTED";
  }, [file, lowerName]);

  // Track container width for responsive PDF page rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Manage Blob URL lifecycle and parse Excel
  useEffect(() => {
    if (!open) {
      setBlobUrl(null);
      setExcelData(null);
      setError(null);
      setNumPages(null);
      return;
    }

    let activeUrl: string | null = null;

    const processFile = async () => {
      setLoading(true);
      setError(null);
      setNumPages(null);
      try {
        let currentBlob: Blob | null = null;

        if (file) {
          // Local file object
          currentBlob = file;
          activeUrl = URL.createObjectURL(file);
        } else if (fetchBlobFn && fileTypeCategory === "PDF") {
          // PDF via authenticated proxy — avoids CORS, safe for react-pdf
          currentBlob = await fetchBlobFn();
          activeUrl = URL.createObjectURL(currentBlob);
        } else if (previewUrl) {
          activeUrl = previewUrl;
          // For Excel, we must fetch the raw bytes to parse with xlsx
          if (fileTypeCategory === "EXCEL") {
            try {
              const res = await fetch(previewUrl);
              if (!res.ok) throw new Error("Network response was not ok");
              currentBlob = await res.blob();
            } catch (err) {
              console.warn("Failed to fetch Excel blob for preview", err);
            }
          }
        }

        setBlobUrl(activeUrl);

        if (fileTypeCategory === "EXCEL" && currentBlob) {
          const buffer = await currentBlob.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Limit to 500 rows to prevent freezing
          const htmlJson = XLSX.utils
            .sheet_to_json<any[]>(worksheet, {
              header: 1,
              defval: "",
            })
            .slice(0, 500);
          setExcelData(htmlJson);
        }
      } catch (err) {
        setError(t("Có lỗi xảy ra khi đọc file"));
        console.error("Preview error:", err);
      } finally {
        setLoading(false);
      }
    };

    processFile();

    return () => {
      // Cleanup object URL if it was created locally
      if (activeUrl && activeUrl.startsWith("blob:")) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [open, file, previewUrl, fetchBlobFn, fileTypeCategory, t]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center flex-col text-[color:var(--muted-fg)] gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Đang tải bản xem trước...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex h-64 items-center justify-center flex-col text-[color:var(--warn-fg)] gap-2">
          <AlertCircle className="w-8 h-8" />
          <p>{error}</p>
        </div>
      );
    }

    if (!blobUrl && fileTypeCategory !== "EXCEL" && fileTypeCategory !== "WORD") {
      return null;
    }

    switch (fileTypeCategory) {
      case "PDF":
        return (
          <div
            ref={containerRef}
            className="w-full overflow-y-auto overflow-x-hidden bg-[#525659] rounded-md"
            style={{ maxHeight: "75vh" }}
          >
            <Document
              file={blobUrl || ""}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={
                <div className="flex h-64 items-center justify-center flex-col text-white gap-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p>Đang tải PDF...</p>
                </div>
              }
              error={
                <div className="flex h-64 items-center justify-center flex-col text-red-300 gap-2 p-8">
                  <AlertCircle className="w-8 h-8" />
                  <p>Không thể hiển thị file PDF. Vui lòng tải xuống để xem.</p>
                </div>
              }
              className="flex flex-col items-center gap-4 py-4"
            >
              {numPages &&
                Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={Math.max(containerWidth - 32, 200)}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-xl"
                  />
                ))}
            </Document>
          </div>
        );
      case "IMAGE":
        return (
          <div className="flex items-center justify-center min-h-[50vh] p-4 bg-[color:var(--muted-bg)] border border-[color:var(--border)] rounded-md">
            <img
              src={blobUrl || ""}
              alt={actualFileName}
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>
        );
      case "EXCEL":
        if (previewUrl) {
          return (
            <div className="w-full h-[75vh] bg-[color:var(--muted-bg)] rounded-md overflow-hidden border border-[color:var(--border)]">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Excel Preview"
              />
            </div>
          );
        }
        if (!excelData || excelData.length === 0) {
          return (
            <div className="text-center p-8 text-[color:var(--muted-fg)]">
              Không có dữ liệu trong file này.
            </div>
          );
        }
        return (
          <div className="border border-[color:var(--border)] rounded-md overflow-hidden bg-[color:var(--background)]">
            <div className="max-h-[75vh] overflow-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[color:var(--muted-bg)] sticky top-0 shadow-sm z-10">
                  <tr>
                    {/* Render column headers based on max row length */}
                    <th className="border border-[color:var(--border)] p-2 min-w-[50px] font-semibold text-center text-[color:var(--muted-fg)]">
                      #
                    </th>
                    {excelData[0]?.map((_: any, i: number) => (
                      <th
                        key={i}
                        className="border border-[color:var(--border)] p-2 font-medium"
                      >
                        Cột {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[color:var(--surface-hover)] border-b border-[color:var(--border)] last:border-0"
                    >
                      <td className="border border-[color:var(--border)] p-2 text-center text-[color:var(--muted-fg)] font-mono text-xs bg-[color:var(--muted-bg)]/50">
                        {i + 1}
                      </td>
                      {/* Ensure we render enough cells even if row is short */}
                      {Array.from({ length: excelData[0]?.length || 0 }).map(
                        (_, j) => (
                          <td
                            key={j}
                            className="border border-[color:var(--border)] p-2 whitespace-nowrap max-w-xs truncate"
                          >
                            {row[j] !== undefined && row[j] !== null
                              ? String(row[j])
                              : ""}
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {excelData.length === 500 && (
              <div className="p-2 text-xs text-center text-[color:var(--muted-fg)] bg-[color:var(--muted-bg)] border-t border-[color:var(--border)]">
                Chỉ hiển thị tối đa 500 dòng để tối ưu hiệu suất.
              </div>
            )}
          </div>
        );
      case "WORD":
        if (!previewUrl) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 bg-[color:var(--muted-bg)] border border-[color:var(--border)] rounded-md">
              <div className="h-16 w-16 bg-[color:var(--muted-bg)] rounded-full flex items-center justify-center">
                <FileType className="h-8 w-8 text-[color:var(--muted-fg)]" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-[color:var(--foreground)] mb-1">
                  Định dạng file không hỗ trợ xem trước trực tiếp
                </h3>
                <p className="text-sm text-[color:var(--muted-fg)]">
                  Không thể xem trước file cục bộ. Vui lòng tải lên hoặc tải xuống để xem.
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-[75vh] bg-[color:var(--muted-bg)] rounded-md overflow-hidden border border-[color:var(--border)]">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Word Preview"
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 bg-[color:var(--muted-bg)] border border-[color:var(--border)] rounded-md">
            <div className="h-16 w-16 bg-[color:var(--muted-bg)] rounded-full flex items-center justify-center">
              <FileType className="h-8 w-8 text-[color:var(--muted-fg)]" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-[color:var(--foreground)] mb-1">
                Định dạng file không hỗ trợ xem trước
              </h3>
              <p className="text-sm text-[color:var(--muted-fg)]">
                Vui lòng tải file "{actualFileName}" về máy để xem nội dung.
              </p>
            </div>
          </div>
        );
    }
  };

  // Build a download link dynamically
  const handleDownloadAction = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = actualFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = actualFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (previewUrl) {
      const a = document.createElement("a");
      a.href = previewUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = actualFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title="Xem trước tài liệu"
      subtitle={actualFileName}
      size="lg"
      zIndex={zIndex}
      layout="1-column"
      leftPanel={renderContent()}
      actions={[
        {
          label: "Đóng",
          onClick: onClose,
          variant: "outline",
        },
        {
          label: "Tải xuống",
          onClick: handleDownloadAction,
          primary: true,
          disabled: !blobUrl && !file && !previewUrl,
        },
      ]}
    />
  );
}
