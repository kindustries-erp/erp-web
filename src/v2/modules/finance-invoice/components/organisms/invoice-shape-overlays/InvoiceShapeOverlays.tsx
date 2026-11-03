import * as React from "react";
import type { useV2OverlayState } from "@/v2/shared/hooks/useV2OverlayState";
import type { FakeInvoice } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { InvoiceShapeDetailDrawer } from "@/v2/modules/finance-invoice/drawers/InvoiceShapeDetailDrawer";

export const DETAIL_PREFIX = "invoice:";

interface Props {
  invoice: FakeInvoice | undefined;
  overlay: ReturnType<typeof useV2OverlayState>;
}

/** Overlay của trang: hiện drawer chi tiết khi URL có `invoice:<id>` và dữ liệu đã tải xong */
export const InvoiceShapeOverlays: React.FC<Props> = ({ invoice, overlay }) => (
  <>
    {invoice && (
      <InvoiceShapeDetailDrawer
        key={invoice.id}
        invoice={invoice}
        open
        onClose={() => overlay.close(`${DETAIL_PREFIX}${invoice.id}`)}
      />
    )}
  </>
);
