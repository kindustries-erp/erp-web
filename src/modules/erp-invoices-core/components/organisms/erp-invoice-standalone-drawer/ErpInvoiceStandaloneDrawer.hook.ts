import { useEffect, useCallback } from "react";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export function useErpInvoiceStandaloneDrawer({
  isOpen,
  invoiceId,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const formHook = useErpInvoiceForm(async () => {
    if (onSuccess) onSuccess();
  });

  useEffect(() => {
    if (isOpen && invoiceId) {
      formHook.openInternal({ id: invoiceId } as ErpInvoice);
    } else if (!isOpen) {
      if (formHook.internalDrawerOpen) {
        formHook.closeDrawer();
      }
    }
  }, [isOpen, invoiceId]);

  const handleClose = useCallback(() => {
    formHook.closeDrawer();
    onClose();
  }, [formHook, onClose]);

  return {
    formHook,
    handleClose,
  };
}
