import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { Attachment } from "@/shared/components/ui/Attachment";

export function ImportModal() {
  const {
    importModalOpen,
    importSrc,
    importFile,
    closeImport,
    setImportFile,
    showToast,
  } = useUIStore();
  const t = useT();

  const isTM = importSrc === "cash-fund";
  const title = isTM ? t("importModal.titleCash") : t("importModal.titleBank");
  const templateName = isTM
    ? "template_phieu_thu_chi.csv"
    : "template_unt_unc.csv";

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
          <Attachment
            files={importFile ? [importFile] : []}
            onFilesChange={(files) => setImportFile(files[0] || null)}
            accept=".xlsx,.xls,.csv"
            maxFiles={1}
          />

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
