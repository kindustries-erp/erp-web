import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { invoiceFilesV2Api } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";
import { useInvoiceFilesV2 } from "@/modules/erp-invoices-core/hooks/useInvoiceFilesV2";
import { normalizeInvoiceDocuments } from "./InvoiceDocumentWorkspace.helper";
import { useInvoiceDocumentActions } from "./InvoiceDocumentWorkspace.actions";
import type { InvoiceDocumentWorkspaceProps } from "./InvoiceDocumentWorkspace.type";

export function useInvoiceDocumentWorkspaceLogic(
  props: InvoiceDocumentWorkspaceProps,
) {
  const { detailInvoice, form } = props;
  const { t } = useTranslation("erpInvoices");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [uploadType, setUploadType] = useState<string>("HOA_DON");

  const pendingDeletedPdfs = form?.pendingDeletedPdfs;
  const pendingAddedAttachments = form?.pendingAddedAttachments;

  const { files, reload: reloadFiles } = useInvoiceFilesV2(detailInvoice?.id);

  const documents = useMemo(
    () =>
      normalizeInvoiceDocuments(
        files,
        pendingAddedAttachments || [],
        pendingDeletedPdfs || [],
      ),
    [files, pendingAddedAttachments, pendingDeletedPdfs],
  );

  const activeDoc = useMemo(() => {
    if (documents.length === 0) return null;
    if (selectedDocId) {
      const found = documents.find((d) => d.id === selectedDocId);
      if (found) return found;
    }
    return documents[0];
  }, [documents, selectedDocId]);

  const activeDocId = activeDoc?.id ?? null;
  const activeDocIsPending = activeDoc?.isPending ?? false;
  const activeDocFileObj = activeDoc?.fileObj ?? null;
  const invoiceId = detailInvoice?.id ?? null;

  useEffect(() => {
    let isMounted = true;
    if (!activeDocId) {
      setPreviewUrl(null);
      setIsLoadingPreview(false);
      return;
    }

    if (activeDocIsPending && activeDocFileObj) {
      const localBlob = URL.createObjectURL(activeDocFileObj);
      setPreviewUrl(localBlob);
      setIsLoadingPreview(false);
      return () => {
        URL.revokeObjectURL(localBlob);
      };
    }

    setIsLoadingPreview(true);
    if (invoiceId) {
      invoiceFilesV2Api
        .downloadUrl(invoiceId, activeDocId, true)
        .then((res) => {
          if (isMounted) {
            setPreviewUrl(res.url);
            setIsLoadingPreview(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setPreviewUrl(null);
            setIsLoadingPreview(false);
          }
        });
    } else {
      setPreviewUrl(null);
      setIsLoadingPreview(false);
    }

    return () => {
      isMounted = false;
    };
  }, [activeDocId, activeDocIsPending, activeDocFileObj, invoiceId]);

  const handleSelectDoc = useCallback((id: string) => {
    setSelectedDocId(id);
  }, []);

  const actions = useInvoiceDocumentActions({
    ...props,
    uploadType,
    reloadFiles,
  });

  return {
    t,
    documents,
    activeDoc,
    previewUrl,
    isLoadingPreview,
    uploadType,
    setUploadType,
    handleSelectDoc,
    ...actions,
  };
}
