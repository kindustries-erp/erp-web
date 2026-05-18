import { KpiCard } from "@/shared/components/KpiCard";
import { Skeleton } from "@/shared/components/Skeleton";
import type { PartnerLedgerSummary } from "@/modules/finance/api/financeApi";
import { fmtAmt } from "./helpers";
import type { TFunc } from "./types";

interface PartnerLedgerKpisProps {
  summary: PartnerLedgerSummary | null;
  loading: boolean;
  t: TFunc;
}

export function PartnerLedgerKpis({
  summary,
  loading,
  t,
}: PartnerLedgerKpisProps) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[90px] rounded-xl" />
          ))
        ) : (
          <>
            <KpiCard
              label={t("ledger.kpi.open")}
              value={summary ? `₫ ${fmtAmt(summary.total_open)}` : "—"}
              icon={<span className="text-warn-fg text-xs font-bold">₫</span>}
              warn={!!summary && summary.total_overdue > 0}
            />
            <KpiCard
              label={t("ledger.kpi.overdue")}
              value={summary ? `₫ ${fmtAmt(summary.total_overdue)}` : "—"}
              icon={<span className="text-[#d92a2a] text-xs font-bold">!</span>}
              warn={!!summary && summary.total_overdue > 0}
            />
            <KpiCard
              label={t("ledger.kpi.settled")}
              value={summary ? `₫ ${fmtAmt(summary.total_settled)}` : "—"}
              icon={
                <span className="text-approve-fg text-xs font-bold">✓</span>
              }
            />
            <KpiCard
              label={t("ledger.kpi.total")}
              value={summary ? String(summary.total_count) : "—"}
              icon={
                <span className="text-[color:var(--muted-fg)] text-xs font-bold">
                  #
                </span>
              }
            />
          </>
        )}
      </div>

      {summary && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4 card-shadow">
          <div className="text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.06em] mb-3">
            {t("ledger.aging.title")}
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {(
              [
                ["ledger.aging.current", summary.buckets.current],
                ["ledger.aging.d1_30", summary.buckets.days_1_30],
                ["ledger.aging.d31_60", summary.buckets.days_31_60],
                ["ledger.aging.d61_90", summary.buckets.days_61_90],
                ["ledger.aging.d90p", summary.buckets.days_90_plus],
              ] as [string, number][]
            ).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="text-[10px] text-[color:var(--muted-fg)]">
                  {t(key as Parameters<typeof t>[0])}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  ₫ {fmtAmt(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
