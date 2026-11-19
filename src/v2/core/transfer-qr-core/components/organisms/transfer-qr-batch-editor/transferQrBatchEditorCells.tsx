import * as React from "react";
import {
  V2Button,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components/atoms";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import type { V2DrawerLinesColumn } from "@/v2/shared/components/organisms/v2-drawer-lines-table";
import type { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { TransferQrBatchRowView } from "../../../domain/rules/batchRowView";
import {
  bankFieldsFromBin,
  type TransferQrBatchRow,
} from "../../../domain/rules/batchRows";
import { VIETQR_BANKS } from "../../../domain/constants/vietQrBanks";
import {
  MAX_VND_AMOUNT,
  sanitizeTransferContent,
} from "../../../domain/rules/vietQrPayload";

type Translate = ReturnType<typeof useV2Translation>["t"];

export interface BatchEditorCellHandlers {
  onPatch: (id: string, patch: Partial<Omit<TransferQrBatchRow, "id">>) => void;
  onRemove: (id: string) => void;
}

const BANK_OPTIONS = VIETQR_BANKS.map((bank) => ({
  value: bank.bin,
  label: `${bank.code} - ${bank.shortName}`,
}));

const invalid = (flag: boolean) => (flag ? "border-destructive" : undefined);

/** Nội dung một ô của bảng lệnh thanh toán. */
export function renderBatchEditorCell(
  column: V2DrawerLinesColumn,
  view: TransferQrBatchRowView,
  { onPatch, onRemove }: BatchEditorCellHandlers,
  t: Translate,
): React.ReactNode {
  const { row, errors } = view;
  const id = row.id;
  switch (column.id) {
    case "index":
      return view.index;
    case "bank":
      return (
        <V2Combobox
          options={BANK_OPTIONS}
          value={row.bin}
          onValueChange={(bin) => onPatch(id, bankFieldsFromBin(bin))}
          placeholder={t("v2.transferQr.placeholders.bank")}
          searchable
          className={invalid(!!errors.bin)}
        />
      );
    case "accountNumber":
      return (
        <V2Input
          value={row.accountNumber}
          onChange={(event) =>
            onPatch(id, { accountNumber: event.target.value })
          }
          placeholder={t("v2.transferQr.placeholders.accountNumber")}
          aria-label={t("v2.transferQr.fields.accountNumber")}
          className={invalid(!!errors.accountNumber)}
        />
      );
    case "accountName":
      return (
        <V2Input
          value={row.accountName}
          onChange={(event) => onPatch(id, { accountName: event.target.value })}
          placeholder={t("v2.transferQr.placeholders.accountName")}
          aria-label={t("v2.transferQr.fields.accountName")}
          className={invalid(!!errors.accountName)}
        />
      );
    case "amount":
      return (
        <V2NumberInput
          value={row.amount}
          max={MAX_VND_AMOUNT}
          onValueChange={(amount) =>
            onPatch(id, { amount, amountInvalid: false })
          }
          placeholder={t("v2.transferQr.placeholders.amount")}
          aria-label={t("v2.transferQr.fields.amount")}
          className={invalid(!!errors.amount)}
        />
      );
    case "content": {
      const contentOnQr = sanitizeTransferContent(row.content);
      return (
        <div className="flex flex-col gap-1">
          <V2Input
            value={row.content}
            onChange={(event) => onPatch(id, { content: event.target.value })}
            placeholder={t("v2.transferQr.placeholders.content")}
            aria-label={t("v2.transferQr.fields.content")}
          />
          {contentOnQr && contentOnQr !== row.content.trim() && (
            <V2Text variant="body-sm">
              {t("v2.transferQr.hints.contentOnQr")} {contentOnQr}
            </V2Text>
          )}
        </div>
      );
    }
    case "remove":
      return (
        <V2Button
          variant="ghost"
          onClick={() => onRemove(id)}
          aria-label={t("v2.transferQr.batch.removeRow")}
        >
          ×
        </V2Button>
      );
    default:
      return null;
  }
}
