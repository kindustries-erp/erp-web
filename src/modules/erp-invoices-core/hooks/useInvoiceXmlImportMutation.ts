import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  type BulkImportResult,
} from "../api/erpInvoicesCoreApi";
import { extractApiError } from "@/shared/utils/apiError";
import { createClientId, splitManualMatches } from "./invoiceXmlPairing.helper";
import type { Direction, FileEntry } from "./invoiceXmlUpload.type";

export interface XmlImportPayload {
  direction: Direction;
  targetFiles: FileEntry[];
  manualMatches?: Record<string, string>;
}

/** Import XML tự động qua API bulk; PDF ghép tay được gửi theo từng hóa đơn đã chọn */
export function useInvoiceXmlImportMutation() {
  const { t } = useTranslation("erpInvoices");

  return useMutation({
    mutationFn: async ({
      direction,
      targetFiles,
      manualMatches,
    }: XmlImportPayload): Promise<BulkImportResult> => {
      const { autoFiles, manualFiles } = splitManualMatches(
        targetFiles,
        manualMatches,
      );

      let finalResult: BulkImportResult = {
        importId: createClientId(),
        direction,
        total: targetFiles.length,
        created: 0,
        skipped: [],
        errors: [],
        pdfAttached: [],
        pdfOrphans: [],
      };

      if (autoFiles.length > 0) {
        finalResult =
          direction === "IN"
            ? await erpInvoicesCoreApi.bulkImportBuyerXml(autoFiles)
            : await erpInvoicesCoreApi.bulkImportSellerXml(autoFiles);
      }

      if (manualFiles.size > 0) {
        const attached = finalResult.pdfAttached ?? [];
        finalResult.pdfAttached = attached;
        await Promise.all(
          Array.from(manualFiles, async ([invoiceId, pdfs]) => {
            try {
              await erpInvoicesCoreApi.uploadPdfs(invoiceId, pdfs);
              for (const f of pdfs) {
                attached.push({
                  filename: f.name,
                  invoiceId,
                  invoiceNo: t("xmlManualMatchLabel", "Ghép thủ công"),
                });
              }
            } catch (e) {
              const reason = extractApiError(
                e,
                t("xmlManualMatchError", "Lỗi ghép thủ công"),
              );
              for (const f of pdfs) {
                finalResult.errors.push({ filename: f.name, reason });
              }
            }
          }),
        );
      }

      return finalResult;
    },
  });
}
