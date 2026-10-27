import React from "react";
import { V2NumberInput } from "@/v2/shared/components/atoms/v2-number-input";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import type { TranslateFn } from "@/v2/shared/components/organisms/v2-document-traceability/types/traceability.flow.type";
import { grossAmount, remainingOf, toAmount } from "./bankNetOff.helper";
import type { V2BankNetOffPickerState } from "./useV2BankNetOffPicker";
import { formatLinkDate } from "./invoice-link-selection.format";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

/** Cột của bảng sao kê cấn trừ; cột số tiền cấn trừ hiện ô nhập khi dòng đã được chọn */
export function buildBankNetOffColumns(
  t: TranslateFn,
  picker: V2BankNetOffPickerState,
): V2Column<BankTransactionLinkDto>[] {
  return [
    {
      key: "transDate",
      label: t("v2.invoiceLinkSelection.bank.col.date"),
      size: 110,
      cell: (row) => (
        <V2Text as="span" className="font-mono text-xs">
          {formatLinkDate(row.transDate)}
        </V2Text>
      ),
    },
    {
      key: "referenceNumber",
      label: t("v2.invoiceLinkSelection.bank.col.reference"),
      size: 160,
      cell: (row) => (
        <V2Text as="span" className="font-mono text-xs">
          {row.referenceNumber || "—"}
        </V2Text>
      ),
    },
    {
      key: "correspondentName",
      label: t("v2.invoiceLinkSelection.bank.col.partner"),
      size: 240,
      cell: (row) => (
        <V2Text as="span" className="text-xs">
          {row.correspondentName || "—"}
        </V2Text>
      ),
    },
    {
      key: "gross",
      label: t("v2.invoiceLinkSelection.bank.col.gross"),
      size: 130,
      cell: (row) => (
        <V2Text as="span" className="font-mono text-xs">
          {formatAmount(grossAmount(row))}
        </V2Text>
      ),
    },
    {
      key: "remaining",
      label: t("v2.invoiceLinkSelection.bank.col.remaining"),
      size: 130,
      cell: (row) => (
        <V2Text as="span" className="font-mono text-xs">
          {formatAmount(remainingOf(row))}
        </V2Text>
      ),
    },
    {
      key: "suggest",
      label: t("v2.invoiceLinkSelection.bank.col.suggest"),
      size: 120,
      cell: (row) => {
        const badge = picker.suggestionBadge(row.id);
        return badge ? (
          <V2Text as="span" className="text-xs font-medium text-primary">
            {t(`v2.invoiceLinkSelection.bank.suggest.badge.${badge}`)}
          </V2Text>
        ) : (
          <V2Text as="span" className="text-xs text-muted-fg">
            —
          </V2Text>
        );
      },
    },
    {
      key: "netOff",
      label: t("v2.invoiceLinkSelection.bank.col.netOff"),
      size: 170,
      cell: (row) => {
        if (picker.isLinked(row.id)) {
          return (
            <V2Text as="span" className="text-xs text-muted-fg">
              {t("v2.invoiceLinkSelection.picker.linked")}
            </V2Text>
          );
        }
        const current = picker.selected[row.id];
        if (!current)
          return (
            <V2Text as="span" className="text-xs text-muted-fg">
              —
            </V2Text>
          );
        return (
          <V2NumberInput
            value={current.amount}
            min={0}
            max={remainingOf(row)}
            decimals={0}
            onValueChange={(value) => picker.setAmount(row.id, toAmount(value))}
          />
        );
      },
    },
  ];
}
