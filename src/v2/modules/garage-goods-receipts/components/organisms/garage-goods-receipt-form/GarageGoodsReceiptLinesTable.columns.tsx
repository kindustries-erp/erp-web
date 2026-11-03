import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  V2Button,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components/atoms";
import type { GarageGoodsReceiptFormLine } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";

export interface LineColumnRenderContext {
  line: GarageGoodsReceiptFormLine;
  index: number;
  viewing: boolean;
  t: (key: string, fallback?: string) => string;
  onUpdate: (
    index: number,
    field: keyof GarageGoodsReceiptFormLine,
    val: string,
  ) => void;
  onRemove: (index: number) => void;
}

export interface GarageGoodsReceiptLineColumn {
  id: string;
  headerKey: string;
  defaultHeader: string;
  headerClassName?: string;
  cellClassName?: string;
  hideWhenViewing?: boolean;
  renderCell: (ctx: LineColumnRenderContext) => React.ReactNode;
}

export const GARAGE_GOODS_RECEIPT_LINES_COLUMNS: GarageGoodsReceiptLineColumn[] =
  [
    {
      id: "index",
      headerKey: "v2.table.indexHeader",
      defaultHeader: "#",
      headerClassName: "p-2 text-center w-10",
      cellClassName: "p-2 text-center text-xs",
      renderCell: (ctx) => (
        <V2Text className="font-mono text-muted-fg text-xs text-center">
          {ctx.index + 1}
        </V2Text>
      ),
    },
    {
      id: "itemCode",
      headerKey: "v2.garageGoodsReceipts.form.partCode",
      defaultHeader: "Mã PT",
      headerClassName: "p-2 text-left min-w-[120px]",
      cellClassName: "p-2 text-xs",
      renderCell: (ctx) =>
        ctx.viewing ? (
          <V2Text className="font-mono text-xs">
            {ctx.line.itemCode || "—"}
          </V2Text>
        ) : (
          <V2Input
            sizeVariant="xs"
            value={ctx.line.itemCode}
            onChange={(e) =>
              ctx.onUpdate(ctx.index, "itemCode", e.target.value)
            }
            placeholder={ctx.t(
              "v2.garageGoodsReceipts.form.itemCodePlaceholder",
              "Mã SKU...",
            )}
            className="font-mono"
          />
        ),
    },
    {
      id: "itemName",
      headerKey: "v2.garageGoodsReceipts.form.partName",
      defaultHeader: "Tên phụ tùng",
      headerClassName: "p-2 text-left min-w-[180px]",
      cellClassName: "p-2 text-xs",
      renderCell: (ctx) =>
        ctx.viewing ? (
          <V2Text className="font-medium text-xs">
            {ctx.line.itemName || "—"}
          </V2Text>
        ) : (
          <V2Input
            sizeVariant="xs"
            value={ctx.line.itemName}
            onChange={(e) =>
              ctx.onUpdate(ctx.index, "itemName", e.target.value)
            }
            placeholder={ctx.t(
              "v2.garageGoodsReceipts.form.itemNamePlaceholder",
              "Tên phụ tùng...",
            )}
          />
        ),
    },
    {
      id: "unit",
      headerKey: "v2.garageGoodsReceipts.form.unit",
      defaultHeader: "ĐVT",
      headerClassName: "p-2 text-center w-20",
      cellClassName: "p-2 text-center text-xs",
      renderCell: (ctx) =>
        ctx.viewing ? (
          <V2Text className="text-xs text-center">
            {ctx.line.unit || "Cái"}
          </V2Text>
        ) : (
          <V2Input
            sizeVariant="xs"
            value={ctx.line.unit}
            onChange={(e) => ctx.onUpdate(ctx.index, "unit", e.target.value)}
            className="w-16 text-center mx-auto"
          />
        ),
    },
    {
      id: "qtyReceived",
      headerKey: "v2.garageGoodsReceipts.form.qty",
      defaultHeader: "Số lượng",
      headerClassName: "p-2 text-right w-24",
      cellClassName: "p-2 text-right text-xs",
      renderCell: (ctx) =>
        ctx.viewing ? (
          <V2Text className="tabular-nums font-semibold text-xs text-right">
            {Number(ctx.line.qtyReceived || 0).toLocaleString("vi-VN")}
          </V2Text>
        ) : (
          <V2NumberInput
            sizeVariant="xs"
            min={0}
            decimals={0}
            value={Number(ctx.line.qtyReceived) || 0}
            onValueChange={(val) =>
              ctx.onUpdate(ctx.index, "qtyReceived", String(val ?? 0))
            }
            className="w-20 text-right tabular-nums font-semibold ml-auto"
          />
        ),
    },
    {
      id: "unitCost",
      headerKey: "v2.garageGoodsReceipts.form.cost",
      defaultHeader: "Đơn giá",
      headerClassName: "p-2 text-right w-32",
      cellClassName: "p-2 text-right text-xs",
      renderCell: (ctx) =>
        ctx.viewing ? (
          <V2Text className="tabular-nums text-xs text-right">
            {Number(ctx.line.unitCost || 0).toLocaleString("vi-VN")}
          </V2Text>
        ) : (
          <V2NumberInput
            sizeVariant="xs"
            min={0}
            decimals={0}
            value={Number(ctx.line.unitCost) || 0}
            onValueChange={(val) =>
              ctx.onUpdate(ctx.index, "unitCost", String(val ?? 0))
            }
            className="w-28 text-right tabular-nums ml-auto"
          />
        ),
    },
    {
      id: "amount",
      headerKey: "v2.garageGoodsReceipts.form.amount",
      defaultHeader: "Thành tiền",
      headerClassName: "p-2 text-right w-32",
      cellClassName: "p-2 text-right text-xs",
      renderCell: (ctx) => (
        <V2Text className="text-right font-semibold text-primary tabular-nums text-xs">
          {Number(ctx.line.amount || 0).toLocaleString("vi-VN")}
        </V2Text>
      ),
    },
    {
      id: "actions",
      headerKey: "",
      defaultHeader: "",
      headerClassName: "p-2 text-center w-10",
      cellClassName: "p-2 text-center text-xs",
      hideWhenViewing: true,
      renderCell: (ctx) => (
        <V2Button
          variant="ghost"
          size="icon-xs"
          onClick={() => ctx.onRemove(ctx.index)}
          aria-label={ctx.t("v2.common.remove", "Xóa")}
          className="h-7 w-7 text-muted-fg hover:text-destructive mx-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </V2Button>
      ),
    },
  ];
