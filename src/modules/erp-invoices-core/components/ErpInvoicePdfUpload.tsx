import { useState } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Upload, Trash2, Download, FileText, Loader2 } from "lucide-react";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  invoiceId: string | null;
  pdfFiles: any[] | null;
  editMode: boolean;
}

export function ErpInvoicePdfUpload({ invoiceId, pdfFiles, editMode }: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (key: string) => erpInvoicesCoreApi.deletePdf(invoiceId!, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erpInvoices"] });
      toast.success("Đã xóa file PDF");
    },
    onError: () => toast.error("Lỗi xóa file PDF"),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!invoiceId) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      await erpInvoicesCoreApi.uploadPdfs(invoiceId, files);
      toast.success("Đã tải lên file PDF thành công");
      queryClient.invalidateQueries({ queryKey: ["erpInvoices"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tải lên file PDF");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (key: string) => {
    if (!invoiceId) return;
    try {
      const { url } = await erpInvoicesCoreApi.getPdfDownloadUrl(
        invoiceId,
        key,
      );
      window.open(url, "_blank");
    } catch {
      toast.error("Không thể tải file PDF");
    }
  };

  return (
    <DrawerSection title="Tài liệu đính kèm (PDF)">
      <div className="flex flex-col gap-3">
        {(!pdfFiles || pdfFiles.length === 0) && (
          <div className="text-sm text-gray-500 italic">
            Chưa có tài liệu đính kèm.
          </div>
        )}
        {pdfFiles && pdfFiles.length > 0 && (
          <div className="flex flex-col gap-2">
            {pdfFiles.map((file, i) => (
              <div
                key={file.key || i}
                className="flex items-center justify-between border rounded-md p-2 bg-gray-50 text-sm"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                  <span
                    className="truncate text-gray-700"
                    title={file.filename}
                  >
                    {file.filename}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(file.key)}
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                  </Button>
                  {editMode && invoiceId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(file.key)}
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables === file.key ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {editMode && invoiceId && (
          <div className="mt-2">
            <input
              type="file"
              multiple
              accept="application/pdf"
              className="hidden"
              id={`upload-pdfs-${invoiceId}`}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor={`upload-pdfs-${invoiceId}`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed cursor-pointer"
                asChild
                disabled={uploading}
              >
                <span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploading ? "Đang tải lên..." : "Tải lên file PDF"}
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </DrawerSection>
  );
}
