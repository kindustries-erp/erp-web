import { BarChart3 } from "lucide-react";
import { KpiCard, KpiBadge } from "@/shared/components/KpiCard";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useAppStore } from "@/core/config/appStore";
import { useT, useDict } from "@/core/i18n";
import { useEffect } from "react";
import { PageHeader } from "@/shared/components/PageHeader";

export function DongTien() {
  const { setCustomBreadcrumbs, navigate } = useAppStore();
  const t = useT();
  const dict = useDict();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["breadcrumb.cashflow"],
      ["breadcrumb.cashflowOverview"],
    ]);
  }, [setCustomBreadcrumbs]);

  const barIn = "#e8e8e4";
  const barOut = "#1a1a1a";
  const CHART_ITEMS_THU = [
    { label: t("dongtien.donut.sales"), value: 52, color: "#378add" },
    { label: t("dongtien.donut.untDebt"), value: 28, color: "#1a1a1a" },
    { label: t("dongtien.donut.other"), value: 20, color: "#b4b2a9" },
  ];
  const CHART_ITEMS_CHI = [
    { label: t("dongtien.donut.uncSupplier"), value: 44, color: "#e24b4a" },
    { label: t("dongtien.donut.uncSalary"), value: 32, color: "#ef9f27" },
    { label: t("dongtien.donut.expense"), value: 24, color: "#b4b2a9" },
  ];
  const SUMMARY_ROWS = [
    {
      label: t("dongtien.summary.rows.cash"),
      open: "₫ 13.7B",
      in: "+₫ 2.1B",
      out: "-₫ 1.5B",
      close: "₫ 14.3B",
      page: "cash-fund" as const,
      bold: false,
    },
    {
      label: t("dongtien.summary.rows.vcb"),
      open: "₫ 16.2B",
      in: "+₫ 2.4B",
      out: "-₫ 1.6B",
      close: "₫ 17.0B",
      page: "bank-deposit" as const,
      bold: false,
    },
    {
      label: t("dongtien.summary.rows.tcb"),
      open: "₫ 5.8B",
      in: "+₫ 0.8B",
      out: "-₫ 0.6B",
      close: "₫ 6.0B",
      page: undefined,
      bold: false,
    },
    {
      label: t("dongtien.summary.rows.total"),
      open: "₫ 35.7B",
      in: "+₫ 5.3B",
      out: "-₫ 3.7B",
      close: "₫ 37.3B",
      page: undefined,
      bold: true,
    },
  ];

  return (
    <div className="p-4 max-[500px]:p-3">
      <PageHeader
        title={t("dongtien.title")}
        desc={t("dongtien.desc")}
        icon={<BarChart3 className="h-4 w-4" />}
        actions={
          <BtnPrimary>
            <IconDownload /> {t("common.export")}
          </BtnPrimary>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 mb-4 mt-4">
        <KpiCard
          label={t("dongtien.kpi.totalBalance")}
          value="₫ 40.6B"
          sub={t("dongtien.kpi.totalBalanceSub")}
          icon={<IconCard />}
        />
        <KpiCard
          label={t("dongtien.kpi.income")}
          value="₫ 5.3B"
          icon={<IconUp />}
          badge={<KpiBadge variant="up">↑ 2.8%</KpiBadge>}
        />
        <KpiCard
          label={t("dongtien.kpi.expense")}
          value="₫ 3.7B"
          icon={<IconDown />}
          badge={<KpiBadge variant="down">↓ -1.2%</KpiBadge>}
        />
        <KpiCard
          label={t("dongtien.kpi.net")}
          value="₫ 1.6B"
          icon={<IconUpGreen />}
          badge={<KpiBadge variant="up">+18.2%</KpiBadge>}
        />
      </div>

      {/* Channel cards */}
      <div className="text-xs font-medium text-[color:var(--muted-fg)] mb-[6px]">
        {t("dongtien.sources")}
      </div>
      <div className="grid grid-cols-3 max-[700px]:grid-cols-2 max-[420px]:grid-cols-1 gap-[10px] mb-4">
        <ChannelCard
          title={t("dongtien.channels.cash")}
          balance="₫ 15.8B"
          badge={<KpiBadge variant="up">↑ 2.2%</KpiBadge>}
          onClick={() => navigate("cash-fund")}
        />
        <ChannelCard
          title={t("dongtien.channels.vcb")}
          balance="₫ 18.4B"
          badge={<KpiBadge variant="up">↑ 4.1%</KpiBadge>}
          onClick={() => navigate("bank-deposit")}
        />
        <ChannelCard
          title={t("dongtien.channels.tcb")}
          balance="₫ 6.4B"
          badge={<KpiBadge variant="down">↓ -0.8%</KpiBadge>}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 min-[700px]:grid-cols-[2fr_1fr_1fr] gap-3 mb-4">
        <Panel title={t("dongtien.chart.trend")}>
          <div className="relative h-[180px]">
            <BarChart
              labels={["T1", "T2", "T3", "T4", "T5", "T6"]}
              datasets={[
                {
                  data: [18, 22, 26, 30, 27, 34],
                  color: barIn,
                  label: t("dongtien.chart.income"),
                },
                {
                  data: [14, 17, 20, 22, 18, 25],
                  color: barOut,
                  label: t("dongtien.chart.expense"),
                },
              ]}
            />
          </div>
          <div className="flex gap-4 mt-[10px]">
            <LegendItem color={barIn} label={t("dongtien.chart.income")} />
            <LegendItem color={barOut} label={t("dongtien.chart.expense")} />
          </div>
        </Panel>
        <Panel title={t("dongtien.chart.incomeStructure")}>
          <div className="relative h-[120px]">
            <DonutChart items={CHART_ITEMS_THU} cutout="60%" />
          </div>
          <DonutLegend items={CHART_ITEMS_THU} />
        </Panel>
        <Panel title={t("dongtien.chart.expenseStructure")}>
          <div className="relative h-[120px]">
            <DonutChart items={CHART_ITEMS_CHI} cutout="60%" />
          </div>
          <DonutLegend items={CHART_ITEMS_CHI} />
        </Panel>
      </div>

      {/* Summary table */}
      <Panel title={t("dongtien.summary.title")}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                {dict.dongtien.summary.headers.map((h, i) => (
                  <th
                    key={h}
                    className={`text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[6px] border-b border-border uppercase tracking-[0.05em] ${i > 0 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUMMARY_ROWS.map((r) => (
                <tr
                  key={r.label}
                  className={`${r.page ? "cursor-pointer hover:[&>td]:bg-[color:var(--muted)]" : ""} ${r.bold ? "bg-[color:var(--muted)]" : ""}`}
                  onClick={r.page ? () => navigate(r.page!) : undefined}
                >
                  <td
                    className={`px-[10px] py-[10px] text-xs border-b border-[color:var(--border-light)] ${r.bold ? "font-semibold" : ""}`}
                  >
                    {r.label}
                  </td>
                  <td
                    className={`px-[10px] py-[10px] text-xs text-right border-b border-[color:var(--border-light)] ${r.bold ? "font-semibold" : ""}`}
                  >
                    {r.open}
                  </td>
                  <td
                    className={`px-[10px] py-[10px] text-xs text-right border-b border-[color:var(--border-light)] ${r.bold ? "font-semibold" : ""} text-up-fg`}
                  >
                    {r.in}
                  </td>
                  <td
                    className={`px-[10px] py-[10px] text-xs text-right border-b border-[color:var(--border-light)] ${r.bold ? "font-semibold" : ""} text-down-fg`}
                  >
                    {r.out}
                  </td>
                  <td
                    className={`px-[10px] py-[10px] text-xs text-right border-b border-[color:var(--border-light)] ${r.bold ? "font-bold text-sm" : "font-semibold"}`}
                  >
                    {r.close}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function ChannelCard({
  title,
  balance,
  badge,
  onClick,
}: {
  title: string;
  balance: string;
  badge: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-[10px] px-[14px] py-[14px] card-shadow ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="text-xs font-medium text-foreground mb-[6px] flex items-center justify-between">
        {title}
        {onClick && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[color:var(--faint)]"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
      <div className="text-base font-semibold text-foreground">{balance}</div>
      <div className="mt-[3px]">{badge}</div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[6px] text-xs text-[color:var(--muted-fg)]">
      <div
        className="w-[10px] h-[10px] rounded-sm border border-[color:var(--border)]"
        style={{ background: color }}
      />
      {label}
    </div>
  );
}

function BtnPrimary({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
    >
      {children}
    </button>
  );
}

function IconDownload() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-[color:var(--muted-fg)]"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function IconUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-[color:var(--muted-fg)]"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    </svg>
  );
}
function IconDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-[color:var(--muted-fg)]"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    </svg>
  );
}
function IconUpGreen() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1a7a40"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    </svg>
  );
}
