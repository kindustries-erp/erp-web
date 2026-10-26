import React from "react";
import { InvoiceDebtsExportDrawer as InvoiceDebtsExportDrawerV2 } from "@/v2/modules/invoice-debts";
import type {
  GetInvoiceDebtsQueryParams,
  InvoicePartnerType,
} from "../api/invoiceDebtsApi";

export interface InvoiceDebtsExportDrawerProps {
  open: boolean;
  onClose: () => void;
  initialPartnerType?: InvoicePartnerType;
  buildBaseQuery?: () => Partial<GetInvoiceDebtsQueryParams>;
}

/**
 * Adapter V1 cho Drawer Xuất Excel báo cáo công nợ:
 * Giữ nguyên 100% props interface để các page V1 (như InvoiceDebtsPage) hoạt động trơn tru,
 * delegate toàn bộ việc hiển thị và tương tác sang InvoiceDebtsExportDrawer (V2).
 */
export function InvoiceDebtsExportDrawer({
  open,
  onClose,
  initialPartnerType,
  buildBaseQuery,
}: InvoiceDebtsExportDrawerProps) {
  return (
    <InvoiceDebtsExportDrawerV2
      open={open}
      onClose={onClose}
      initialPartnerType={initialPartnerType}
      buildBaseQuery={buildBaseQuery}
    />
  );
}
