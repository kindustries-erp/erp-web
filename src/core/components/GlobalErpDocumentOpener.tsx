import React, { useEffect, useState, useCallback } from "react";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { GarageCaseStandaloneDrawer } from "@/modules/garage/components/GarageCaseStandaloneDrawer";
import { PurchaseOrderStandaloneDrawer } from "@/modules/purchase-orders-core/components/PurchaseOrderStandaloneDrawer";
import { ErpSalesOrderStandaloneDrawer } from "@/modules/sales-orders-core/components/ErpSalesOrderStandaloneDrawer";

interface OpenErpDocumentDetail {
  type:
    | "erp_invoice"
    | "garage_case"
    | "erp_purchase_order"
    | "purchase_order"
    | "erp_sales_order"
    | "sales_order";
  id: string;
}

export function GlobalErpDocumentOpener() {
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activePoId, setActivePoId] = useState<string | null>(null);
  const [activeSoId, setActiveSoId] = useState<string | null>(null);

  const handleOpenDoc = useCallback((e: Event) => {
    const detail = (e as CustomEvent<OpenErpDocumentDetail>).detail;
    if (detail && detail.type === "erp_invoice" && detail.id) {
      setActiveInvoiceId(detail.id);
    } else if (detail && detail.type === "garage_case" && detail.id) {
      setActiveCaseId(detail.id);
    } else if (
      detail &&
      (detail.type === "erp_purchase_order" ||
        detail.type === "purchase_order") &&
      detail.id
    ) {
      if (window.location.pathname.includes("/erp-purchase-orders")) return;
      setActivePoId(detail.id);
    } else if (
      detail &&
      (detail.type === "erp_sales_order" || detail.type === "sales_order") &&
      detail.id
    ) {
      if (window.location.pathname.includes("/erp-sales-orders")) return;
      setActiveSoId(detail.id);
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
        caseCode={activeCaseId}
        onClose={() => setActiveCaseId(null)}
      />
      <PurchaseOrderStandaloneDrawer
        isOpen={!!activePoId}
        poId={activePoId}
        onClose={() => setActivePoId(null)}
      />
      <ErpSalesOrderStandaloneDrawer
        isOpen={!!activeSoId}
        soId={activeSoId}
        onClose={() => setActiveSoId(null)}
      />
    </>
  );
}
