import * as React from "react";
import { DrawerRow, DrawerSection } from "@/shared/components/DrawerModal";
import { V2Badge, V2Skeleton, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { CostingMethod, StockLedgerTotals } from "./stockLedgerCalculator";

export interface StockLedgerItemInfo {
  itemCode?: string;
  itemName?: string;
  unit?: string;
  avgCost?: number;
  qtyOnHand?: number;
  [key: string]: any;
}

export interface StockLedgerItemInfoPanelProps {
  item: StockLedgerItemInfo;
  totals: StockLedgerTotals;
  costingMethod: CostingMethod;
  isLoading?: boolean;
}

const num = (val: number) => Number(val ?? 0).toLocaleString("vi-VN");
const money = (val: number) =>
  val ? `${Number(val).toLocaleString("vi-VN")} ₫` : "0 ₫";

export function StockLedgerItemInfoPanel({
  item,
  totals,
  costingMethod,
  isLoading,
}: StockLedgerItemInfoPanelProps) {
  const { t } = useV2Translation();

  const currentUnitCost =
    totals.finalBalanceQty > 0
      ? totals.finalBalanceValue / totals.finalBalanceQty
      : (item.avgCost ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <DrawerSection
        title={t(
          "v2.inventoryMovements.ledger.itemInfoTitle",
          "Thông tin phụ tùng",
        )}
      >
        <div className="space-y-2.5">
          <DrawerRow
            label={t("v2.inventoryMovements.ledger.itemCode", "Mã phụ tùng")}
            value={
              <V2Text
                as="span"
                variant="body-sm"
                className="font-semibold font-mono"
              >
                {item.itemCode}
              </V2Text>
            }
          />
          <DrawerRow
            label={t("v2.inventoryMovements.ledger.unit", "Đơn vị tính")}
            value={
              <V2Text as="span" variant="body-sm">
                {item.unit || "—"}
              </V2Text>
            }
          />
          <DrawerRow
            label={t("v2.inventoryMovements.ledger.itemName", "Tên phụ tùng")}
            value={
              <V2Text as="span" variant="body-sm" className="font-medium">
                {item.itemName}
              </V2Text>
            }
          />
        </div>

        {/* 3 Thẻ KPI (Tổng Nhập, Tổng Xuất, Tồn Cuối) theo chuẩn VinFast */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {/* TỔNG NHẬP */}
          <div className="flex flex-col items-center justify-center p-2.5 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 rounded-md">
            <V2Text
              as="span"
              className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-400/80 uppercase tracking-wider mb-1"
            >
              {t("v2.inventoryMovements.ledger.totalIn", "Tổng Nhập")}
            </V2Text>
            {isLoading ? (
              <V2Skeleton className="h-5 w-12 my-0.5" />
            ) : (
              <V2Text
                as="span"
                className="font-bold text-amber-700 dark:text-amber-400 text-base tabular-nums"
              >
                {num(totals.totalInQty)}
              </V2Text>
            )}
          </div>

          {/* TỔNG XUẤT */}
          <div className="flex flex-col items-center justify-center p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 rounded-md">
            <V2Text
              as="span"
              className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1"
            >
              {t("v2.inventoryMovements.ledger.totalOut", "Tổng Xuất")}
            </V2Text>
            {isLoading ? (
              <V2Skeleton className="h-5 w-12 my-0.5" />
            ) : (
              <V2Text
                as="span"
                className="font-bold text-emerald-700 dark:text-emerald-400 text-base tabular-nums"
              >
                {num(totals.totalOutQty)}
              </V2Text>
            )}
          </div>

          {/* TỒN CUỐI */}
          <div className="flex flex-col items-center justify-center p-2.5 bg-slate-100/70 dark:bg-zinc-900/60 rounded-md border border-slate-200/80 dark:border-zinc-800">
            <V2Text
              as="span"
              className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1"
            >
              {t("v2.inventoryMovements.ledger.finalBalance", "Tồn Cuối")}
            </V2Text>
            {isLoading ? (
              <V2Skeleton className="h-5 w-12 my-0.5" />
            ) : (
              <V2Text
                as="span"
                className="font-bold text-foreground text-lg tabular-nums"
              >
                {num(totals.finalBalanceQty)}
              </V2Text>
            )}
          </div>
        </div>

        {/* Thông tin Giá trị kho & Phương pháp */}
        <div className="mt-4 pt-3.5 border-t border-border/40 space-y-2">
          <DrawerRow
            label={t(
              "v2.inventoryMovements.ledger.balanceValue",
              "Giá vốn tồn kho",
            )}
            value={
              isLoading ? (
                <V2Skeleton className="h-4 w-20 ml-auto" />
              ) : (
                <V2Text
                  as="span"
                  className="font-bold text-sm text-foreground tabular-nums"
                >
                  {money(totals.finalBalanceValue)}
                </V2Text>
              )
            }
          />
          <DrawerRow
            label={t(
              "v2.inventoryMovements.ledger.currentAvgCost",
              "Đơn giá vốn",
            )}
            value={
              isLoading ? (
                <V2Skeleton className="h-4 w-16 ml-auto" />
              ) : (
                <V2Text
                  as="span"
                  className="font-mono text-xs font-semibold tabular-nums text-muted-foreground"
                >
                  {money(currentUnitCost)}
                </V2Text>
              )
            }
          />
          <DrawerRow
            label={t("v2.inventoryMovements.ledger.method", "Phương pháp")}
            value={
              <V2Badge variant="outline" className="text-[10px] font-semibold">
                {costingMethod === "FIFO" ? "FIFO" : "Bình quân gia quyền"}
              </V2Badge>
            }
          />
        </div>
      </DrawerSection>
    </div>
  );
}
