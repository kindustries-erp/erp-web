import React, { useMemo } from "react";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { purchaseOrderLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/purchaseOrderLinkApi";
import type { PurchaseOrderLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import { useV2LinkPicker } from "./useV2LinkPicker";
import { V2LinkPickerModal } from "./V2LinkPickerModal";
import { formatLinkDate } from "./invoice-link-selection.format";

export interface V2PurchaseOrderSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (po: PurchaseOrderLinkDto) => void;
  /** PO đã liên kết với hóa đơn: hiện nhãn và không cho chọn lại */
  existingPoIds?: string[];
}

/** Modal chọn một đơn mua hàng để ghép nối vào hóa đơn mua vào */
export function V2PurchaseOrderSelectionModal({
  open,
  onClose,
  onSelect,
  existingPoIds = [],
}: V2PurchaseOrderSelectionModalProps) {
  const { t } = useV2Translation();
  const picker = useV2LinkPicker<PurchaseOrderLinkDto>({
    queryKey: "purchase-orders",
    fetchPage: purchaseOrderLinkApi.list,
    open,
    existingIds: existingPoIds,
    onSelect,
    onClose,
  });

  const columns = useMemo<V2Column<PurchaseOrderLinkDto>[]>(
    () => [
      {
        key: "poNo",
        label: t("v2.invoiceLinkSelection.purchaseOrder.col.poNo"),
        size: 160,
        cell: (row) => (
          <V2TableText
            text={row.poNo}
            enableCopy
            tooltip
            className="font-mono text-xs"
          />
        ),
      },
      {
        key: "supplierName",
        label: t("v2.invoiceLinkSelection.purchaseOrder.col.supplier"),
        size: 260,
        cell: (row) => (
          <span className="text-xs">{row.supplierName || "—"}</span>
        ),
      },
      {
        key: "orderDate",
        label: t("v2.invoiceLinkSelection.purchaseOrder.col.orderDate"),
        size: 120,
        cell: (row) => (
          <span className="font-mono text-xs">
            {formatLinkDate(row.orderDate)}
          </span>
        ),
      },
      {
        key: "status",
        label: t("v2.invoiceLinkSelection.purchaseOrder.col.status"),
        size: 120,
        cell: (row) => <span className="text-xs">{row.status || "—"}</span>,
      },
    ],
    [t],
  );

  return (
    <V2LinkPickerModal<PurchaseOrderLinkDto>
      open={open}
      onClose={onClose}
      title={t("v2.invoiceLinkSelection.purchaseOrder.title")}
      searchPlaceholder={t(
        "v2.invoiceLinkSelection.purchaseOrder.searchPlaceholder",
      )}
      emptyLabel={t("v2.invoiceLinkSelection.purchaseOrder.empty")}
      loadErrorLabel={t("v2.invoiceLinkSelection.purchaseOrder.loadError")}
      tableId="v2-invoice-link-purchase-orders"
      columns={columns}
      picker={picker}
    />
  );
}
