import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  V2Button,
  V2Combobox,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import type { V2DrawerLinesColumn } from "@/v2/shared/components";
import { LineItemCodeInput } from "@/v2/shared/context/LineItemCodeFieldContext";
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

/** Kích thước và căn lề của cột, truyền thẳng cho V2DrawerLinesTable */
export type ProcurementLineLayout = Pick<
  V2DrawerLinesColumn,
  "width" | "grow" | "minWidth" | "align" | "wrap"
>;

export interface ProcurementLineColumn {
  id: string;
  headerKey: string;
  defaultHeader: string;
  layout: ProcurementLineLayout;
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
      layout: { width: 40, align: "center" },
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
      layout: { width: 112, align: "left" },
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
      layout: { width: 112, align: "left" },
      renderCell: ({ viewing, line, onPatch, t }) =>
        viewing ? (
          <V2Text className="font-mono text-xs">{line.itemCode || "—"}</V2Text>
        ) : (
          <LineItemCodeInput
            ariaLabel={t("v2.procurement.lines.code", "Mã")}
            className={cn("font-mono", V2_DRAWER_FOCUS_RING_CLASS)}
            value={line.itemCode}
            placeholder={t("v2.procurement.lines.codePlaceholder", "Mã...")}
            onPick={({ itemCode, itemName }) =>
              onPatch(
                itemName && !line.itemName.trim()
                  ? { itemCode, itemName }
                  : { itemCode },
              )
            }
          />
        ),
    },
    {
      id: "itemName",
      headerKey: "v2.procurement.lines.name",
      defaultHeader: "Tên",
      layout: { grow: true, minWidth: 180, align: "left", wrap: true },
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
      layout: { width: 96, align: "right" },
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
      layout: { width: 128, align: "right" },
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
      layout: { width: 150, align: "right" },
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
      layout: { width: 40, align: "center" },
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
