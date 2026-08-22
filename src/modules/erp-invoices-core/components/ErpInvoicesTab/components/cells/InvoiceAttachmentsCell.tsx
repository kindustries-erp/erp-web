import React from "react";
import { Eye, FileCode, FileText } from "lucide-react";
import { type TFunction } from "i18next";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { getFileViewUrl } from "@/modules/system/api/attachmentsApi";
import { getPdfAttachments } from "../../utils";

export interface InvoiceAttachmentsCellProps {
  inv: ErpInvoice;
  t: TFunction<any, any>;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  handleDownload: (id: string, type: "pdf" | "xml") => Promise<void>;
  handlePreviewPdf: (
    id: string,
    key: string,
    filename: string,
  ) => Promise<void>;
  setPreviewPdf: (
    pdf: {
      url: string;
      filename: string;
      fileKey: string;
      invoiceId: string;
      isAttachment?: boolean;
    } | null,
  ) => void;
}

export function InvoiceAttachmentsCell({
  inv,
  t,
  openPopoverId,
  setOpenPopoverId,
  handleDownload,
  handlePreviewPdf,
  setPreviewPdf,
}: InvoiceAttachmentsCellProps) {
  const hasPdf =
    Boolean(inv.pdfFileKey) ||
    Boolean(inv.pdfFiles && inv.pdfFiles.length > 0) ||
    Boolean(inv.attachments && getPdfAttachments(inv.attachments).length > 0);

  const pdfAttachments = getPdfAttachments(inv.attachments ?? []);

  return (
    <div className="flex items-center justify-center gap-1.5">
      {inv.xmlFileKey ? (
        <Tooltip content={t("downloadXml", "Tải file XML")}>
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              void handleDownload(inv.id, "xml");
            }}
          >
            <FileCode className="w-4 h-4 text-slate-700 hover:text-primary transition-colors" />
          </div>
        </Tooltip>
      ) : (
        <Tooltip content={t("noXml", "Chưa có file XML/ZIP")}>
          <FileCode className="w-4 h-4 text-gray-300" />
        </Tooltip>
      )}

      {hasPdf ? (
        <Popover
          align="start"
          open={openPopoverId === inv.id}
          onOpenChange={(open) => setOpenPopoverId(open ? inv.id : null)}
          content={
            <div className="p-3 w-[350px]">
              <div className="text-sm font-semibold mb-3 text-slate-800">
                Danh sách file PDF
              </div>
              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                {inv.pdfFileKey &&
                  !inv.attachments?.some(
                    (p: any) => p.attachment?.fileKey === inv.pdfFileKey,
                  ) && (
                    <div className="flex items-center justify-between text-sm py-2 px-3 border border-border rounded-lg mb-2">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span
                          className="truncate font-medium text-slate-700"
                          title="Hóa đơn PDF"
                        >
                          {(inv.pdfFileKey as string).split("/").pop() ||
                            "Hóa đơn PDF"}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          Hóa đơn PDF (Gốc)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenPopoverId(null);
                          void handlePreviewPdf(
                            inv.id,
                            inv.pdfFileKey as string,
                            (inv.pdfFileKey as string).split("/").pop() ||
                              "Hóa đơn PDF",
                          );
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                {pdfAttachments.map((pdf: any) => (
                  <div
                    key={pdf.attachment?.fileKey || pdf.attachment?.id}
                    className="flex items-center justify-between text-sm py-2 px-3 border border-border rounded-lg"
                  >
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                      <span
                        className="truncate font-medium text-slate-700"
                        title={pdf.attachment?.fileName}
                      >
                        {pdf.attachment?.fileName}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        Hóa đơn PDF
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPopoverId(null);
                        const url = getFileViewUrl(pdf.attachment?.id);
                        setPreviewPdf({
                          url,
                          filename: pdf.attachment?.fileName || "document.pdf",
                          fileKey: pdf.attachment?.id,
                          invoiceId: inv.id,
                          isAttachment: true,
                        });
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Tooltip content={t("pdfList", "Danh sách file PDF")}>
              <div className="cursor-pointer">
                <FileText className="w-4 h-4 text-slate-700 hover:text-primary transition-colors" />
              </div>
            </Tooltip>
          </div>
        </Popover>
      ) : (
        <Tooltip content={t("noPdf", "Chưa có file PDF")}>
          <FileText className="w-4 h-4 text-gray-300" />
        </Tooltip>
      )}
    </div>
  );
}
