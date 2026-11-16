import { useState, useMemo } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Download } from "lucide-react";
import { EmptyState } from "@/shared/components/EmptyState";
import { invoiceFilesV2Api } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";
import { useInvoiceFilesV2 } from "@/modules/erp-invoices-core/hooks/useInvoiceFilesV2";
import { saveBlobAs } from "@/modules/erp-invoices-core/utils/invoiceFileV2Resolve";
import toast from "react-hot-toast";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { Combobox } from "@/shared/components/Combobox";
import { Attachment } from "@/shared/components/ui/Attachment";
import type {
  PendingAttachment,
  ErpInvoicePdfUploadProps,
} from "./ErpInvoicePdfUpload.type";
export type { PendingAttachment, ErpInvoicePdfUploadProps };

const TYPE_OPTS = [
  { value: "HOP_DONG", label: "Hợp đồng" },
  { value: "HOA_DON", label: "Hóa đơn" },
  { value: "BANG_KE", label: "Bảng kê" },
  { value: "KHAC", label: "Khác" },
];

export function ErpInvoicePdfUpload({
  invoiceId,
  editMode,
  pendingDeletedPdfs = [],
  onPendingDeletePdf,
  pendingAddedAttachments = [],
  onPendingAddedAttachmentsChange,
  noCard = false,
}: ErpInvoicePdfUploadProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<{
    url: string;
    fileName: string;
    fileId: string;
  } | null>(null);
  const [uploadType, setUploadType] = useState<string>("HOA_DON");

  const { files } = useInvoiceFilesV2(invoiceId);

  const displayFiles = useMemo(
    () => files.filter((f) => !pendingDeletedPdfs.includes(f.id)),
    [files, pendingDeletedPdfs],
  );

  const openFile = async (
    fileId: string,
    fileName: string,
    mode: "preview" | "download",
  ) => {
    if (!invoiceId) return;
    try {
      const { url } = await invoiceFilesV2Api.downloadUrl(
        invoiceId,
        fileId,
        mode === "preview",
      );
      if (mode === "preview") {
        setPreviewUrl({ url, fileName, fileId });
        return;
      }
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = fileName;
      a.click();
    } catch {
      toast.error("Không mở được tài liệu");
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    if (!onPendingAddedAttachmentsChange) return;

    const newPendingList: PendingAttachment[] = [];

    for (const f of newFiles) {
      const existing = pendingAddedAttachments.find(
        (p: PendingAttachment) =>
          p.file.name === f.name && p.file.size === f.size,
      );
      if (existing) {
        newPendingList.push(existing);
      } else {
        newPendingList.push({ file: f, documentType: uploadType });
      }
    }

    onPendingAddedAttachmentsChange(newPendingList);
  };

  const sectionHeaderExtra = (
    <div className="flex items-center gap-2">
      {displayFiles.length > 1 && invoiceId && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={async () => {
            if (!invoiceId) return;
            try {
              toast.loading("Đang nén file...", { id: "zip-download" });
              const blob = await invoiceFilesV2Api.downloadZip(invoiceId);
              saveBlobAs(blob, `hoadon_${invoiceId}_attachments.zip`);
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
      )}
    </div>
  );

  const mainContent = (
    <div className="flex flex-col gap-3">
      {displayFiles.length === 0 && pendingAddedAttachments.length === 0 && (
        <EmptyState size="md" message="Chưa có tài liệu đính kèm." />
      )}
      {displayFiles.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          {displayFiles.map((file) => (
            <AttachmentRow
              key={file.id}
              item={
                {
                  file: { id: file.id, filename_download: file.fileName },
                  attachment_type:
                    TYPE_OPTS.find((t) => t.value === file.category)?.label ||
                    file.category,
                } as any
              }
              onDelete={
                editMode && onPendingDeletePdf
                  ? () => onPendingDeletePdf(file.id)
                  : undefined
              }
              onPreview={() => void openFile(file.id, file.fileName, "preview")}
              onDownload={() =>
                void openFile(file.id, file.fileName, "download")
              }
            />
          ))}
        </div>
      )}
      {editMode && onPendingAddedAttachmentsChange && (
        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
            <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
              Loại tài liệu tải lên:
            </span>
            <Combobox
              options={TYPE_OPTS}
              value={uploadType}
              onChange={(v) => setUploadType(v as string)}
              className="w-[180px] bg-background"
              placeholder="Chọn loại tài liệu"
            />
          </div>
          <Attachment
            files={pendingAddedAttachments.map(
              (p: PendingAttachment) => p.file,
            )}
            onFilesChange={handleFilesChange}
            maxFiles={10}
            maxSizeMb={20}
            onPreview={setPreviewFile}
          />
        </div>
      )}
    </div>
  );

  const modalDrawers = (
    <>
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
                const a = document.createElement("a");
                a.href = previewUrl.url;
                a.download = previewUrl.fileName || "document";
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            : undefined
        }
      />
    </>
  );

  if (noCard) {
    const hasHeaderActions = displayFiles.length > 1 && Boolean(invoiceId);

    return (
      <div className="w-full space-y-3">
        {hasHeaderActions && (
          <div className="flex items-center justify-end pb-2 border-b border-border/40">
            {sectionHeaderExtra}
          </div>
        )}
        {mainContent}
        {modalDrawers}
      </div>
    );
  }

  return (
    <DrawerSection title="Tài liệu đính kèm" titleExtra={sectionHeaderExtra}>
      {mainContent}
      {modalDrawers}
    </DrawerSection>
  );
}
