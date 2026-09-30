import React from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useInvoicePreviewMode } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import { ErpAttachmentSelectDrawer } from "../drawers/erp-attachment-select-drawer";
import { useInvoiceDocumentWorkspaceLogic } from "./hooks/useInvoiceDocumentWorkspaceLogic";
import { InvoiceFileList } from "./components/InvoiceFileList";
import { InvoiceFileUploadSection } from "./components/InvoiceFileUploadSection";
import { InvoiceDocumentPreviewFrame } from "./components/InvoiceDocumentPreviewFrame";
import type { InvoiceDocumentWorkspaceProps } from "./types";

export const InvoiceDocumentWorkspace = React.memo(
  function InvoiceDocumentWorkspace(props: InvoiceDocumentWorkspaceProps) {
    const previewContext = useInvoicePreviewMode();
    const {
      t,
      documents,
      activeDoc,
      previewUrl,
      isLoadingPreview,
      uploadType,
      setUploadType,
      showSelectDrawer,
      setShowSelectDrawer,
      isDownloadingZip,
      isUploadingDirect,
      handleSelectDoc,
      handleDownloadDoc,
      handleDeleteDoc,
      handleDownloadAllZip,
      handleFilesAdded,
    } = useInvoiceDocumentWorkspaceLogic(props);

    const docCount = documents.length;

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Workspace Quick Actions Bar */}
        {(props.onLinkExistingAttachment ||
          (docCount > 1 && props.detailInvoice?.id)) && (
          <div className="flex items-center justify-end gap-1.5 flex-wrap pb-1">
            {props.onLinkExistingAttachment && props.detailInvoice?.id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs cursor-pointer"
                onClick={() => setShowSelectDrawer(true)}
              >
                <Search className="w-3.5 h-3.5 mr-1" />
                {t("findExistingAttachment", "Tìm tài liệu có sẵn")}
              </Button>
            )}

            {docCount > 1 && props.detailInvoice?.id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDownloadingZip}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleDownloadAllZip}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {t("downloadAllZip", "Tải tất cả (ZIP)")}
              </Button>
            )}
          </div>
        )}

        {/* Split-Pane Layout (Left: Files List & Upload, Right: Live Preview) */}
        <div className="flex flex-col lg:flex-row gap-3.5 items-stretch w-full min-h-[520px]">
          {/* Left Column: List & Upload */}
          <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 flex flex-col justify-between p-3 rounded-xl border border-border/80 bg-surface/50 gap-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("documentsList", "Danh sách tệp")}</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {docCount} {t("attachmentsUnit", "tệp")}
                </span>
              </div>
              <InvoiceFileList
                documents={documents}
                activeDocId={activeDoc?.id || null}
                onSelectDoc={handleSelectDoc}
                onDownloadDoc={handleDownloadDoc}
                onDeleteDoc={handleDeleteDoc}
              />
            </div>

            <InvoiceFileUploadSection
              uploadType={uploadType}
              onUploadTypeChange={setUploadType}
              onFilesAdded={handleFilesAdded}
              isUploading={isUploadingDirect}
            />
          </div>

          {/* Right Column: Live Document Preview Frame */}
          <div className="flex-1 min-w-0 flex flex-col">
            <InvoiceDocumentPreviewFrame
              activeDoc={activeDoc}
              previewUrl={previewUrl}
              isLoading={isLoadingPreview}
              onDownloadDoc={handleDownloadDoc}
              onSwitchToTemplate={() =>
                previewContext?.setPreviewMode("template")
              }
            />
          </div>
        </div>

        {/* Modal: Link existing document from attachments system */}
        {showSelectDrawer && props.detailInvoice?.id && (
          <ErpAttachmentSelectDrawer
            open={showSelectDrawer}
            onClose={() => setShowSelectDrawer(false)}
            onSelect={(attachment: any) => {
              if (props.onLinkExistingAttachment) {
                props.onLinkExistingAttachment(attachment.id);
              }
              setShowSelectDrawer(false);
            }}
          />
        )}
      </div>
    );
  },
);
