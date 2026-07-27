import React, { useEffect, useState, useCallback } from "react";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { GarageCaseStandaloneDrawer } from "@/modules/garage/components/GarageCaseStandaloneDrawer";

interface OpenErpDocumentDetail {
  type: "erp_invoice" | "garage_case";
  id: string;
}

export function GlobalErpDocumentOpener() {
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const handleOpenDoc = useCallback((e: Event) => {
    const detail = (e as CustomEvent<OpenErpDocumentDetail>).detail;
    if (detail && detail.type === "erp_invoice" && detail.id) {
      setActiveInvoiceId(detail.id);
    } else if (detail && detail.type === "garage_case" && detail.id) {
      setActiveCaseId(detail.id);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("open_erp_document", handleOpenDoc);
    return () => {
      window.removeEventListener("open_erp_document", handleOpenDoc);
    };
  }, [handleOpenDoc]);

  return (
    <>
      <ErpInvoiceStandaloneDrawer
        isOpen={!!activeInvoiceId}
        invoiceId={activeInvoiceId}
        onClose={() => setActiveInvoiceId(null)}
      />
      <GarageCaseStandaloneDrawer
        isOpen={!!activeCaseId}
        caseId={activeCaseId}
        onClose={() => setActiveCaseId(null)}
      />
    </>
  );
}
