import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type ManualPdfUploadResponse,
} from "../api/erpInvoicesCoreApi";
import { originalPdfLookupInfoKey } from "./useOriginalPdfLookupInfo";

export interface ManualUploadPdfPayload {
  invoiceId: string;
  file: File;
}

export function useManualUploadPdf() {
  const { t } = useTranslation("erpInvoices");
  const queryClient = useQueryClient();

  return useMutation<ManualPdfUploadResponse, Error, ManualUploadPdfPayload>({
    mutationFn: ({ invoiceId, file }) =>
      erpInvoicesCoreApi.uploadManualPdf(invoiceId, file),
    onSuccess: (_data, { invoiceId }) => {
      toast.success(t("uploadPdfSuccess"));
      queryClient.invalidateQueries({
        queryKey: originalPdfLookupInfoKey(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("uploadPdfFailed"));
    },
  });
}
