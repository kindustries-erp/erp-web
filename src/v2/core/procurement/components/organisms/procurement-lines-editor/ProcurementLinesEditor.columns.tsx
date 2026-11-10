import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  V2Button,
  V2Combobox,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import { procurementLineNoteColumn } from "./ProcurementLinesEditor.columns.note";
import {
  procurementLineAmount,
  toNumberOrNull,
  type ProcurementLineFormValue,
} from "../../../form/procurementLine.form";

export interface ProcurementLineColumnContext {
  line: ProcurementLineFormValue;
  index: number;
  viewing: boolean;
  priceLabel: string;
  canRemove: boolean;
  typeOptions: { value: string; label: string }[];
  onPatch: (change: Partial<ProcurementLineFormValue>) => void;
  onRemove: () => void;
  t: (key: string, fallback?: string) => string;
}

export interface ProcurementLineColumn {
  id: string;
  headerKey: string;
  defaultHeader: string;
  headerClassName?: string;
  cellClassName?: string;
  hideWhenViewing?: boolean;
  renderCell: (ctx: ProcurementLineColumnContext) => React.ReactNode;
}

const fmtAmount = (amt: number | null) =>
  amt == null ? "—" : amt.toLocaleString("vi-VN", { maximumFractionDigits: 3 });

/** Định nghĩa danh sách cột chuẩn V2 cho bảng dòng chứng từ mua hàng (PR/PO). */
export function getProcurementLineColumns(
  priceLabel: string,
): ProcurementLineColumn[] {
  return [
    {
      id: "index",
      headerKey: "v2.table.indexHeader",
      defaultHeader: "#",
      headerClassName: "p-2 text-center w-10",
      cellClassName: "p-2 text-center text-xs",
      renderCell: ({ index }) => (
        <V2Text className="font-mono text-muted-fg text-xs text-center">
          {index + 1}
        </V2Text>
      ),
    },
    {
      id: "lineType",
      headerKey: "v2.procurement.lines.type",
      defaultHeader: "Loại",
      headerClassName: "p-2 text-left w-28",
      cellClassName: "p-2 text-xs w-28",
      renderCell: ({ viewing, typeOptions, line, onPatch, t }) =>
        viewing ? (
          <V2Text className="text-xs">
            {typeOptions.find((o) => o.value === line.lineType)?.label ??
              line.lineType}
          </V2Text>
        ) : (
          <V2Combobox
            aria-label={t("v2.procurement.lines.type", "Loại")}
            options={typeOptions}
            value={line.lineType}
            searchable={false}
            className={V2_DRAWER_FOCUS_RING_CLASS}
            onValueChange={(v) =>
              onPatch({
                lineType: v === "SERVICE" ? "SERVICE" : "GOODS",
              })
            }
          />
        ),
    },
    {
      id: "itemCode",
      headerKey: "v2.procurement.lines.code",
      defaultHeader: "Mã",
      headerClassName: "p-2 text-left w-24 min-w-[88px]",
      cellClassName: "p-2 text-xs w-24 min-w-[88px]",
      renderCell: ({ viewing, line, onPatch, t }) =>
        viewing ? (
          <V2Text className="font-mono text-xs">{line.itemCode || "—"}</V2Text>
        ) : (
          <V2Input
            sizeVariant="xs"
            aria-label={t("v2.procurement.lines.code", "Mã")}
            className={cn("font-mono", V2_DRAWER_FOCUS_RING_CLASS)}
            value={line.itemCode}
            placeholder={t("v2.procurement.lines.codePlaceholder", "Mã...")}
            onChange={(e) => onPatch({ itemCode: e.target.value })}
          />
        ),
    },
    {
      id: "itemName",
      headerKey: "v2.procurement.lines.name",
      defaultHeader: "Tên",
      headerClassName: "p-2 text-left min-w-[160px] w-[26%]",
      cellClassName: "p-2 text-xs min-w-[160px] w-[26%]",
      renderCell: ({ viewing, line, onPatch, t }) =>
        viewing ? (
          <V2Text className="font-medium text-xs">
            {line.itemName || "—"}
          </V2Text>
        ) : (
          <V2Input
            sizeVariant="xs"
            aria-label={t("v2.procurement.lines.name", "Tên")}
            className={V2_DRAWER_FOCUS_RING_CLASS}
            value={line.itemName}
            placeholder={t(
              "v2.procurement.lines.namePlaceholder",
              "Tên hàng...",
            )}
            onChange={(e) => onPatch({ itemName: e.target.value })}
          />
        ),
    },
    procurementLineNoteColumn,
    {
      id: "qty",
      headerKey: "v2.procurement.lines.qty",
      defaultHeader: "Số lượng",
      headerClassName: "p-2 text-right w-24",
      cellClassName: "p-2 text-right text-xs w-24",
      renderCell: ({ viewing, line, onPatch, t }) =>
        viewing ? (
          <V2Text className="tabular-nums font-semibold text-xs text-right">
            {line.qty
              ? Number(line.qty).toLocaleString("vi-VN", {
                  maximumFractionDigits: 3,
                })
              : "—"}
          </V2Text>
        ) : (
          <V2NumberInput
            sizeVariant="xs"
            aria-label={t("v2.procurement.lines.qty", "Số lượng")}
            className={cn(
              "w-20 text-right tabular-nums font-semibold ml-auto",
              V2_DRAWER_FOCUS_RING_CLASS,
            )}
            decimals={3}
            min={0}
            value={toNumberOrNull(line.qty)}
            onValueChange={(v) => onPatch({ qty: v === null ? "" : String(v) })}
          />
        ),
    },
    {
      id: "price",
      headerKey: "",
      defaultHeader: priceLabel,
      headerClassName: "p-2 text-right w-32",
      cellClassName: "p-2 text-right text-xs w-32",
      renderCell: ({ viewing, line, priceLabel: rowPriceLabel, onPatch }) =>
        viewing ? (
          <V2Text className="tabular-nums text-xs text-right">
            {line.price
              ? Number(line.price).toLocaleString("vi-VN", {
                  maximumFractionDigits: 3,
                })
              : "—"}
          </V2Text>
        ) : (
          <V2NumberInput
            sizeVariant="xs"
            aria-label={rowPriceLabel}
            className={cn(
              "w-28 text-right tabular-nums ml-auto",
              V2_DRAWER_FOCUS_RING_CLASS,
            )}
            decimals={3}
            min={0}
            value={toNumberOrNull(line.price)}
            onValueChange={(v) =>
              onPatch({ price: v === null ? "" : String(v) })
            }
          />
        ),
    },
    {
      id: "amount",
      headerKey: "v2.procurement.lines.amount",
      defaultHeader: "Thành tiền",
      headerClassName: "p-2 text-right w-40 min-w-[160px] whitespace-nowrap",
      cellClassName:
        "p-2 text-right text-xs w-40 min-w-[160px] whitespace-nowrap",
      renderCell: ({ line }) => (
        <V2Text className="text-right font-semibold text-primary tabular-nums text-xs whitespace-nowrap">
          {fmtAmount(procurementLineAmount(line))}
        </V2Text>
      ),
    },
    {
      id: "actions",
      headerKey: "",
      defaultHeader: "",
      headerClassName: "p-2 text-center w-10",
      cellClassName: "p-2 text-center text-xs w-10",
      hideWhenViewing: true,
      renderCell: ({ canRemove, onRemove, t }) => (
        <V2Button
          variant="ghost"
          size="icon-xs"
          className="h-7 w-7 text-muted-fg hover:text-destructive mx-auto"
          aria-label={t("v2.procurement.lines.remove", "Xóa dòng")}
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </V2Button>
      ),
    },
  ];
}
