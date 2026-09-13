import { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Attachment } from "@/shared/components/ui/Attachment";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { Download } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/checkbox";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void | Promise<void>;
  onUpload: (file: File, overwrite: boolean) => Promise<void>;
  loading?: boolean;
}

export const ImportExcelModal = ({
  isOpen,
  onClose,
  onDownloadTemplate,
  onUpload,
  loading = false,
}: ImportExcelModalProps) => {
  const t = useT();
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setOverwrite(true);
    }
  }, [isOpen]);

  const handleUpload = async () => {
    if (files.length === 0) return;
    await onUpload(files[0], overwrite);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownloadTemplate();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <StandardFormDrawer
        open={isOpen}
        onClose={onClose}
        title={t("Nhập dữ liệu từ Excel")}
        mode="create"
        layout="1-column"
        size="sm"
        actions={[
          {
            label: t("common.cancel"),
            onClick: onClose,
            variant: "outline",
            disabled: loading,
          },
          {
            label: loading ? t("Đang xử lý...") : t("Xác nhận"),
            onClick: handleUpload,
            primary: true,
            disabled: files.length === 0 || loading,
            loading: loading,
          },
        ]}
        leftPanel={
          <div className="space-y-6">
            <DrawerSection title={t("Tải lên file Excel")}>
              <DrawerField label="File" required>
                <Attachment
                  files={files}
                  onFilesChange={(newFiles) => {
                    // Only keep the latest file if multiple are selected by mistake
                    setFiles(newFiles.slice(-1));
                  }}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  maxFiles={1}
                  maxSizeMb={10}
                  onPreview={setPreviewFile}
                />
                <div className="mt-2 text-right">
                  <Button
                    variant="link"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="text-[#0284c7] px-0 h-auto gap-1"
                  >
                    <Download className="w-3 h-3" />
                    {isDownloading ? t("Đang tải...") : t("Tải Template mẫu")}
                  </Button>
                </div>
              </DrawerField>

              <DrawerField label={t("Tùy chọn nhập")}>
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="import-excel-overwrite"
                    checked={overwrite}
                    onCheckedChange={(checked) => setOverwrite(!!checked)}
                  />
                  <label
                    htmlFor="import-excel-overwrite"
                    className="text-sm font-medium text-foreground cursor-pointer select-none"
                  >
                    {t("Ghi đè lên các dòng dữ liệu hiện tại")}
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-6">
                  {overwrite
                    ? t(
                        "Dữ liệu hiện tại trong bảng sẽ bị xóa và thay thế bằng dữ liệu từ file Excel.",
                      )
                    : t(
                        "Dữ liệu từ file Excel sẽ được nối tiếp vào cuối danh sách hiện tại.",
                      )}
                </p>
              </DrawerField>
            </DrawerSection>
          </div>
        }
      />
      <FilePreviewDrawer
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </>
  );
};
