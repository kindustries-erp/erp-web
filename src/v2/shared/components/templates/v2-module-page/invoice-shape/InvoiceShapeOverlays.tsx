import * as React from "react";
import type { useV2OverlayState } from "@/v2/shared/hooks/useV2OverlayState";
import type { FakeInvoice } from "./invoiceShape.data";
import { InvoiceShapeDetailDrawer } from "./InvoiceShapeDetailDrawer";
import { InvoiceShapeExportDrawer } from "./InvoiceShapeExportDrawer";
import {
  InvoiceShapeBulkModal,
  InvoiceShapeImportModal,
} from "./InvoiceShapeModals";
import { InvoiceShapePostingDrawer } from "./InvoiceShapePostingDrawer";

export const DETAIL_PREFIX = "invoice:";

interface Props {
  invoice: FakeInvoice | undefined;
  overlay: ReturnType<typeof useV2OverlayState>;
  selectedCount: number;
  bulkOpen: boolean;
  onBulkOpenChange: (open: boolean) => void;
  importOpen: boolean;
  onImportOpenChange: (open: boolean) => void;
}

/** Mọi drawer và modal của trang: trạng thái mở của drawer lấy từ URL qua `useV2OverlayState` */
export const InvoiceShapeOverlays: React.FC<Props> = ({
  invoice,
  overlay,
  selectedCount,
  bulkOpen,
  onBulkOpenChange,
  importOpen,
  onImportOpenChange,
}) => (
  <>
    {invoice && (
      <InvoiceShapeDetailDrawer
        key={invoice.id}
        invoice={invoice}
        open
        onClose={() => overlay.close(`${DETAIL_PREFIX}${invoice.id}`)}
        onPost={() => overlay.open("posting")}
      />
    )}
    <InvoiceShapePostingDrawer
      open={overlay.isOpen("posting")}
      onClose={() => overlay.close("posting")}
    />
    <InvoiceShapeExportDrawer
      open={overlay.isOpen("export")}
      onClose={() => overlay.close("export")}
    />
    <InvoiceShapeBulkModal
      open={bulkOpen}
      count={selectedCount}
      onOpenChange={onBulkOpenChange}
    />
    <InvoiceShapeImportModal
      open={importOpen}
      onOpenChange={onImportOpenChange}
    />
  </>
);
