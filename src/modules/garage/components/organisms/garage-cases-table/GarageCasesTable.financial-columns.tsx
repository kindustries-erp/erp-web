import React from "react";
import { ShieldCheck, FileCheck } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { buildProgressColumns } from "./GarageCasesTable.progress-columns";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildFinancialColumns(
  ctx: ColumnContext,
  makeHdr: (key: string, title: string, opts?: any) => React.ReactNode,
) {
  const { t } = ctx;
  const fmtMoneyOpt = (v: string) =>
    v === "__BLANK__" ? "(Trống / 0 đ)" : money(Number(v) || 0);

  const makeMoneyCol = (key: string, label: string) => ({
    key,
    label,
    header: makeHdr(key, label, {
      align: "right",
      showBlankOption: true,
      formatOptionLabel: fmtMoneyOpt,
    }),
    size: 160,
    className: "text-right font-semibold tabular-nums",
    cell: (item: any) => (item[key] ? money(Number(item[key])) : "—"),
  });

  return [
    makeMoneyCol("doanhThu", t("cases.columns.doanhThu", "Doanh thu")),
    makeMoneyCol("chiPhi", t("cases.columns.chiPhi", "Chi phí")),
    {
      key: "loiNhuan",
      label: t("cases.columns.loiNhuan", "Lợi nhuận"),
      header: makeHdr("loiNhuan", t("cases.columns.loiNhuan", "Lợi nhuận"), {
        align: "right",
        showBlankOption: true,
        formatOptionLabel: fmtMoneyOpt,
      }),
      size: 160,
      className: "text-right font-semibold tabular-nums",
      cell: (item: any) => {
        const val = Number(item.loiNhuan) || 0;
        return (
          <span
            className={
              val >= 0
                ? "text-emerald-600 font-semibold"
                : "text-rose-600 font-semibold"
            }
          >
            {money(val)}
          </span>
        );
      },
    },
    {
      key: "margin",
      label: t("cases.columns.margin", "Biên LN"),
      header: makeHdr("margin", t("cases.columns.margin", "Biên LN"), {
        align: "right",
      }),
      size: 110,
      className: "text-right tabular-nums",
      cell: (item: any) => {
        const m = Number(item.margin) || 0;
        return <span>{m > 0 ? `+${m.toFixed(1)}%` : `${m.toFixed(1)}%`}</span>;
      },
    },
    ...buildProgressColumns(ctx, makeHdr),
    {
      key: "isInsuranceClaim",
      label: t("cases.columns.insurance", "BH"),
      header: makeHdr("isInsuranceClaim", t("cases.columns.insurance", "BH"), {
        align: "center",
      }),
      size: 80,
      className: "text-center",
      cell: (item: any) =>
        item.rawData?.XeLamBaoHiem ? (
          <div className="w-full flex justify-center">
            <Tooltip content={t("cases.drawer.insuranceClaim", "Làm bảo hiểm")}>
              <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" />
            </Tooltip>
          </div>
        ) : (
          <span className="text-muted-foreground/30 select-none font-normal">
            —
          </span>
        ),
    },
    {
      key: "hasInvoice",
      label: t("cases.columns.vatInvoice", "HĐ VAT"),
      header: makeHdr("hasInvoice", t("cases.columns.vatInvoice", "HĐ VAT"), {
        align: "center",
      }),
      size: 90,
      className: "text-center",
      cell: (item: any) => {
        const hasVat = Boolean(
          (item.rawData?.TienThueKH && Number(item.rawData.TienThueKH) > 0) ||
          (item.tienThueKh && Number(item.tienThueKh) > 0) ||
          item.rawData?.DaTaoHoaDonThue === true ||
          (item.rawData?.TienThue && Number(item.rawData.TienThue) > 0),
        );
        return hasVat ? (
          <div className="w-full flex justify-center">
            <Tooltip
              content={t(
                "cases.columns.hasInvoiceTooltip",
                "Có xuất hóa đơn VAT",
              )}
            >
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-primary transition-colors" />
            </Tooltip>
          </div>
        ) : (
          <span className="text-muted-foreground/30 select-none font-normal">
            —
          </span>
        );
      },
    },
  ];
}
