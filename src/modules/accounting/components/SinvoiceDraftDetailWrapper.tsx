import React, { useEffect, useState } from "react";
import { type SinvoiceDraft } from "@/modules/accounting/api/sinvoiceDraftApi";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import {
  type ErpInvoice,
  type ErpInvoiceItem,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import {
  useCompanyProfile,
  type CompanyProfile,
} from "@/core/api/companyProfileApi";

interface Props {
  draft: SinvoiceDraft | null;
  onClose: () => void;
}

function mapDraftToErpInvoice(
  draft: SinvoiceDraft,
  companyProfile?: CompanyProfile,
): ErpInvoice {
  const d = draft as any;
  const lpStr = d.listProduct || draft.responsePayload?.listProduct;
  let items: ErpInvoiceItem[] = [];

  try {
    const parsedLp = lpStr
      ? typeof lpStr === "string"
        ? JSON.parse(lpStr)
        : lpStr
      : null;
    const itemInfo = parsedLp?.itemInfo || [];

    if (Array.isArray(itemInfo)) {
      items = itemInfo.map((p: any) => ({
        description: p.itemName,
        unit: p.unitName,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        preVatAmount: p.itemTotalAmountWithoutVat || 0,
        vatRate: p.vatPercentage,
        vatAmount: p.vatAmount || 0,
        discountAmount: p.discount || 0,
        totalAmount: p.itemTotalAmountWithVat || 0,
      }));
    }
  } catch (e) {
    console.error("Lỗi parse listProduct:", e);
  }

  const payload = draft.responsePayload || {};
  const preVatAmount =
    Number(draft.totalAmount || 0) - Number(draft.vatAmount || 0);
  const sellerName =
    companyProfile?.company_name ||
    payload.companyName ||
    payload.sellerName ||
    "";
  const sellerTaxCode =
    companyProfile?.tax_code || payload.sellerTaxCode || "";
  const sellerAddress =
    companyProfile?.address ||
    payload.sellerAddress ||
    payload.sellerAddressLine ||
    "";

  return {
    id: draft.id,
    invoiceNo: draft.documentNo || "",
    serialNo: payload.invoiceSeri || payload.invoiceSeries || "",
    invoiceDate: draft.createdAt || new Date().toISOString(),
    direction: "OUT",
    status: draft.status || "DRAFT",
    sellerName,
    sellerTaxCode,
    sellerAddress,
    buyerName: draft.buyerName || "",
    buyerTaxCode: draft.buyerTaxCode || "",
    buyerAddress: draft.buyerAddress || "",
    preVatAmount: preVatAmount.toString(),
    vatAmount: (draft.vatAmount || 0).toString(),
    discountAmount: "0",
    totalAmount: (draft.totalAmount || 0).toString(),
    description: d.description || "",
    notes: d.notes || "",
    items: items,
    currencyCode: payload.currencyCode || "VND",
  } as any;
}

export function SinvoiceDraftDetailWrapper({ draft, onClose }: Props) {
  const formHook = useErpInvoiceForm(() => {});
  const [detailInvoice, setDetailInvoice] = useState<ErpInvoice | null>(null);
  const { data: companyProfile } = useCompanyProfile();

  useEffect(() => {
    if (draft) {
      const mapped = mapDraftToErpInvoice(draft, companyProfile);
      setDetailInvoice(mapped);
      // We manually populate the form hook's detail and skip fetch
      formHook.openInternal(mapped, true);
    } else {
      formHook.closeDrawer();
      setDetailInvoice(null);
    }
  }, [draft, companyProfile]);

  const handleClose = () => {
    formHook.closeDrawer();
    onClose();
  };

  const fieldSet = (key: string, value: any) => {
    formHook.setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (!draft) return null;

  return (
    <ErpInvoiceInternalDrawer
      open={!!draft && formHook.internalDrawerOpen}
      onClose={handleClose}
      editMode={false}
      detailInvoice={detailInvoice}
      hideEditToggle={true}
      saving={false}
      handleSave={() => {}}
      startEdit={() => {}}
      cancelEdit={() => {}}
      rightPanel={
        <div className="flex flex-col gap-5">
          <ErpInvoiceInternalSidebar
            form={formHook.form}
            editMode={false}
            fieldSet={fieldSet}
            invoiceId={null}
            direction="OUT"
            detailInvoice={detailInvoice}
            hideAccountingSection={true}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <ErpInvoiceInternalMain
          form={formHook.form}
          editMode={false}
          fieldSet={fieldSet}
          direction="OUT"
          detailInvoice={detailInvoice}
          postingState={null as any}
          pendingUnpost={false}
          onUnpost={() => {}}
          onRefreshDetail={() => {}}
          hideLinkedDocuments={true}
          invoicePreview={
            detailInvoice ? (
              <VietnamInvoiceTemplate invoice={detailInvoice} />
            ) : undefined
          }
        />
      </div>
    </ErpInvoiceInternalDrawer>
  );
}
