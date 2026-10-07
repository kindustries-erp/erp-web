import React from "react";
import { money } from "@/shared/utils/format";
import {
  extractPhaiThuKhachHang,
  extractPhaiThuBaoHiem,
} from "../../../utils/garageCasesTable";
import { GarageCaseProgressCell } from "../../molecules/garage-case-progress-cell";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildProgressColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t } = ctx;
  const fmtMoneyOpt = (v: string) =>
    v === "__BLANK__" ? "(Trống / 0 đ)" : money(Number(v) || 0);

  return [
    {
      key: "collectionProgress",
      label: t("cases.columns.collectionProgress", "Tổng phải thu"),
      header: makeHdr(
        "collectionProgress",
        t("cases.columns.collectionProgress", "Tổng phải thu"),
        { align: "right", hideFilter: true },
      ),
      size: 140,
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
      key: "phaiThuKhachHang",
      label: t("cases.columns.receivableCustomer", "Phải thu KH"),
      header: makeHdr(
        "phaiThuKhachHang",
        t("cases.columns.receivableCustomer", "Phải thu KH"),
        {
          align: "right",
          showBlankOption: true,
          formatOptionLabel: fmtMoneyOpt,
        },
      ),
      size: 140,
      className: "text-right tabular-nums font-semibold",
      cell: (item: any) => {
        const val = extractPhaiThuKhachHang(item);
        return val > 0 ? money(val) : "—";
      },
    },
    {
      key: "phaiThuBaoHiem",
      label: t("cases.columns.receivableInsurance", "Phải thu BH"),
      header: makeHdr(
        "phaiThuBaoHiem",
        t("cases.columns.receivableInsurance", "Phải thu BH"),
        {
          align: "right",
          showBlankOption: true,
          formatOptionLabel: fmtMoneyOpt,
        },
      ),
      size: 140,
      className: "text-right tabular-nums font-semibold",
      cell: (item: any) => {
        const val = extractPhaiThuBaoHiem(item);
        return val > 0 ? money(val) : "—";
      },
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
      size: 140,
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
      size: 140,
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
      size: 140,
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
