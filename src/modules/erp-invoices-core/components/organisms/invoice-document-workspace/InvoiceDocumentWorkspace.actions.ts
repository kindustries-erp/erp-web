import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { invoiceFilesV2Api } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";
import type {
  InvoiceDocumentWorkspaceProps,
  NormalizedInvoiceDocument,
  PendingAttachment,
} from "./InvoiceDocumentWorkspace.type";

export function useInvoiceDocumentActions({
  detailInvoice,
  form,
  editMode = false,
  fieldSet,
  onRefreshDetail,
  uploadType,
  reloadFiles,
}: InvoiceDocumentWorkspaceProps & {
  uploadType: string;
  reloadFiles: () => unknown;
}) {
  const { t } = useTranslation("erpInvoices");
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isUploadingDirect, setIsUploadingDirect] = useState(false);
  const pendingDeletedPdfs = form?.pendingDeletedPdfs || [];
  const pendingAddedAttachments: PendingAttachment[] =
    form?.pendingAddedAttachments || [];

  const handleDownloadDoc = useCallback(
    async (doc: NormalizedInvoiceDocument) => {
      if (doc.isPending && doc.fileObj) {
        const url = URL.createObjectURL(doc.fileObj);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
      try {
        if (!detailInvoice?.id) return;
        const { url } = await invoiceFilesV2Api.downloadUrl(
          detailInvoice.id,
          doc.id,
        );
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch {
        toast.error(t("downloadError", "Lỗi khi tải file"));
      }
    },
    [detailInvoice, t],
  );

  const handleDeleteDoc = useCallback(
    async (doc: NormalizedInvoiceDocument) => {
      if (doc.isPending) {
        const next = pendingAddedAttachments.filter(
          (p) => p.file.name !== doc.name,
        );
        fieldSet?.("pendingAddedAttachments", next);
        toast.success(t("removedPendingFile", "Đã xóa tệp chờ lưu"));
        return;
      }
      if (editMode) {
        fieldSet?.("pendingDeletedPdfs", [...pendingDeletedPdfs, doc.id]);
        toast.success(t("markedDeleteFile", "Đã đánh dấu xóa (chờ Lưu)"));
        return;
      }
      if (detailInvoice?.id) {
        try {
          await invoiceFilesV2Api.remove(detailInvoice.id, doc.id);
          await reloadFiles();
          toast.success(t("deleteSuccess", "Đã xóa tài liệu đính kèm"));
          onRefreshDetail?.();
        } catch {
          toast.error(t("deleteError", "Lỗi khi xóa tài liệu"));
        }
      }
    },
    [
      pendingAddedAttachments,
      fieldSet,
      t,
      editMode,
      detailInvoice,
      pendingDeletedPdfs,
      onRefreshDetail,
      reloadFiles,
    ],
  );

  const handleDownloadAllZip = useCallback(async () => {
    if (!detailInvoice?.id) return;
    try {
      setIsDownloadingZip(true);
      toast.loading(t("zippingFiles", "Đang nén file..."), {
        id: "zip-download",
      });
      const blob = await invoiceFilesV2Api.downloadZip(detailInvoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hoadon_${detailInvoice.invoiceNo || detailInvoice.id}_attachments.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(t("zipSuccess", "Tải xuống hoàn tất"), {
        id: "zip-download",
      });
    } catch {
      toast.error(t("zipError", "Lỗi khi tải file zip"), {
        id: "zip-download",
      });
    } finally {
      setIsDownloadingZip(false);
    }
  }, [detailInvoice, t]);

  const handleFilesAdded = useCallback(
    async (newFiles: File[]) => {
      if (newFiles.length === 0) return;
      if (editMode || !detailInvoice?.id) {
        const nextPending: PendingAttachment[] = [...pendingAddedAttachments];
        for (const file of newFiles) {
          if (
            !nextPending.some(
              (p) => p.file.name === file.name && p.file.size === file.size,
            )
          ) {
            nextPending.push({ file, documentType: uploadType });
          }
        }
        fieldSet?.("pendingAddedAttachments", nextPending);
        toast.success(
          t(
            "addedPendingFiles",
            "Đã thêm {{count}} tệp vào danh sách chờ lưu",
            { count: newFiles.length },
          ),
        );
        return;
      }
      try {
        setIsUploadingDirect(true);
        toast.loading(t("uploadingFiles", "Đang tải lên tài liệu..."), {
          id: "direct-upload",
        });
        await invoiceFilesV2Api.upload(detailInvoice.id, newFiles, uploadType);
        await reloadFiles();
        toast.success(t("uploadSuccess", "Tải lên tài liệu thành công"), {
          id: "direct-upload",
        });
        onRefreshDetail?.();
      } catch {
        toast.error(t("uploadError", "Lỗi tải lên tài liệu"), {
          id: "direct-upload",
        });
      } finally {
        setIsUploadingDirect(false);
      }
    },
    [
      editMode,
      detailInvoice,
      pendingAddedAttachments,
      uploadType,
      fieldSet,
      t,
      onRefreshDetail,
      reloadFiles,
    ],
  );

  return {
    isDownloadingZip,
    isUploadingDirect,
    handleDownloadDoc,
    handleDeleteDoc,
    handleDownloadAllZip,
    handleFilesAdded,
  };
}
