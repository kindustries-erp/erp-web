import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  getFileViewUrl,
  getAttachmentDownloadUrlApi,
} from "@/modules/system/api/attachmentsApi";
import { normalizeInvoiceDocuments } from "../utils/normalizeInvoiceDocuments";
import { useInvoiceDocumentActions } from "./useInvoiceDocumentActions";
import type { InvoiceDocumentWorkspaceProps } from "../types";

export function useInvoiceDocumentWorkspaceLogic(
  props: InvoiceDocumentWorkspaceProps,
) {
  const { detailInvoice, form } = props;
  const { t } = useTranslation("erpInvoices");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [uploadType, setUploadType] = useState<string>("HOA_DON");
  const [showSelectDrawer, setShowSelectDrawer] = useState(false);

  const pendingDeletedPdfs = form?.pendingDeletedPdfs;
  const pendingAddedAttachments = form?.pendingAddedAttachments;

  const documents = useMemo(
    () =>
      normalizeInvoiceDocuments(
        detailInvoice,
        pendingAddedAttachments || [],
        pendingDeletedPdfs || [],
      ),
    [detailInvoice, pendingAddedAttachments, pendingDeletedPdfs],
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
  const activeDocFileKey = activeDoc?.fileKey ?? null;
  const activeDocIsLegacy = activeDoc?.isLegacy ?? false;
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
    if (activeDocIsLegacy && activeDocFileKey && invoiceId) {
      erpInvoicesCoreApi
        .getPdfDownloadUrl(invoiceId, activeDocFileKey, true)
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
      getAttachmentDownloadUrlApi(activeDocId, true)
        .then((res) => {
          if (isMounted) {
            setPreviewUrl(res.url || getFileViewUrl(activeDocId));
            setIsLoadingPreview(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setPreviewUrl(getFileViewUrl(activeDocId));
            setIsLoadingPreview(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [
    activeDocId,
    activeDocFileKey,
    activeDocIsLegacy,
    activeDocIsPending,
    activeDocFileObj,
    invoiceId,
  ]);

  const handleSelectDoc = useCallback((id: string) => {
    setSelectedDocId(id);
  }, []);

  const actions = useInvoiceDocumentActions({
    ...props,
    uploadType,
  });

  return {
    t,
    documents,
    activeDoc,
    previewUrl,
    isLoadingPreview,
    uploadType,
    setUploadType,
    showSelectDrawer,
    setShowSelectDrawer,
    handleSelectDoc,
    ...actions,
  };
}
