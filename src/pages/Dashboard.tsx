import React from "react";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { DashboardTabsContent } from "@/modules/dashboard-core/components/DashboardTabsContent";
import { useDashboardOverview } from "@/modules/dashboard-core/hooks/useDashboardOverview";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { Forbidden } from "@/pages/Forbidden";

function DashboardContent() {
  const {
    branches,
    filterConfig,
    filter,
    loading,
    mergedData,
    handleRefresh,
    t,
  } = useDashboardOverview();

  return (
    <DashboardTemplate
      title={t("title")}
      desc={t("desc")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={loading}
      onRefresh={handleRefresh}
    >
      <DashboardTabsContent
        loading={loading}
        filter={filter}
        data={mergedData}
        branches={branches}
      />
    </DashboardTemplate>
  );
}

export function Dashboard() {
  const canRead = useHasPermission(ErpResource.DASHBOARD, ErpAction.READ);

  if (!canRead) {
    return <Forbidden />;
  }

  return <DashboardContent />;
}
