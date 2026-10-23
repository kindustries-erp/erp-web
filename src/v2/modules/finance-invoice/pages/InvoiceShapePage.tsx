import * as React from "react";
import { FileDown, FileUp, Receipt } from "lucide-react";
import { V2Button, V2ModulePage } from "@/v2/shared/components";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { InvoiceShapeOverlays } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-overlays/InvoiceShapeOverlays";
import { useInvoiceShapePage } from "./InvoiceShapePage.hook";
import { buildInvoiceTabs } from "./InvoiceShapePage.tabs";

/**
 * Trang mẫu hình dạng erp-invoice: toàn bộ UI do khung V2 lo, phần "logic" chỉ gồm
 * `useFakeInvoices` (nhận query, trả dữ liệu) và các state nghiệp vụ nhỏ của trang.
 */
export const InvoiceShapePage: React.FC<{ syncUrl?: boolean }> = ({
  syncUrl = true,
}) => {
  const state = useInvoiceShapePage();
  const {
    overlay,
    openOverlay,
    selected,
    bulkOpen,
    setBulkOpen,
    importOpen,
    setImportOpen,
    invoice,
  } = state;

  return (
    <V2ModulePage<FakeInvoice>
      title="Hóa đơn điện tử"
      description="Quản lý hóa đơn mua vào, bán ra và tổng quan thuế"
      icon={<Receipt className="h-4 w-4" />}
      tabs={buildInvoiceTabs(state)}
      syncUrl={syncUrl}
      actions={
        <>
          <V2Button
            variant="outline"
            size="sm"
            leftIcon={<FileUp className="h-3.5 w-3.5" />}
            onClick={() => setImportOpen(true)}
          >
            Nhập XML
          </V2Button>
          <V2Button
            variant="outline"
            size="sm"
            leftIcon={<FileDown className="h-3.5 w-3.5" />}
            onClick={() => openOverlay("export")}
          >
            Xuất Excel
          </V2Button>
        </>
      }
      overlays={
        <InvoiceShapeOverlays
          invoice={invoice}
          overlay={overlay}
          selectedCount={selected.length}
          bulkOpen={bulkOpen}
          onBulkOpenChange={setBulkOpen}
          importOpen={importOpen}
          onImportOpenChange={setImportOpen}
        />
      }
    />
  );
};
