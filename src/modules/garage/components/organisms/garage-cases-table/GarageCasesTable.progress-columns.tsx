import React from "react";
import { money } from "@/shared/utils/format";
import { GarageCaseProgressCell } from "../../molecules/garage-case-progress-cell";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildProgressColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t } = ctx;

  return [
    {
      key: "collectionProgress",
      label: t("cases.columns.collectionProgress", "Tổng phải thu"),
      header: makeHdr(
        "collectionProgress",
        t("cases.columns.collectionProgress", "Tổng phải thu"),
        { align: "right", hideFilter: true },
      ),
      size: 190,
      className: "text-right",
      cell: (item: any) => (
        <GarageCaseProgressCell
          type="receivable"
          total={Number(item.tienCoThue) || 0}
          paid={Number(item.tienDaThanhToan) || 0}
          balance={Number(item.tienConPhaiThanhToan) || 0}
        />
      ),
    },
    {
      key: "tienConPhaiThanhToan",
      label: t("cases.columns.balanceAmount", "Còn phải thu"),
      header: makeHdr(
        "tienConPhaiThanhToan",
        t("cases.columns.balanceAmount", "Còn phải thu"),
        {
          align: "right",
          formatOptionLabel: (v: string) => money(Number(v) || 0),
        },
      ),
      size: 160,
      className: "text-right tabular-nums font-semibold",
      cell: (item: any) => {
        const bal = Number(item.tienConPhaiThanhToan) || 0;
        return (
          <span
            className={
              bal === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }
          >
            {money(bal)}
          </span>
        );
      },
    },
    {
      key: "costProgress",
      label: t("cases.columns.costProgress", "Tổng phải trả"),
      header: makeHdr(
        "costProgress",
        t("cases.columns.costProgress", "Tổng phải trả"),
        { align: "right", hideFilter: true },
      ),
      size: 190,
      className: "text-right",
      cell: (item: any) => {
        const cost = Number(item.chiPhi ?? item.rawData?.ChiPhi ?? 0);
        const paidCost = Number(item.tienDaChi ?? item.rawData?.TienDaChi ?? 0);
        return (
          <GarageCaseProgressCell
            type="payable"
            total={cost}
            paid={paidCost}
            balance={Math.max(0, cost - paidCost)}
          />
        );
      },
    },
    {
      key: "tienConPhaiChi",
      label: t("cases.columns.remainingPayable", "Còn phải trả"),
      header: makeHdr(
        "tienConPhaiChi",
        t("cases.columns.remainingPayable", "Còn phải trả"),
        {
          align: "right",
          formatOptionLabel: (v: string) => money(Number(v) || 0),
        },
      ),
      size: 160,
      className: "text-right tabular-nums font-semibold",
      cell: (item: any) => {
        const cost = Number(item.chiPhi ?? item.rawData?.ChiPhi ?? 0);
        const paidCost = Number(item.tienDaChi ?? item.rawData?.TienDaChi ?? 0);
        const balCost = Math.max(0, cost - paidCost);
        return (
          <span
            className={
              balCost === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }
          >
            {money(balCost)}
          </span>
        );
      },
    },
  ];
}
