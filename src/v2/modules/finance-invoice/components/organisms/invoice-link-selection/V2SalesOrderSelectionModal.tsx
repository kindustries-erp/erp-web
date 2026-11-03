import React, { useMemo } from "react";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { salesOrderLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/salesOrderLinkApi";
import type { SalesOrderLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import { useV2LinkPicker } from "./useV2LinkPicker";
import { V2LinkPickerModal } from "./V2LinkPickerModal";
import { formatLinkDate } from "./invoice-link-selection.format";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2SalesOrderSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (so: SalesOrderLinkDto) => void;
  /** SO đã liên kết với hóa đơn: hiện nhãn và không cho chọn lại */
  existingSoIds?: string[];
}

/** Modal chọn một đơn bán hàng để ghép nối vào hóa đơn bán ra */
export function V2SalesOrderSelectionModal({
  open,
  onClose,
  onSelect,
  existingSoIds = [],
}: V2SalesOrderSelectionModalProps) {
  const { t } = useV2Translation();
  const picker = useV2LinkPicker<SalesOrderLinkDto>({
    queryKey: "sales-orders",
    fetchPage: salesOrderLinkApi.list,
    open,
    existingIds: existingSoIds,
    onSelect,
    onClose,
  });

  const columns = useMemo<V2Column<SalesOrderLinkDto>[]>(
    () => [
      {
        key: "soNo",
        label: t("v2.invoiceLinkSelection.salesOrder.col.soNo"),
        size: 160,
        cell: (row) => (
          <V2TableText
            text={row.soNo}
            enableCopy
            tooltip
            className="font-mono text-xs"
          />
        ),
      },
      {
        key: "customerName",
        label: t("v2.invoiceLinkSelection.salesOrder.col.customer"),
        size: 260,
        cell: (row) => (
          <V2Text as="span" className="text-xs">
            {row.customerName || "—"}
          </V2Text>
        ),
      },
      {
        key: "orderDate",
        label: t("v2.invoiceLinkSelection.salesOrder.col.orderDate"),
        size: 120,
        cell: (row) => (
          <V2Text as="span" className="font-mono text-xs">
            {formatLinkDate(row.orderDate)}
          </V2Text>
        ),
      },
      {
        key: "status",
        label: t("v2.invoiceLinkSelection.salesOrder.col.status"),
        size: 120,
        cell: (row) => (
          <V2Text as="span" className="text-xs">
            {row.status || "—"}
          </V2Text>
        ),
      },
    ],
    [t],
  );

  return (
    <V2LinkPickerModal<SalesOrderLinkDto>
      open={open}
      onClose={onClose}
      title={t("v2.invoiceLinkSelection.salesOrder.title")}
      emptyLabel={t("v2.invoiceLinkSelection.salesOrder.empty")}
      loadErrorLabel={t("v2.invoiceLinkSelection.salesOrder.loadError")}
      tableId="v2-invoice-link-sales-orders"
      columns={columns}
      picker={picker}
    />
  );
}
