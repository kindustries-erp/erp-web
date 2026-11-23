import { Trash2 } from "lucide-react";
import {
  V2Button,
  V2Input,
  V2NumberInput,
  V2Text,
} from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import type { LineCellContext } from "./PurchaseOrderLinesTable.type";

const formatMoney = (value: unknown) =>
  Number(value || 0).toLocaleString("vi-VN");

export const renderIndexCell = (ctx: LineCellContext) => (
  <V2Text className="font-mono text-muted-fg text-xs text-center">
    {ctx.index + 1}
  </V2Text>
);

export const renderItemCodeCell = (ctx: LineCellContext) =>
  ctx.viewing ? (
    <V2Text className="font-mono text-xs">{ctx.line.itemCode || "—"}</V2Text>
  ) : (
    <V2Input
      sizeVariant="xs"
      value={ctx.line.itemCode}
      onChange={(e) => ctx.onUpdate(ctx.index, "itemCode", e.target.value)}
      placeholder={ctx.t(
        "v2.purchaseOrders.lines.itemCodePlaceholder",
        "Mã hàng...",
      )}
      className={cn("font-mono", V2_DRAWER_FOCUS_RING_CLASS)}
    />
  );

export const renderItemNameCell = (ctx: LineCellContext) =>
  ctx.viewing ? (
    <V2Text className="font-medium text-xs">{ctx.line.itemName || "—"}</V2Text>
  ) : (
    <V2Input
      sizeVariant="xs"
      value={ctx.line.itemName}
      onChange={(e) => ctx.onUpdate(ctx.index, "itemName", e.target.value)}
      placeholder={ctx.t(
        "v2.purchaseOrders.lines.itemNamePlaceholder",
        "Tên hàng...",
      )}
      className={V2_DRAWER_FOCUS_RING_CLASS}
    />
  );

export const renderDescriptionCell = (ctx: LineCellContext) =>
  ctx.viewing ? (
    <V2Text className="text-xs text-muted-fg">
      {ctx.line.description || "—"}
    </V2Text>
  ) : (
    <V2Input
      sizeVariant="xs"
      value={ctx.line.description}
      onChange={(e) => ctx.onUpdate(ctx.index, "description", e.target.value)}
      placeholder={ctx.t(
        "v2.purchaseOrders.lines.descriptionPlaceholder",
        "Mô tả...",
      )}
      className={V2_DRAWER_FOCUS_RING_CLASS}
    />
  );

export const renderQtyOrderedCell = (ctx: LineCellContext) =>
  ctx.viewing ? (
    <V2Text className="tabular-nums font-semibold text-xs text-right">
      {formatMoney(ctx.line.qtyOrdered)}
    </V2Text>
  ) : (
    <V2NumberInput
      sizeVariant="xs"
      // Không cho giảm dưới số đã nhận; API cũng chặn lỗi này
      min={Number(ctx.line.qtyReceived) || 0}
      decimals={0}
      value={Number(ctx.line.qtyOrdered) || 0}
      onValueChange={(val) =>
        ctx.onUpdate(ctx.index, "qtyOrdered", String(val ?? 0))
      }
      className={cn(
        "w-20 text-right tabular-nums font-semibold ml-auto",
        V2_DRAWER_FOCUS_RING_CLASS,
      )}
    />
  );

export const renderQtyReceivedCell = (ctx: LineCellContext) => (
  <V2Text className="tabular-nums text-xs text-right text-muted-fg">
    {formatMoney(ctx.line.qtyReceived)}
  </V2Text>
);

export const renderUnitPriceCell = (ctx: LineCellContext) =>
  ctx.viewing ? (
    <V2Text className="tabular-nums text-xs text-right">
      {formatMoney(ctx.line.unitPrice)}
    </V2Text>
  ) : (
    <V2NumberInput
      sizeVariant="xs"
      min={0}
      decimals={0}
      value={Number(ctx.line.unitPrice) || 0}
      onValueChange={(val) =>
        ctx.onUpdate(ctx.index, "unitPrice", String(val ?? 0))
      }
      className={cn(
        "w-28 text-right tabular-nums ml-auto",
        V2_DRAWER_FOCUS_RING_CLASS,
      )}
    />
  );

export const renderAmountCell = (ctx: LineCellContext) => (
  <V2Text className="text-right font-semibold text-primary tabular-nums text-xs">
    {formatMoney(ctx.line.amount)}
  </V2Text>
);

export const renderRemoveCell = (ctx: LineCellContext) => (
  <V2Button
    variant="ghost"
    size="icon-xs"
    onClick={() => ctx.onRemove(ctx.index)}
    aria-label={ctx.t("v2.common.remove", "Xóa")}
    className="h-7 w-7 text-muted-fg hover:text-destructive mx-auto"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </V2Button>
);
