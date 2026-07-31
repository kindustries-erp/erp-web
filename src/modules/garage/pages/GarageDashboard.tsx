import React from "react";
import { useGarageDashboard } from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import { Car } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { KpiCard } from "@/shared/components/KpiCard";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { money } from "@/shared/utils/format";
import { GarageBranchSelector } from "../components/GarageBranchSelector";

export function GarageDashboard() {
  const { selectedBranchId } = useGarageStore();

  const filterConfig = React.useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [], // Can add branch selector here if wanted, but it's global for Garage
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = useGarageDashboard(
    selectedBranchId,
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined,
  );

  const revenue = dashboard?.data?.revenue || 0;
  const newCases = dashboard?.data?.newCases || 0;
  const completedCases = dashboard?.data?.completedCases || 0;

  return (
    <DashboardTemplate
      title="Garage Dashboard"
      desc="Overview of Garage data"
      icon={<Car className="h-4 w-4 text-blue-600" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isLoading}
      onRefresh={() => refetch()}
    >
      <div className="mb-4">
        <GarageBranchSelector />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          compact
          loading={isLoading}
          label="Doanh thu"
          value={money(revenue)}
        />
        <KpiCard
          compact
          loading={isLoading}
          label="Số lượng xe tiếp nhận"
          value={newCases.toString()}
        />
        <KpiCard
          compact
          loading={isLoading}
          label="Số lượng xe hoàn thành"
          value={completedCases.toString()}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold mb-2">Raw Dashboard Data</h3>
        <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-96">
          {JSON.stringify(dashboard, null, 2)}
        </pre>
      </div>
    </DashboardTemplate>
  );
}
