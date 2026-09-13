import React, { useState } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import toast from "react-hot-toast";

import { useInvoiceExportProgressStore } from "@/shared/stores/useInvoiceExportProgressStore";
import { useInvoiceExportProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceExportProgress";
import { Button } from "@/shared/components/ui/Button";
import { Progress } from "@/shared/components/ui/progress";

export function InvoiceExportProgressBubble() {
  const progress = useInvoiceExportProgressStore();
  const { downloadReadyFile } = useInvoiceExportProgress();
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [hasDownloadTotal, setHasDownloadTotal] = useState(false);

  const visible =
    progress.isRunning ||
    progress.ready ||
    progress.failed ||
    progress.current > 0;

  if (!visible) return null;

  const percent =
    progress.total > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((progress.current / progress.total) * 100)),
        )
      : 0;
  const progressValue = isDownloading
    ? Math.min(100, Math.max(0, downloadPercent))
    : percent;
  const canDownload =
    Boolean(progress.jobId) &&
    progress.ready &&
    !progress.isRunning &&
    percent >= 100;

  const handleDownload = async () => {
    if (!canDownload || !progress.jobId || isDownloading) return;
    try {
      setIsDownloading(true);
      setDownloadPercent(0);
      setHasDownloadTotal(false);

      await downloadReadyFile(
        progress.jobId,
        progress.fileName,
        (loaded, total) => {
          if (typeof total === "number" && total > 0) {
            setHasDownloadTotal(true);
            setDownloadPercent(Math.round((loaded / total) * 100));
            return;
          }

          setHasDownloadTotal(false);
          setDownloadPercent((prev) => (prev < 85 ? prev + 5 : prev));
        },
      );

      setDownloadPercent(100);
      toast.success("File dang duoc tai xuong.");
    } catch (error: any) {
      toast.error(error?.message || "Khong the tai file XLSX");
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  return (
    <div className="fixed bottom-28 right-4 z-[10000]">
      <Button
        onClick={() => setIsOpen((v) => !v)}
        variant="primary"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg relative"
      >
        <FileSpreadsheet
          className={`h-5 w-5 ${progress.isRunning ? "animate-pulse" : ""}`}
        />
        <span className="absolute -top-1 -right-1 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 h-5 flex items-center">
          {percent}%
        </span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-72 rounded-lg border border-gray-200 bg-white shadow-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Xuat Excel hoa don
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {progress.message || "Dang xu ly..."}
              </div>
            </div>
            <Button
              onClick={() => {
                progress.reset();
                setIsOpen(false);
              }}
              variant="ghost"
              size="icon-sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3">
            <Progress
              value={progressValue}
              className="h-2"
              indicatorClassName="bg-emerald-600"
            />
            <div className="mt-1 text-xs text-gray-500">
              {isDownloading
                ? hasDownloadTotal
                  ? `${downloadPercent}%`
                  : "Dang nhan du lieu..."
                : `${progress.current}/${progress.total}`}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {progress.isRunning
                ? "Dang tao file"
                : progress.failed
                  ? "That bai"
                  : isDownloading
                    ? hasDownloadTotal
                      ? `Dang tai file ${downloadPercent}%`
                      : "Dang tai file..."
                    : progress.ready
                      ? "San sang tai"
                      : "Dang cho"}
            </span>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              disabled={!canDownload || isDownloading}
              className="text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Tai file
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
