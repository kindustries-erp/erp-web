import React from "react";
import {
  Building2,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import type { TimeHorizonTopPartnerItem } from "../types";

export interface TimeHorizonTopPartnersTableProps {
  partners: TimeHorizonTopPartnerItem[];
  direction: "IN" | "OUT";
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
  isLoading?: boolean;
  t: any;
}

export function TimeHorizonTopPartnersTable({
  partners,
  direction,
  onOpenPartnerDetail,
  isLoading,
  t,
}: TimeHorizonTopPartnersTableProps) {
  const isReceivable = direction === "OUT";
  const totalTopShare = Number(
    partners.reduce((sum, p) => sum + (p.sharePercentage || 0), 0).toFixed(1),
  );
  const totalContributing = partners.reduce(
    (sum, p) => sum + (p.contributingAmount ?? p.balanceAmount ?? 0),
    0,
  );
  const totalInvoices = partners.reduce(
    (sum, p) => sum + (p.invoiceCount || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
        {t("common:loading", "Đang tải dữ liệu đối tác...")}
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground italic">
        {t(
          "debts:horizonDrawer.emptyTopPartners",
          "Không tìm thấy đối tác chi phối nào trong nhóm này",
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {/* ── Concentration Summary Bar ── */}
      <div
        className={cn(
          "p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3",
          totalTopShare >= 50
            ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
            : "bg-muted/40 border-border/70 text-foreground",
        )}
      >
        <div className="flex items-center gap-2">
          {totalTopShare >= 50 ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold text-xs">
            {t("debts:horizonDrawer.topPartnersConcentrationAlert", {
              count: partners.length,
              percent: totalTopShare,
              defaultValue: `Top ${partners.length} đối tác chi phối ${totalTopShare}% dòng tiền`,
            })}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-muted-foreground font-sans mr-1.5">
              {t(
                "debts:horizonDrawer.topPartnersTotalContributing",
                "Tổng giá trị",
              )}
              :
            </span>
            <span
              className={cn(
                "font-bold",
                isReceivable
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400",
              )}
            >
              {money(totalContributing)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground font-sans mr-1.5">
              {t("debts:horizonDrawer.topPartnersInvoiceCount", "Tổng HĐ")}:
            </span>
            <span className="font-bold text-foreground">{totalInvoices}</span>
          </div>
        </div>
      </div>

      {/* ── Top Partners Table ── */}
      <div className="border border-border/80 rounded-xl overflow-hidden bg-card/60 shadow-sm">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] min-h-[360px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border/70 sticky top-0 z-10 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">
                  {t("debts:horizonDrawer.colPartner", "Đối tác")}
                </th>
                <th className="py-2.5 px-3 w-24 text-center">
                  {t("debts:columns.invoiceCount", "SL HĐ")}
                </th>
                <th className="py-2.5 px-3 w-28 text-center">
                  {t("debts:columns.partnerAvgLagDays", "Độ trễ TB")}
                </th>
                <th className="py-2.5 px-3 w-36 text-center">
                  {t("debts:horizonDrawer.colCycleStatus", "Chu kỳ")}
                </th>
                <th className="py-2.5 px-3 w-36 text-right">
                  {t(
                    "debts:horizonDrawer.colContributingAmount",
                    "Số tiền chi phối",
                  )}
                </th>
                <th className="py-2.5 px-3 w-32 text-right">
                  {t("debts:horizonDrawer.colShare", "Tỷ trọng")}
                </th>
                <th className="py-2.5 px-3 w-14 text-center">
                  {t("debts:horizonDrawer.colActions", "Xem")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {partners.map((p, idx) => {
                const displayAmount =
                  p.contributingAmount ?? p.balanceAmount ?? 0;
                const share = p.sharePercentage ?? 0;

                return (
                  <tr
                    key={p.taxCode + idx}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 px-3 text-center font-mono text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div
                        onClick={() =>
                          onOpenPartnerDetail?.(p.taxCode, p.partnerName)
                        }
                        className="cursor-pointer group/link inline-flex flex-col"
                      >
                        <div className="font-semibold text-foreground group-hover/link:text-primary transition-colors flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground group-hover/link:text-primary shrink-0" />
                          <span>{p.partnerName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 text-primary transition-opacity" />
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {p.taxCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-medium">
                      {p.invoiceCount}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-muted-foreground">
                      {p.avgLagDays !== undefined
                        ? `${p.avgLagDays} ${t("debts:horizonDrawer.daysUnit", "ngày")}`
                        : "-"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {p.isOverdueLag ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                        >
                          Trôi: {money(p.overdueCarriedAmount || 0)}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                        >
                          {t(
                            "debts:horizonDrawer.normalLagBadge",
                            "Đúng chu kỳ",
                          )}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          isReceivable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        }
                      >
                        {money(displayAmount)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="space-y-1">
                        <div className="font-mono font-semibold text-[11px] text-right">
                          {share}%
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isReceivable ? "bg-emerald-500" : "bg-amber-500",
                            )}
                            style={{ width: `${Math.min(100, share)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPartnerDetail?.(p.taxCode, p.partnerName)
                        }
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title={t(
                          "debts:horizonDrawer.openPartnerDetail",
                          "Xem chi tiết đối tác",
                        )}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
