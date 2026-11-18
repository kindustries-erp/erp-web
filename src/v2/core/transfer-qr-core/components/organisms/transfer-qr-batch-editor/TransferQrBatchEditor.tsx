import * as React from "react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import {
  V2DrawerLinesTable,
  type V2DrawerLinesColumn,
} from "@/v2/shared/components/organisms/v2-drawer-lines-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { TransferQrBatchRowView } from "../../../domain/rules/batchRowView";
import type { TransferQrBatchRow } from "../../../domain/rules/batchRows";
import { renderBatchEditorCell } from "./transferQrBatchEditorCells";

export interface TransferQrBatchEditorProps {
  views: readonly TransferQrBatchRowView[];
  canAddRow: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onPatch: (id: string, patch: Partial<Omit<TransferQrBatchRow, "id">>) => void;
  onClear: () => void;
}

/** Bảng các lệnh thanh toán: mỗi dòng là một mã QR. */
export function TransferQrBatchEditor({
  views,
  canAddRow,
  onAdd,
  onRemove,
  onPatch,
  onClear,
}: TransferQrBatchEditorProps) {
  const { t } = useV2Translation();
  const columns: V2DrawerLinesColumn[] = [
    { id: "index", header: "#", width: 40, align: "center" },
    {
      id: "bank",
      header: t("v2.transferQr.batch.columns.bank"),
      width: 180,
    },
    {
      id: "accountNumber",
      header: t("v2.transferQr.batch.columns.accountNumber"),
      width: 140,
    },
    {
      id: "accountName",
      header: t("v2.transferQr.batch.columns.accountName"),
      grow: true,
      minWidth: 160,
    },
    {
      id: "amount",
      header: t("v2.transferQr.batch.columns.amount"),
      width: 140,
      align: "right",
    },
    {
      id: "content",
      header: t("v2.transferQr.batch.columns.content"),
      grow: true,
      minWidth: 180,
    },
    { id: "remove", header: "", width: 44, align: "center" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <V2Text variant="body-sm">{t("v2.transferQr.batch.tableHint")}</V2Text>
        <div className="flex gap-2">
          <V2Button variant="outline" onClick={onAdd} disabled={!canAddRow}>
            {t("v2.transferQr.batch.addRow")}
          </V2Button>
          <V2Button
            variant="ghost"
            onClick={onClear}
            disabled={views.length === 0}
          >
            {t("v2.transferQr.batch.clearRows")}
          </V2Button>
        </div>
      </div>
      <V2DrawerLinesTable<TransferQrBatchRowView>
        ariaLabel={t("v2.transferQr.batch.tableLabel")}
        columns={columns}
        rows={[...views]}
        getRowKey={(view) => view.row.id}
        renderCell={(column, view) =>
          renderBatchEditorCell(column, view, { onPatch, onRemove }, t)
        }
        emptyLabel={t("v2.transferQr.batch.emptyRows")}
        maxHeight="50vh"
      />
    </div>
  );
}
