import { LayoutDashboard } from "lucide-react";
import { KpiCard, KpiBadge } from "@/shared/components/KpiCard";
import { PageHeader } from "@/shared/components/PageHeader";
import { Panel, PanelMore, PanelBadge } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";

const APPROVALS_DATA = [
  {
    typeKey: "payNCC",
    time: "01p",
    urgent: true,
    name: "Cty TNHH Công Nghệ ABC",
    amount: "₫ 450,000,000",
  },
  {
    typeKey: "advanceSalary",
    time: "Hôm nay",
    urgent: false,
    name: "Khối Sản Xuất · Tháng 10",
    amount: "₫ 1,200,000,000",
  },
  {
    typeKey: "buyFA",
    time: "Hôm nay",
    urgent: false,
    name: "Hệ thống máy chủ mới",
    amount: "₫ 850,000,000",
  },
];

export function Dashboard() {
  const t = useT();
  const barIn = "#e0e0de";
  const barOut = "#1a1a1a";
  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        desc={t("dashboard.desc")}
        icon={<LayoutDashboard className="h-4 w-4" />}
        actions={
          <>
            <Btn>{t("common.thisMonth")}</Btn>
            <BtnPrimary icon={<IconDownload />}>
              {t("common.export")}
            </BtnPrimary>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 mb-4">
        <KpiCard
          label={t("dashboard.kpi.cash")}
          value="₫ 24.5B"
          icon={<IconWallet />}
          badge={<KpiBadge variant="up">↑ +13.6%</KpiBadge>}
        />
        <KpiCard
          label={t("dashboard.kpi.ar")}
          value="₫ 8.2B"
          icon={<IconTrendUp />}
          badge={<KpiBadge variant="up">↑ +9.2%</KpiBadge>}
        />
        <KpiCard
          label={t("dashboard.kpi.ap")}
          value="₫ 4.7B"
          icon={<IconTrendDown />}
          badge={<KpiBadge variant="down">↓ -1.8%</KpiBadge>}
        />
        <KpiCard
          label={t("dashboard.kpi.pending")}
          value="24"
          icon={<IconFile warn />}
          badge={
            <KpiBadge variant="warn">{t("dashboard.kpi.nearLimit")}</KpiBadge>
          }
          warn
        />
      </div>

      {/* Panels row */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3">
        <Panel title={t("dashboard.cashTrend")} extra={<PanelMore />}>
          <div className="relative h-[210px]">
            <BarChart
              labels={["T1", "T2", "T3", "T4", "T5", "T6"]}
              datasets={[
                {
                  data: [12, 15, 18, 22, 19, 25],
                  color: barIn,
                  label: t("dashboard.cashIn"),
                },
                {
                  data: [8, 10, 14, 16, 12, 18],
                  color: barOut,
                  label: t("dashboard.cashOut"),
                },
              ]}
              yMax={30}
            />
          </div>
          <div className="flex gap-4 mt-[10px]">
            <LegendItem color={barIn} label={t("dashboard.cashIn")} />
            <LegendItem color={barOut} label={t("dashboard.cashOut")} />
          </div>
        </Panel>

        <Panel
          title={t("dashboard.urgentApproval")}
          badge={<PanelBadge>3</PanelBadge>}
        >
          {APPROVALS_DATA.map((a) => (
            <div
              key={a.name}
              className="py-[11px] border-b border-[color:var(--border-light)] last:border-b-0"
            >
              <div className="flex items-center justify-between mb-[3px]">
                <span className="text-[10px] font-medium text-[color:var(--muted-fg)] uppercase tracking-[0.05em]">
                  {t(`dashboard.approvalType.${a.typeKey}`)}
                </span>
                <span
                  className={`text-[10px] px-2 py-[2px] rounded-[20px] font-medium ${a.urgent ? "bg-down-bg text-down-fg" : "bg-approve-bg text-approve-fg"}`}
                >
                  {a.time}
                </span>
              </div>
              <div className="text-sm font-medium text-foreground mb-[3px]">
                {a.name}
              </div>
              <div className="text-sm font-semibold text-foreground">
                {a.amount}
              </div>
            </div>
          ))}
          <a className="text-xs text-[color:var(--muted-fg)] cursor-pointer py-2 block border-t border-[color:var(--border-light)] text-center hover:text-foreground mt-1">
            {t("dashboard.viewAll")} (24)
          </a>
        </Panel>
      </div>
    </div>
  );
}

// ── Helpers ──
function Btn({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-[14px] py-[7px] rounded-lg border border-border bg-surface text-xs font-medium cursor-pointer text-foreground flex items-center gap-[6px] hover:bg-surface-hover whitespace-nowrap">
      {children}
    </button>
  );
}
function BtnPrimary({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap">
      {icon}
      {children}
    </button>
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

// ── Icons ──
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
function IconWallet() {
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
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8l-2 4h12z" />
    </svg>
  );
}
function IconTrendUp() {
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
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function IconTrendDown() {
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
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
function IconFile({ warn }: { warn?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={warn ? "#f0a500" : "currentColor"}
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
