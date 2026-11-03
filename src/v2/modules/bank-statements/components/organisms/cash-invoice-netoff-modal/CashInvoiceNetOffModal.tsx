import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2LinkSelectionModal } from "@/v2/shared/components/molecules/v2-link-selection-modal";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
import {
  V2StandardTable,
  type V2Column,
} from "@/v2/shared/components/organisms/v2-standard-table";
import { formatDateTimeParts } from "@/v2/shared/components/atoms/v2-table-date-cell/v2TableDate";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import "../../../bankStatements.cashNetOff.locale";
import {
  useCashInvoiceNetOffPicker,
  type NetOffInvoiceRow,
} from "./useCashInvoiceNetOffPicker";
import type { CashInvoiceNetOffModalProps } from "./CashInvoiceNetOffModal.type";

/** Modal chọn hóa đơn để cấn trừ giao dịch tiền mặt; nhập số tiền cho từng hóa đơn đã chọn */
export function CashInvoiceNetOffModal({
  open,
  onClose,
  onSelect,
  direction,
  existingInvoiceIds,
  maxAvailableAmount,
}: CashInvoiceNetOffModalProps) {
  const { t } = useV2Translation();
  const picker = useCashInvoiceNetOffPicker({
    open,
    direction,
    existingInvoiceIds,
    maxAvailableAmount,
  });

  const columns: V2Column<NetOffInvoiceRow>[] = [
    {
      key: "invoiceNo",
      label: t("v2.cashNetOff.columns.invoiceNo", "Số hóa đơn"),
      size: 140,
      cell: (row) => (
        <V2Text as="span" className="font-mono text-xs">
          {row.invoiceNo || "—"}
        </V2Text>
      ),
    },
    {
      key: "partner",
      label: t("v2.cashNetOff.columns.partner", "Đối tượng"),
      size: 240,
      cell: (row) => (
        <V2Text as="span" className="text-xs">
          {row.partner || "—"}
        </V2Text>
      ),
    },
    {
      key: "invoiceDate",
      label: t("v2.cashNetOff.columns.invoiceDate", "Ngày"),
      size: 110,
      cell: (row) => (
        <V2Text as="span" className="font-mono text-xs">
          {formatDateTimeParts(row.invoiceDate)?.date ?? "—"}
        </V2Text>
      ),
    },
    {
      key: "total",
      label: t("v2.cashNetOff.columns.total", "Tổng tiền"),
      size: 130,
      align: TableColumnAlign.RIGHT,
      cell: (row) => (
        <V2Text as="span" className="text-xs tabular-nums">
          {formatAmount(row.total)}
        </V2Text>
      ),
    },
    {
      key: "remaining",
      label: t("v2.cashNetOff.columns.remaining", "Còn lại"),
      size: 130,
      align: TableColumnAlign.RIGHT,
      cell: (row) => (
        <V2Text as="span" className="text-xs tabular-nums">
          {formatAmount(row.remaining)}
        </V2Text>
      ),
    },
    {
      key: "netOff",
      label: t("v2.cashNetOff.columns.netOff", "Cấn trừ"),
      size: 150,
      cell: (row) =>
        picker.selectedKeys.includes(row.id) ? (
          <V2NumberInput
            aria-label={t("v2.cashNetOff.columns.netOff", "Cấn trừ")}
            value={picker.amounts[row.id] ?? null}
            min={0}
            max={row.remaining}
            onValueChange={(value) => picker.setAmount(row.id, value ?? 0)}
          />
        ) : (
          <V2Text as="span" className="text-xs text-muted-fg">
            —
          </V2Text>
        ),
    },
  ];

  const handleConfirm = () => {
    onSelect(picker.payload);
    onClose();
  };

  return (
    <V2LinkSelectionModal
      open={open}
      onClose={onClose}
      title={t("v2.cashNetOff.title", "Cấn trừ hóa đơn")}
      description={t(
        "v2.cashNetOff.description",
        "Chọn hóa đơn và nhập số tiền cấn trừ cho từng hóa đơn.",
      )}
      footerActions={
        <V2Button
          type="button"
          variant="default"
          disabled={!picker.canConfirm}
          onClick={handleConfirm}
        >
          {t("v2.cashNetOff.confirm", "Xác nhận cấn trừ")}
        </V2Button>
      }
    >
      <div className="space-y-3">
        <V2Text as="div" className="text-xs font-medium text-muted-fg">
          {t("v2.cashNetOff.summary", {
            total: formatAmount(picker.total),
            max: formatAmount(maxAvailableAmount),
          })}
        </V2Text>
        {picker.exceeds && (
          <V2AlertBanner>
            {t(
              "v2.cashNetOff.exceeds",
              "Tổng cấn trừ vượt số tiền còn lại của giao dịch",
            )}
          </V2AlertBanner>
        )}
        <V2StandardTable
          tableId="cash-invoice-netoff"
          columns={columns}
          items={picker.rows}
          getRowKey={(row) => row.id}
          mode="client"
          loading={picker.loading}
          emptyLabel={t(
            "v2.cashNetOff.empty",
            "Không có hóa đơn còn số dư để cấn trừ",
          )}
          enableRowSelection
          selectedKeys={picker.selectedKeys}
          onSelectionChange={picker.setSelectedKeys}
        />
      </div>
    </V2LinkSelectionModal>
  );
}
