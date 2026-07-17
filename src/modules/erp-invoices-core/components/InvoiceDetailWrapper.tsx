import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { useErpInvoiceForm } from "../hooks/useErpInvoiceForm";
import { ErpInvoiceInfoDrawer } from "./ErpInvoiceInfoDrawer";
import { ErpInvoiceFormItems } from "./ErpInvoiceFormItems";
import { ErpInvoiceFormGeneral } from "./ErpInvoiceFormGeneral";
import { money } from "@/shared/utils/format";

interface Props {
  invoiceId: string | null;
  onClose: () => void;
}

export function InvoiceDetailWrapper({ invoiceId, onClose }: Props) {
  const formHook = useErpInvoiceForm(() => {});

  const { data: invoice, isFetching } = useQuery({
    queryKey: ["erp-invoice", invoiceId],
    queryFn: () => (invoiceId ? erpInvoicesCoreApi.get(invoiceId) : null),
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (invoice && invoiceId) {
      formHook.openDetail(invoice);
    } else {
      formHook.closeDrawer();
    }
  }, [invoice, invoiceId]);

  const handleClose = () => {
    formHook.closeDrawer();
    onClose();
  };

  return (
    <ErpInvoiceInfoDrawer
      open={!!invoiceId && formHook.infoDrawerOpen}
      onClose={handleClose}
      editMode={false}
      detailInvoice={formHook.detailInvoice}
      saving={formHook.saving}
      handleSave={formHook.handleSave}
      onDownload={() => {}}
      loadingDetail={isFetching || formHook.loadingDetail}
      leftPanel={
        <div className="flex flex-col gap-5">
          <ErpInvoiceFormItems
            form={formHook.form}
            editMode={false}
            setForm={formHook.setForm}
            fmtAmt={money}
          />
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-5">
          <ErpInvoiceFormGeneral
            form={formHook.form}
            editMode={false}
            fieldSet={() => {}}
            invoiceId={formHook.detailInvoice?.id ?? null}
          />
        </div>
      }
    />
  );
}
