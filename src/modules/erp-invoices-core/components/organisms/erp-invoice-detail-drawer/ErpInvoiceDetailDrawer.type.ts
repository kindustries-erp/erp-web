import React from "react";
import type {
  DrawerTopTabItem,
  DrawerRelatedTabItem,
} from "@/shared/components/StandardFormDrawer";
import type {
  ErpInvoice,
  CreateErpInvoicePayload,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  editMode: boolean;
  detailInvoice: ErpInvoice | null;
  startEdit: () => void;
  saving: boolean;
  handleSave: (statusOverride?: string) => void;
  cancelEdit: () => void;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  onSyncDetail?: () => void;
  loadingDetail?: boolean;
  hideEditToggle?: boolean;
  form?: CreateErpInvoicePayload;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  tabs?: DrawerTopTabItem[];
  defaultTabKey?: string;
  activeTabKey?: string;
  onTabChange?: (tabKey: string) => void;
  relatedTabs?: DrawerRelatedTabItem[];
  defaultRelatedTabKey?: string;
  defaultRelatedCollapsed?: boolean;
  bottomPanel?: React.ReactNode;
  partnerViewMode?: "details" | "invoices" | "lines";
}
