import React from "react";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import {
  extractPhaiThuKhachHang,
  extractPhaiThuBaoHiem,
} from "../../../utils/garageCasesTable";
import { GarageCaseProgressCell } from "../../molecules/garage-case-progress-cell";
import type { ColumnContext } from "./GarageCasesTable.type";

const RECEIVABLE_CELL_BG = "bg-emerald-50/50 dark:bg-emerald-950/20";
const RECEIVABLE_HEADER_BG = "bg-emerald-100/60 dark:bg-emerald-900/30";

const PAYABLE_CELL_BG = "bg-amber-50/50 dark:bg-amber-950/20";
const PAYABLE_HEADER_BG = "bg-amber-100/60 dark:bg-amber-900/30";

export function buildProgressColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t } = ctx;
  const fmtMoneyOpt = (v: string) =>
    v === "__BLANK__" ? "(Trống / 0 đ)" : money(Number(v) || 0);

  const makeExtractorCol = (
    key: string,
    label: string,
    extractor: (item: any) => number,
  ) => ({
    key,
    label,
    header: makeHdr(key, label, {
      align: "right",
      showBlankOption: true,
      formatOptionLabel: fmtMoneyOpt,
    }),
    size: 140,
    headerClassName: RECEIVABLE_HEADER_BG,
    className: cn("text-right tabular-nums font-semibold", RECEIVABLE_CELL_BG),
    cell: (item: any) => {
      const val = extractor(item);
      return val > 0 ? money(val) : "—";
    },
  });

  return [
    {
      key: "collectionProgress",
      label: t("cases.columns.collectionProgress", "Tổng phải thu"),
      header: makeHdr(
        "collectionProgress",
        t("cases.columns.collectionProgress", "Tổng phải thu"),
        { align: "right", hideFilter: true },
      ),
      size: 155,
      headerClassName: RECEIVABLE_HEADER_BG,
      className: cn("text-right", RECEIVABLE_CELL_BG),
      cell: (item: any) => (
        <GarageCaseProgressCell
          type="receivable"
          total={Number(item.tienCoThue) || 0}
          paid={Number(item.tienDaThanhToan) || 0}
          balance={Number(item.tienConPhaiThanhToan) || 0}
        />
      ),
    },
    makeExtractorCol(
      "phaiThuKhachHang",
      t("cases.columns.receivableCustomer", "Phải thu KH"),
      extractPhaiThuKhachHang,
    ),
    makeExtractorCol(
      "phaiThuBaoHiem",
      t("cases.columns.receivableInsurance", "Phải thu BH"),
      extractPhaiThuBaoHiem,
    ),
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
      size: 140,
      headerClassName: RECEIVABLE_HEADER_BG,
      className: cn(
        "text-right tabular-nums font-semibold",
        RECEIVABLE_CELL_BG,
      ),
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
      size: 155,
      headerClassName: PAYABLE_HEADER_BG,
      className: cn("text-right", PAYABLE_CELL_BG),
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
      size: 140,
      headerClassName: PAYABLE_HEADER_BG,
      className: cn("text-right tabular-nums font-semibold", PAYABLE_CELL_BG),
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
