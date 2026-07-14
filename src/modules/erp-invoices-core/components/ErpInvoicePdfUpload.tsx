import { useState, useMemo } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Upload, Download, Loader2 } from "lucide-react";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";
import { Attachment } from "@/shared/components/ui/Attachment";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  invoiceId: string | null;
  pdfFiles: any[] | null;
  pdfFileKey?: string | null;
  editMode: boolean;
}

export function ErpInvoicePdfUpload({
  invoiceId,
  pdfFiles,
  pdfFileKey,
  editMode,
}: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<{
    url: string;
    fileName: string;
    fileKey: string;
  } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (key: string) => erpInvoicesCoreApi.deletePdf(invoiceId!, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpInvoices"] });
      toast.success("Đã xóa file PDF");
    },
    onError: () => toast.error("Lỗi xóa file PDF"),
  });

  const displayFiles = useMemo(() => {
    const list = [];
    if (pdfFileKey) {
      list.push({
        key: pdfFileKey,
        filename: pdfFileKey.split("/").pop() || "Document.pdf",
      });
    }
    if (pdfFiles && pdfFiles.length > 0) {
      list.push(...pdfFiles);
    }
    return list;
  }, [pdfFileKey, pdfFiles]);

  const handleUpload = async () => {
    if (!invoiceId || files.length === 0) return;

    setUploading(true);
    try {
      await erpInvoicesCoreApi.uploadPdfs(invoiceId, files);
      toast.success("Đã tải lên file PDF thành công");
      queryClient.invalidateQueries({ queryKey: ["erpInvoices"] });
      setFiles([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tải lên file PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DrawerSection
      title="Tài liệu đính kèm (PDF)"
      titleExtra={
        displayFiles.length > 1 ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={async () => {
              try {
                toast.loading("Đang nén file PDF...", { id: "zip-download" });
                const blob = await erpInvoicesCoreApi.downloadPdfsZip(
                  invoiceId!,
                );
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `hoadon_${invoiceId}_pdfs.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Tải xuống hoàn tất", { id: "zip-download" });
              } catch {
                toast.error("Lỗi khi tải xuống file zip", {
                  id: "zip-download",
                });
              }
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Tải tất cả (ZIP)
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        {displayFiles.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Chưa có tài liệu đính kèm.
          </div>
        )}
        {displayFiles.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            {displayFiles.map((file, i) => (
              <AttachmentRow
                key={file.key || i}
                item={
                  {
                    file: {
                      id: file.key,
                      filename_download: file.filename,
                    },
                    attachment_type: "Hóa đơn PDF",
                  } as any
                }
                onDelete={
                  editMode && invoiceId
                    ? () => deleteMutation.mutate(file.key)
                    : undefined
                }
                onPreview={async () => {
                  try {
                    const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
                      invoiceId!,
                      file.key,
                      true,
                    );
                    setPreviewUrl({
                      url,
                      fileName: file.filename,
                      fileKey: file.key,
                    });
                  } catch {
                    toast.error("Không thể tải bản xem trước file PDF");
                  }
                }}
              />
            ))}
          </div>
        )}
        {editMode && invoiceId && (
          <div className="mt-2 space-y-3">
            <Attachment
              files={files}
              onFilesChange={setFiles}
              accept="application/pdf"
              maxFiles={10}
              maxSizeMb={20}
              onPreview={setPreviewFile}
            />
            {files.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading
                  ? "Đang tải lên..."
                  : `Lưu ${files.length} file đính kèm`}
              </Button>
            )}
          </div>
        )}
      </div>
      <FilePreviewDrawer
        open={!!previewFile || !!previewUrl}
        onClose={() => {
          setPreviewFile(null);
          setPreviewUrl(null);
        }}
        file={previewFile}
        previewUrl={previewUrl?.url}
        fileName={previewFile?.name || previewUrl?.fileName}
        onDownload={
          previewUrl
            ? async () => {
                try {
                  const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
                    invoiceId!,
                    previewUrl.fileKey,
                    false,
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = previewUrl.fileName || "document.pdf";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch {
                  toast.error("Lỗi tải xuống file");
                }
              }
            : undefined
        }
      />
    </DrawerSection>
  );
}
