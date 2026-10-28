import * as React from "react";
import { Receipt } from "lucide-react";
import { V2ModulePage } from "@/v2/shared/components";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { InvoiceShapeOverlays } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-overlays/InvoiceShapeOverlays";
import { useInvoiceShapePage } from "./InvoiceShapePage.hook";
import { buildInvoiceTabs } from "./InvoiceShapePage.tabs";

/**
 * Trang hóa đơn điện tử trên V2 (dual-run `/v2/invoices`): tổng quan, danh sách mua vào/bán ra
 * và drawer chi tiết chỉ đọc. Dữ liệu lấy từ API `erp-invoices`.
 */
export const InvoiceShapePage: React.FC<{ syncUrl?: boolean }> = ({
  syncUrl = true,
}) => {
  const state = useInvoiceShapePage();
  const { overlay, invoice } = state;

  return (
    <V2ModulePage<FakeInvoice>
      title="Hóa đơn điện tử"
      description="Quản lý hóa đơn mua vào, bán ra và tổng quan thuế"
      icon={<Receipt className="h-4 w-4" />}
      tabs={buildInvoiceTabs(state)}
      syncUrl={syncUrl}
      overlays={<InvoiceShapeOverlays invoice={invoice} overlay={overlay} />}
    />
  );
};
