import { ShieldCheck, FileCheck, Link2 } from "lucide-react";
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
    size: 140,
    className: "text-right font-semibold tabular-nums",
    cell: (item: any) => (item[key] ? money(Number(item[key])) : "—"),
  });

  const revenueProfitCols = [
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
      size: 140,
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
  ];

  const flagCols = [
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
      size: 100,
      className: "text-center",
      cell: (item: any) => {
        const hasVat = Boolean(
          (item.rawData?.TienThueKH && Number(item.rawData.TienThueKH) > 0) ||
          (item.tienThueKh && Number(item.tienThueKh) > 0) ||
          item.rawData?.DaTaoHoaDonThue === true ||
          (item.rawData?.TienThue && Number(item.rawData.TienThue) > 0),
        );
        const outCount = Number(item.linkedInvoiceOutCount || 0);
        const inCount = Number(item.linkedInvoiceInCount || 0);
        const totalLinked = Number(
          item.linkedInvoiceCount || outCount + inCount || 0,
        );
        const targetId = item.soChungTu || item.id;

        if (!hasVat && totalLinked === 0) {
          return (
            <span className="text-muted-foreground/30 select-none font-normal">
              —
            </span>
          );
        }

        return (
          <div className="w-full flex items-center justify-center gap-1.5">
            {hasVat && (
              <Tooltip
                content={t(
                  "cases.columns.hasInvoiceTooltip",
                  "Có xuất hóa đơn VAT",
                )}
              >
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-primary transition-colors shrink-0" />
              </Tooltip>
            )}
            {totalLinked > 0 && (
              <Tooltip
                content={
                  outCount > 0 && inCount > 0
                    ? `${outCount} HĐ bán ra (doanh thu), ${inCount} HĐ mua vào (chi phí)`
                    : outCount > 0
                      ? `${outCount} HĐ bán ra (doanh thu)`
                      : inCount > 0
                        ? `${inCount} HĐ mua vào (chi phí)`
                        : t("cases.filter.hasLinked", "Đã liên kết HĐ")
                }
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ctx.onOpenFinancials?.(targetId);
                  }}
                  className="inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity p-0.5 cursor-pointer shrink-0"
                  aria-label={t("cases.filter.hasLinked", "Đã liên kết HĐ")}
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  const progressCols = buildProgressColumns(ctx, makeHdr);
  const isOverview =
    !ctx.activeColumnPresetKey || ctx.activeColumnPresetKey === "overview";
  return isOverview
    ? [...revenueProfitCols, ...progressCols, ...flagCols]
    : [...progressCols, ...revenueProfitCols, ...flagCols];
}
