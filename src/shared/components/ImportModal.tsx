import { useRef } from "react";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";

export function ImportModal() {
  const {
    importModalOpen,
    importSrc,
    importFile,
    closeImport,
    setImportFile,
    showToast,
  } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const isTM = importSrc === "tienmat";
  const title = isTM ? t("importModal.titleCash") : t("importModal.titleBank");
  const templateName = isTM
    ? "template_phieu_thu_chi.csv"
    : "template_unt_unc.csv";

  const handleFile = (f: File) => setImportFile(f);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-[color:var(--muted-fg)]");
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const downloadTemplate = () => {
    const header = isTM
      ? "Ngay,Ma phieu,Loai (thu/chi),Doi tuong,Dien giai,So tien,Tai khoan No,Tai khoan Co,Nguoi lap"
      : "Ngay,So lenh,Loai (UNT/UNC),Doi tuong,Noi dung,So tien,Tai khoan No,Tai khoan Co,Ngan hang";
    const sample = isTM
      ? "\n15/07/2024,PT000001,thu,Cty TNHH ABC,Thu tien ban hang,50000000,1111,1311,Nguyen Van A"
      : "\n15/07/2024,UNT000001,UNT,Cty TNHH ABC,UNT thu tien HD-001,50000000,1121,1311,VCB";
    const blob = new Blob([header + sample], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t("importModal.toastDownload"));
  };

  const submitImport = () => {
    closeImport();
    showToast(t("importModal.toastSuccess"));
  };

  return (
    <div
      className={`import-modal-overlay ${importModalOpen ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeImport();
      }}
    >
      <div className="slide-panel">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[color:var(--border-light)] flex items-center justify-between flex-shrink-0">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <button
            className="cursor-pointer text-[color:var(--faint)] text-xl leading-none px-[6px] py-[2px] rounded-md hover:bg-[color:var(--muted)] hover:text-foreground"
            onClick={closeImport}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Drop zone */}
          <div
            className="border-[1.5px] border-dashed border-[color:var(--border)] rounded-[10px] p-7 text-center cursor-pointer hover:border-[color:var(--muted-fg)] hover:bg-[color:var(--muted)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-[color:var(--muted-fg)]");
            }}
            onDragLeave={(e) =>
              e.currentTarget.classList.remove("border-[color:var(--muted-fg)]")
            }
            onDrop={handleDrop}
          >
            <div className="w-9 h-9 bg-[color:var(--muted)] rounded-[10px] flex items-center justify-center mx-auto mb-[10px]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[color:var(--muted-fg)]"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              {t("importModal.dropzone")}
            </div>
            <div className="text-xs text-[color:var(--faint)]">
              {t("importModal.formats")}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {/* Selected file */}
          {importFile && (
            <div className="flex items-center gap-2 mt-[10px] px-3 py-2 bg-[color:var(--muted)] rounded-lg text-xs text-foreground">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a7a40"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {importFile.name} ({Math.round(importFile.size / 1024)} KB)
              </span>
              <button
                className="text-[color:var(--faint)] text-base hover:text-[#e24b4a]"
                onClick={() => setImportFile(null)}
              >
                ×
              </button>
            </div>
          )}

          {/* Template */}
          <div
            className="flex items-center gap-2 mt-3 px-3 py-[10px] border border-border rounded-lg cursor-pointer hover:bg-[color:var(--muted)] transition-colors"
            onClick={downloadTemplate}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[color:var(--muted-fg)]"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">
                {t("importModal.downloadTemplate")}
              </div>
              <div className="text-[11px] text-[color:var(--faint)]">
                {templateName}
              </div>
            </div>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[color:var(--faint)]"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-[14px] border-t border-[color:var(--border-light)] flex gap-2 justify-end">
          <button
            className="px-[14px] py-[7px] rounded-lg border border-border text-xs font-medium cursor-pointer bg-surface text-foreground hover:bg-surface-hover"
            onClick={closeImport}
          >
            {t("importModal.cancel")}
          </button>
          <button
            className={`px-[14px] py-[7px] rounded-lg border text-xs font-medium ${
              importFile
                ? "bg-primary text-primary-fg border-primary cursor-pointer hover:opacity-90"
                : "bg-primary text-primary-fg border-primary opacity-50 cursor-not-allowed"
            }`}
            disabled={!importFile}
            onClick={submitImport}
          >
            {t("importModal.importBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
