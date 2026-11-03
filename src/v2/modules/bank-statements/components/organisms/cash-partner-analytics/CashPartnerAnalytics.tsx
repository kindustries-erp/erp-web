import { useQuery } from "@tanstack/react-query";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2StatCard } from "@/v2/shared/components/molecules/v2-stat-card";
import { V2BarChart } from "@/v2/shared/components/organisms/v2-chart";
import {
  V2StandardTable,
  type V2Column,
} from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import { partnerStatsApi } from "../../../api/partnerStatsApi";
import type { CashTrendPointDto } from "../../../api/dtos/partnerStats.dto";
import { usePartnerTransactionCountQuery } from "../../../api/queries/usePartnerTransactionCountQuery";
import { analyticsTotalsOf } from "../../../domain/rules/partnerAnalytics";
import type { CashPartnerAnalyticsProps } from "./CashPartnerAnalytics.type";

interface TrendRow extends CashTrendPointDto {
  id: string;
  net: number;
}

/** Biến động thu chi của đối tượng: bốn thẻ tổng, biểu đồ và bảng theo kỳ */
export function CashPartnerAnalytics({
  correspondentAccount = "",
  correspondentName = "",
}: CashPartnerAnalyticsProps) {
  const { t } = useV2Translation();
  const enabled = Boolean(correspondentAccount || correspondentName);
  const keys = { correspondentAccount, correspondentName };

  const stats = useQuery({
    queryKey: ["bank-partner-stats", correspondentAccount, correspondentName],
    queryFn: () => partnerStatsApi.getDashboardStats(keys),
    enabled,
  });
  const count = usePartnerTransactionCountQuery(
    correspondentAccount,
    correspondentName,
  );

  const totals = analyticsTotalsOf(stats.data);
  const trend: TrendRow[] = (stats.data?.cashTrend ?? []).map((p, i) => ({
    ...p,
    id: `${p.label}-${i}`,
    net: Number(p.cashIn || 0) - Number(p.cashOut || 0),
  }));

  const columns: V2Column<TrendRow>[] = [
    {
      key: "label",
      label: t("v2.cashPartner.trend.period", "Kỳ"),
      size: 140,
      cell: (row) => row.label,
    },
    {
      key: "cashIn",
      label: t("v2.cashPartner.trend.chartIn", "Thu"),
      size: 140,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(Number(row.cashIn || 0)),
    },
    {
      key: "cashOut",
      label: t("v2.cashPartner.trend.chartOut", "Chi"),
      size: 140,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(Number(row.cashOut || 0)),
    },
    {
      key: "net",
      label: t("v2.cashPartner.trend.net", "Thuần"),
      size: 140,
      align: TableColumnAlign.RIGHT,
      cell: (row) => formatAmount(row.net),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <V2StatCard
          label={t("v2.cashPartner.stats.cashIn", "Tổng thu")}
          value={formatAmount(totals.cashIn)}
          loading={stats.isFetching}
        />
        <V2StatCard
          label={t("v2.cashPartner.stats.cashOut", "Tổng chi")}
          value={formatAmount(totals.cashOut)}
          loading={stats.isFetching}
        />
        <V2StatCard
          label={t("v2.cashPartner.stats.net", "Chênh lệch ròng")}
          value={formatAmount(totals.net)}
          loading={stats.isFetching}
        />
        <V2StatCard
          label={t("v2.cashPartner.stats.count", "Số giao dịch")}
          value={String(count.data?.total ?? 0)}
          loading={count.isFetching}
        />
      </div>

      <DrawerSection
        title={t("v2.cashPartner.trend.title", "Biến động theo kỳ")}
      >
        {trend.length > 0 && (
          <V2BarChart
            labels={trend.map((p) => p.label)}
            series={[
              {
                key: "in",
                label: t("v2.cashPartner.trend.chartIn", "Thu"),
                data: trend.map((p) => Number(p.cashIn || 0)),
              },
              {
                key: "out",
                label: t("v2.cashPartner.trend.chartOut", "Chi"),
                data: trend.map((p) => Number(p.cashOut || 0)),
              },
            ]}
            ariaLabel={t(
              "v2.cashPartner.trend.chartLabel",
              "Biến động thu chi theo kỳ",
            )}
            height={200}
          />
        )}
        <V2StandardTable
          tableId="cash-partner-trend"
          columns={columns}
          items={trend}
          getRowKey={(row) => row.id}
          mode="client"
          emptyLabel={t(
            "v2.cashPartner.empty",
            "Chưa có giao dịch của đối tượng này",
          )}
        />
      </DrawerSection>
    </div>
  );
}
