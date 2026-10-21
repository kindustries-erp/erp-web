import type React from "react";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type {
  PartnerSubTabMode,
  InvoiceDetailSubTabKey,
} from "./ErpInvoicePartnerTabNav";

export type { InvoiceDetailSubTabKey };

export interface ErpInvoiceDetailPaneProps {
  detailInvoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
  children?: React.ReactNode;
  defaultPartnerSubTab?: PartnerSubTabMode;
  form?: any;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  activeSubTab?: InvoiceDetailSubTabKey;
  onSubTabChange?: (tab: InvoiceDetailSubTabKey) => void;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
}

export type ErpInvoicePartnerTabProps = ErpInvoiceDetailPaneProps;
