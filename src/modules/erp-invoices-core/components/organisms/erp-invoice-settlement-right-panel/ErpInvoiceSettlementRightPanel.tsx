import React from "react";
import { useErpInvoiceSettlement } from "../erp-invoice-settlement-tab/context/ErpInvoiceSettlementContext";
import { type ErpInvoiceSettlementTabProps } from "../erp-invoice-settlement-tab/types";
import { ErpInvoiceInternalSidebar } from "../erp-invoice-detail-drawer/ErpInvoiceInternalSidebar";
import { ErpInvoiceSettlementDebtSection } from "./ErpInvoiceSettlementDebtSection";
import type { CreateErpInvoicePayload } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

import type { ErpInvoiceSettlementRightPanelProps } from "./ErpInvoiceSettlementRightPanel.type";

export function ErpInvoiceSettlementRightPanel(
  props?: ErpInvoiceSettlementRightPanelProps,
) {
  const ctx = useErpInvoiceSettlement();

  const invoice = props?.invoice || ctx.invoice;
  const form = (props?.form || ctx.form || {}) as CreateErpInvoicePayload;
  const editMode = props?.editMode ?? ctx.editMode;
  const fieldSet = (props?.fieldSet || ctx.fieldSet || (() => {})) as (
    key: string,
    value: unknown,
  ) => void;
  const direction =
    props?.direction ||
    ctx.direction ||
    (invoice?.direction as "IN" | "OUT") ||
    "IN";
  const onRefresh = props?.onRefresh || ctx.onRefresh;

  return (
    <div className={props?.className}>
      <ErpInvoiceInternalSidebar
        form={form}
        editMode={editMode}
        fieldSet={fieldSet}
        invoiceId={invoice?.id ?? null}
        pendingTagIds={props?.pendingTagIds}
        onPendingTagsChange={props?.onPendingTagsChange}
        direction={direction}
        detailInvoice={invoice}
        onRefreshDetail={onRefresh}
        debtSlot={<ErpInvoiceSettlementDebtSection />}
      />
    </div>
  );
}
