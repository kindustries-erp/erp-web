import { useState, useMemo } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Download, Search } from "lucide-react";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import toast from "react-hot-toast";
import { AttachmentRow } from "@/shared/components/AttachmentComponents";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { Combobox } from "@/shared/components/Combobox";
import { Attachment } from "@/shared/components/ui/Attachment";
import {
  getFileViewUrl,
  getAttachmentDownloadUrlApi,
  getAttachmentContentBlobApi,
} from "@/modules/system/api/attachmentsApi";
import { ErpAttachmentSelectDrawer } from "./ErpAttachmentSelectDrawer";

export interface PendingAttachment {
  file: File;
  documentType: string;
}

interface Props {
  invoiceId: string | null;
  attachments: { attachmentId: string; attachment: any }[] | null;
  pdfFileKey?: string | null;
  pdfFiles?: Array<{
    key: string;
    filename: string;
    uploadedAt: string;
  }> | null;
  editMode: boolean;
  pendingDeletedPdfs?: string[];
  onPendingDeletePdf?: (key: string) => void;
  pendingAddedAttachments?: PendingAttachment[];
  onPendingAddedAttachmentsChange?: (files: PendingAttachment[]) => void;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
}

const TYPE_OPTS = [
  { value: "HOP_DONG", label: "Hợp đồng" },
  { value: "HOA_DON", label: "Hóa đơn" },
  { value: "BANG_KE", label: "Bảng kê" },
  { value: "KHAC", label: "Khác" },
];

export function ErpInvoicePdfUpload({
  invoiceId,
  attachments,
  pdfFileKey,
  pdfFiles,
  editMode,
  pendingDeletedPdfs = [],
  onPendingDeletePdf,
  pendingAddedAttachments = [],
  onPendingAddedAttachmentsChange,
  onLinkExistingAttachment,
  onUnlinkAttachment,
}: Props) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<{
    url: string;
    fileName: string;
    fileKey: string;
    mimeType?: string;
  } | null>(null);

  const [uploadType, setUploadType] = useState<string>("HOA_DON");
  const [showSelectDrawer, setShowSelectDrawer] = useState(false);

  const displayFiles = useMemo(() => {
    const list: any[] = [];
    if (attachments && attachments.length > 0) {
      list.push(...attachments);
    }

    if (pdfFileKey && !list.some((f) => f.attachment?.fileKey === pdfFileKey)) {
      list.push({
        attachmentId: pdfFileKey,
        attachment: {
          id: pdfFileKey,
          fileKey: pdfFileKey,
          fileName: pdfFileKey.split("/").pop() || "Hóa đơn PDF",
          mimeType: "application/pdf",
          documentType: "HOA_DON",
        },
        _isLegacy: true,
      });
    }

    if (pdfFiles && pdfFiles.length > 0) {
      for (const f of pdfFiles) {
        if (f.key && !list.some((item) => item.attachment?.fileKey === f.key)) {
          list.push({
            attachmentId: f.key,
            attachment: {
              id: f.key,
              fileKey: f.key,
              fileName: f.filename || f.key.split("/").pop() || "Hóa đơn PDF",
              mimeType: "application/pdf",
              documentType: "HOA_DON",
            },
            _isLegacy: true,
          });
        }
      }
    }

    return list.filter(
      (f) =>
        !pendingDeletedPdfs || !pendingDeletedPdfs.includes(f.attachmentId),
    );
  }, [attachments, pdfFileKey, pdfFiles, pendingDeletedPdfs]);

  const handleFilesChange = (newFiles: File[]) => {
    if (!onPendingAddedAttachmentsChange) return;

    const newPendingList: PendingAttachment[] = [];

    for (const f of newFiles) {
      const existing = pendingAddedAttachments.find(
        (p) => p.file.name === f.name && p.file.size === f.size,
      );
      if (existing) {
        newPendingList.push(existing);
      } else {
        newPendingList.push({ file: f, documentType: uploadType });
      }
    }

    onPendingAddedAttachmentsChange(newPendingList);
  };

  return (
    <DrawerSection
      title="Tài liệu đính kèm"
      titleExtra={
        <div className="flex items-center gap-2">
          {editMode && invoiceId && onLinkExistingAttachment && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setShowSelectDrawer(true)}
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              Tìm tài liệu có sẵn
            </Button>
          )}
          {displayFiles.length > 1 && invoiceId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={async () => {
                if (!invoiceId) return;
                try {
                  toast.loading("Đang nén file...", { id: "zip-download" });
                  const blob =
                    await erpInvoicesCoreApi.downloadPdfsZip(invoiceId);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `hoadon_${invoiceId}_attachments.zip`;
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
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {displayFiles.length === 0 && pendingAddedAttachments.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Chưa có tài liệu đính kèm.
          </div>
        )}
        {displayFiles.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            {displayFiles.map((item, i) => {
              const att = item.attachment;
              if (!att) return null;
              return (
                <AttachmentRow
                  key={att.id || i}
                  item={
                    {
                      file: {
                        id: att.id,
                        filename_download: att.fileName,
                      },
                      attachment_type:
                        TYPE_OPTS.find((t) => t.value === att.documentType)
                          ?.label || att.documentType,
                    } as any
                  }
                  onDelete={
                    editMode && !item._isLegacy
                      ? () => {
                          if (onUnlinkAttachment) {
                            onUnlinkAttachment(att.id);
                          } else if (onPendingDeletePdf) {
                            onPendingDeletePdf(att.id);
                          }
                        }
                      : undefined
                  }
                  onPreview={() => {
                    if (item._isLegacy && att.fileKey) {
                      erpInvoicesCoreApi
                        .getPdfDownloadUrl(invoiceId!, att.fileKey)
                        .then((res) => window.open(res.url, "_blank"))
                        .catch((err) =>
                          console.error("Error downloading legacy PDF:", err),
                        );
                      return;
                    }
                    const url = getFileViewUrl(att.id);
                    setPreviewUrl({
                      url,
                      fileName: att.fileName,
                      fileKey: att.id,
                      mimeType: att.mimeType,
                    });
                  }}
                  onDownload={() => {
                    if (item._isLegacy && att.fileKey) {
                      erpInvoicesCoreApi
                        .getPdfDownloadUrl(invoiceId!, att.fileKey)
                        .then((res) => {
                          const a = document.createElement("a");
                          a.href = res.url;
                          a.target = "_blank";
                          a.download = att.fileName;
                          a.click();
                        })
                        .catch((err) =>
                          console.error("Error downloading legacy PDF:", err),
                        );
                      return;
                    }
                    getAttachmentDownloadUrlApi(att.id)
                      .then((res) => {
                        const a = document.createElement("a");
                        a.href = res.url;
                        a.target = "_blank";
                        a.download = att.fileName;
                        a.click();
                      })
                      .catch((err) => {
                        console.error("Error downloading attachment:", err);
                      });
                  }}
                />
              );
            })}
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
              files={pendingAddedAttachments.map((p) => p.file)}
              onFilesChange={handleFilesChange}
              maxFiles={10}
              maxSizeMb={20}
              onPreview={setPreviewFile}
            />
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
        fetchBlobFn={
          previewUrl?.fileKey
            ? () => getAttachmentContentBlobApi(previewUrl.fileKey!)
            : undefined
        }
      />

      {showSelectDrawer && invoiceId && (
        <ErpAttachmentSelectDrawer
          open={showSelectDrawer}
          onClose={() => setShowSelectDrawer(false)}
          onSelect={(attachment) => {
            if (onLinkExistingAttachment) {
              onLinkExistingAttachment(attachment.id);
            }
            setShowSelectDrawer(false);
          }}
        />
      )}
    </DrawerSection>
  );
}
