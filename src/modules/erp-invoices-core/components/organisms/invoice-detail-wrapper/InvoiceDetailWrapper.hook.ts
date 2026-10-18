import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

export function useInvoiceDetailWrapper({
  invoiceId,
  onClose,
}: {
  invoiceId: string | null;
  onClose: () => void;
}) {
  const formHook = useErpInvoiceForm(() => {});

  const { data: invoice, isFetching } = useQuery({
    queryKey: ["erp-invoice", invoiceId],
    queryFn: () => (invoiceId ? erpInvoicesCoreApi.get(invoiceId) : null),
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (invoice && invoiceId) {
      formHook.openInternal(invoice);
    } else {
      formHook.closeDrawer();
    }
  }, [invoice, invoiceId]);

  const handleClose = useCallback(() => {
    formHook.closeDrawer();
    onClose();
  }, [formHook, onClose]);

  return {
    formHook,
    isFetching,
    handleClose,
  };
}
