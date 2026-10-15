import * as React from "react";
import { useV2OverlayState } from "@/v2/shared/hooks/useV2OverlayState";
import { resetV2TableUrl } from "@/v2/shared/utils/v2TableUrl";
import { buildInvoiceColumns } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-table/invoiceShape.columns";
import type { InvoiceView } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-table/invoiceShape.columns";
import type { TaxTab } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { findInvoice } from "@/v2/modules/finance-invoice/domain/rules/invoiceShape.logic";
import { DETAIL_PREFIX } from "@/v2/modules/finance-invoice/components/organisms/invoice-shape-overlays/InvoiceShapeOverlays";

/** State nghiệp vụ của trang hóa đơn: tab thuế, chế độ xem, lựa chọn, overlay và cột */
export const useInvoiceShapePage = () => {
  const [taxTab, setTaxTab] = React.useState<TaxTab>("all");
  const [view, setView] = React.useState<InvoiceView>("overview");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [resetCount, setResetCount] = React.useState(0);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const overlay = useV2OverlayState();
  const { open: openOverlay } = overlay;

  const columns = React.useMemo(
    () =>
      buildInvoiceColumns(view, (id) => openOverlay(`${DETAIL_PREFIX}${id}`)),
    [view, openOverlay],
  );

  const bumpResetCount = () => setResetCount((count) => count + 1);

  const changeTaxTab = (key: string) => {
    setTaxTab(key as TaxTab);
    setSelected([]);
    resetV2TableUrl("in");
    resetV2TableUrl("out");
    bumpResetCount();
  };

  const detailId = overlay.stack
    .find((id) => id.startsWith(DETAIL_PREFIX))
    ?.slice(DETAIL_PREFIX.length);

  return {
    taxTab,
    view,
    setView,
    selected,
    setSelected,
    resetCount,
    bumpResetCount,
    bulkOpen,
    setBulkOpen,
    importOpen,
    setImportOpen,
    overlay,
    openOverlay,
    columns,
    changeTaxTab,
    invoice: detailId ? findInvoice(detailId) : undefined,
  };
};

export type InvoiceShapePageState = ReturnType<typeof useInvoiceShapePage>;
