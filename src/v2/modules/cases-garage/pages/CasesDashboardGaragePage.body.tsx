import { V2Stack, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  CasesDashboardClassificationTable,
  CasesDashboardFunnel,
  CasesDashboardKpiCard,
} from "@/v2/core/cases-garage";
import { useCasesDashboardGarage } from "../hooks/useCasesDashboardGarage";
import {
  toClassRows,
  toFunnelRows,
  toKpiView,
  toProjectedKpiView,
} from "../domain/casesDashboard.view";
import { CasesDashboardCasesList } from "../components/CasesDashboardCasesList";

export type CasesDashboardLayout = "desktop" | "mobile";

/** Thân trang dùng chung; desktop xếp nhiều cột, mobile xếp dọc một cột. */
export function CasesDashboardGaragePageBody({
  layout,
}: {
  layout: CasesDashboardLayout;
}) {
  const { t } = useV2Translation();
  const vm = useCasesDashboardGarage();
  const isDesktop = layout === "desktop";
  const kpiGrid = isDesktop
    ? "grid grid-cols-3 gap-4"
    : "grid grid-cols-1 gap-3";
  const sectionGrid = isDesktop
    ? "grid grid-cols-2 gap-6 items-start"
    : "flex flex-col gap-6";

  if (vm.hasError) {
    return (
      <V2Text variant="body" color="destructive">
        {t(
          "v2.casesDashboardGarage.loadError",
          "Không tải được dữ liệu dashboard.",
        )}
      </V2Text>
    );
  }

  const selectedLabel = vm.selectedStage
    ? t(`v2.garageCasesDashboard.stage.${vm.selectedStage}`, vm.selectedStage)
    : "";

  return (
    <V2Stack
      gap="md"
      className="mx-auto w-full max-w-7xl p-4 md:p-6"
      data-testid={`cases-dashboard-${layout}`}
    >
      <V2Stack gap="xs">
        <V2Text as="h1" variant="h3" weight="bold">
          {t("v2.casesDashboardGarage.title", "Dashboard Garage")}
        </V2Text>
        <V2Text variant="body-sm" color="muted">
          {t(
            "v2.casesDashboardGarage.subtitle",
            "Số xe đếm theo biển số; số lệnh và tiền cộng theo lệnh.",
          )}
        </V2Text>
      </V2Stack>

      {vm.isLoading ? (
        <V2Text variant="body-sm" color="muted">
          {t("v2.casesDashboardGarage.loading", "Đang tải dữ liệu...")}
        </V2Text>
      ) : null}

      {vm.kpi ? (
        <V2Stack gap="sm">
          <V2Text variant="label" weight="bold">
            {t("v2.casesDashboardGarage.periodTitle", "Theo kỳ")}
          </V2Text>
          <div className={kpiGrid}>
            <CasesDashboardKpiCard
              title={t("v2.casesDashboardGarage.day", "Hôm nay")}
              counts={toKpiView(vm.kpi.day)}
              testId="kpi-day"
            />
            <CasesDashboardKpiCard
              title={t("v2.casesDashboardGarage.week", "Tuần này")}
              counts={toKpiView(vm.kpi.week)}
              testId="kpi-week"
            />
            <CasesDashboardKpiCard
              title={t("v2.casesDashboardGarage.month", "Tháng này")}
              counts={toKpiView(vm.kpi.month)}
              testId="kpi-month"
            />
          </div>
          <V2Text variant="label" weight="bold">
            {t("v2.casesDashboardGarage.projectedTitle", "Dự thu")}
          </V2Text>
          <div className={kpiGrid}>
            <CasesDashboardKpiCard
              title={t(
                "v2.casesDashboardGarage.projectedToday",
                "Dự thu hôm nay",
              )}
              counts={toProjectedKpiView(vm.kpi.projectedToday)}
              testId="projected-today"
            />
            <CasesDashboardKpiCard
              title={t(
                "v2.casesDashboardGarage.projectedMonth",
                "Dự thu cả tháng",
              )}
              counts={toProjectedKpiView(vm.kpi.projectedMonth)}
              testId="projected-month"
            />
          </div>
        </V2Stack>
      ) : null}

      {vm.funnel ? (
        <div className={sectionGrid}>
          <CasesDashboardFunnel
            rows={toFunnelRows(vm.funnel.overall)}
            onStageClick={vm.openStage}
          />
          <CasesDashboardClassificationTable rows={toClassRows(vm.funnel)} />
        </div>
      ) : null}

      {vm.selectedStage ? (
        <CasesDashboardCasesList
          title={`${t("v2.casesDashboardGarage.vehiclesTitle", "Danh sách xe")} · ${selectedLabel}`}
          items={vm.vehicles?.items ?? []}
          pagination={vm.vehicles?.pagination}
          loading={vm.vehiclesLoading}
          onPrevious={() => vm.setPage(Math.max(1, vm.page - 1))}
          onNext={() => vm.setPage(vm.page + 1)}
          onClose={vm.closeStage}
        />
      ) : null}
    </V2Stack>
  );
}
