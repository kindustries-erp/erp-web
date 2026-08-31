import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { inventoryDashboardApi } from "@/modules/inventory-core/api/inventoryDashboardApi";
import { InventoryKpiCard } from "./components/InventoryKpiCard";
import { StandardTable } from "@/shared/components/StandardTable";
import { DrawerModal } from "@/shared/components/DrawerModal";

export function InventoryDashboard() {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";
  const queryClient = useQueryClient();
  const [alertDrawer, setAlertDrawer] = useState<
    "low_stock" | "zero_stock" | null
  >(null);

  const { data: itemTypes = [] } = useQuery({
    queryKey: ["itemTypes"],
    queryFn: () => inventoryCoreApi.listItemTypes().then((res) => res.items),
  });

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "itemTypeId",
        label: "Loại hàng",
        placeholder: "Tất cả",
        options: itemTypes.map((t: any) => ({ value: t.id, label: t.name })),
      },
      {
        key: "warehouseCode",
        label: "Kho",
        placeholder: "Tất cả kho",
        options: [{ value: "MAIN", label: "Kho Chính" }],
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [itemTypes]);

  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      "inventory-dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.itemTypeId,
      filter.state.custom.warehouseCode,
    ],
    queryFn: () =>
      inventoryDashboardApi.getDashboardStats({
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        itemTypeId: (filter.state.custom.itemTypeId as string) || undefined,
        warehouseCode:
          (filter.state.custom.warehouseCode as string) || undefined,
      }),
  });

  const hasPerm = useHasAnyPermission(
    [ErpResource.GOODS_RECEIPTS, ErpResource.GOODS_ISSUES],
    ErpAction.READ,
  );
  const canView = hasPerm || isAdminEmail;

  if (!canView) {
    return <ComingSoon />;
  }

  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  const trendLabels = data?.stockTrend?.map((t: any) => t.label) || [];
  const trendIn = data?.stockTrend?.map((t: any) => t.receiptQty) || [];
  const trendOut = data?.stockTrend?.map((t: any) => t.issueQty) || [];

  const defaultColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];
  const vehicleBomStats = data?.vehicleBomStats || [];
  const donutItems = vehicleBomStats.map((c: any, i: number) => ({
    id: c.bomName,
    label: c.bomName,
    value: c.currentStock,
    color: defaultColors[i % defaultColors.length],
  }));
  const vehicleBomCols = [
    {
      key: "bomName",
      dataIndex: "bomName",
      header: "Tên BOM (Mẫu xe)",
      size: 250,
    },
    {
      key: "receivedInPeriod",
      dataIndex: "receivedInPeriod",
      header: "Nhập trong kỳ",
      size: 100,
      className: "text-right",
    },
    {
      key: "issuedInPeriod",
      dataIndex: "issuedInPeriod",
      header: "Xuất trong kỳ",
      size: 100,
      className: "text-right text-[#ea580c]",
    },
    {
      key: "currentStock",
      dataIndex: "currentStock",
      header: "Tồn hiện tại",
      size: 100,
      className: "text-right font-medium",
    },
  ];

  const vehicleTrend = data?.vehicleTrend || [];
  const vehicleTrendLabels = vehicleTrend.map((t) => t.periodLabel);
  const boms = Array.from(new Set(vehicleBomStats.map((s) => s.bomName)));

  const vehicleTrendDatasetsIn = boms.map((bom) => ({
    label: "Nhập kho",
    color: barIn,
    data: vehicleTrend.map((t) => t.receiptsByBom[bom] || 0),
  }));

  const vehicleTrendDatasetsOut = boms.map((bom) => ({
    label: "Xuất kho",
    color: barOut,
    data: vehicleTrend.map((t) => t.issuesByBom[bom] || 0),
  }));

  const alertCols = [
    { key: "sku", dataIndex: "sku", header: "Mã SKUs", size: 100 },
    {
      key: "itemName",
      dataIndex: "itemName",
      header: "Tên hàng hóa",
      size: 200,
    },
    {
      key: "qtyOnHand",
      dataIndex: "qtyOnHand",
      header: "Tồn kho",
      size: 80,
      className: "text-right font-bold text-red-600",
    },
    {
      key: "alertType",
      header: "Tình trạng",
      size: 120,
      cell: (row: any) => {
        if (row.alertType === "zero_stock")
          return (
            <span className="text-[11px] px-2 py-[3px] rounded-md font-semibold whitespace-nowrap bg-red-100 text-red-700">
              Hết hàng
            </span>
          );
        if (row.alertType === "low_stock")
          return (
            <span className="text-[11px] px-2 py-[3px] rounded-md font-semibold whitespace-nowrap bg-orange-100 text-orange-700">
              Sắp hết
            </span>
          );
        if (row.alertType === "slow_moving")
          return (
            <span className="text-[11px] px-2 py-[3px] rounded-md font-semibold whitespace-nowrap bg-gray-100 text-gray-700">
              Trì đọng
            </span>
          );
        return null;
      },
    },
  ];

  return (
    <DashboardTemplate
      title="Tổng quan Kho"
      desc="Theo dõi tình hình nhập xuất và giá trị tồn kho"
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={() => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ["itemTypes"] });
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <InventoryKpiCard
          label="Tổng SKUs"
          value={data?.totalSkus || 0}
          loading={isFetching}
        />
        <InventoryKpiCard
          label="Số phiếu nhập"
          value={data?.totalReceiptsCount || 0}
          loading={isFetching}
        />
        <InventoryKpiCard
          label="Số phiếu xuất"
          value={data?.totalIssuesCount || 0}
          loading={isFetching}
        />
        <InventoryKpiCard
          label="Cảnh báo sắp hết"
          value={data?.lowStockCount || 0}
          type="warning"
          loading={isFetching}
          onClick={() => setAlertDrawer("low_stock")}
        />
        <InventoryKpiCard
          label="Hết hàng"
          value={data?.zeroStockCount || 0}
          type="danger"
          loading={isFetching}
          onClick={() => setAlertDrawer("zero_stock")}
        />
      </div>

      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3 mb-6">
        <Panel title="Biến động Nhập / Xuất (Số lượng)" extra={<PanelMore />}>
          <div className="relative h-[210px]">
            {!isFetching && trendLabels.length > 0 ? (
              <BarChart
                labels={trendLabels}
                yCallback={(v: any) => String(v)}
                datasets={[
                  { data: trendIn, color: barIn, label: "Nhập kho" },
                  { data: trendOut, color: barOut, label: "Xuất kho" },
                ]}
              />
            ) : isFetching ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-[10px]">
            <LegendItem color={barIn} label="Nhập kho" />
            <LegendItem color={barOut} label="Xuất kho" />
          </div>
        </Panel>

        <Panel title="Cơ cấu xe theo BOM">
          {!isFetching && donutItems.length > 0 ? (
            <>
              <div className="relative h-[160px] mb-2 shrink-0">
                <DonutChart
                  items={donutItems}
                  onClick={() => {}}
                  valueFormatter={(v: any) => String(v)}
                />
              </div>
              <div className="max-h-[160px] overflow-y-auto pr-1">
                <DonutLegend
                  items={donutItems}
                  onClick={() => {}}
                  valueFormatter={(v: any) => String(v)}
                />
              </div>
            </>
          ) : isFetching ? (
            <div className="h-[200px]">
              <ChartSkeleton type="donut" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-[color:var(--muted-fg)]">
              {t("common.noData")}
            </div>
          )}
        </Panel>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          Biến động xe theo BOM (Biểu đồ)
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {boms.map((bom, idx) => (
            <Panel key={bom} title={`Biến động ${bom}`}>
              <div className="relative h-[250px]">
                {!isFetching && vehicleTrendLabels.length > 0 ? (
                  <BarChart
                    labels={vehicleTrendLabels}
                    yCallback={(v: any) => String(v)}
                    datasets={[
                      vehicleTrendDatasetsIn[idx],
                      vehicleTrendDatasetsOut[idx],
                    ]}
                  />
                ) : isFetching ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          Số lượng xe theo BOM (Bảng)
        </h3>
        <StandardTable
          items={vehicleBomStats}
          columns={vehicleBomCols}
          loading={isFetching}
          variant="spreadsheet"
          minWidth={500}
          getRowKey={(row: any) => row.bomName}
        />
      </div>

      {/* Alert Drawer */}
      <DrawerModal
        open={!!alertDrawer}
        onClose={() => setAlertDrawer(null)}
        title={alertDrawer === "zero_stock" ? "Hết hàng" : "Cảnh báo sắp hết"}
        panelClassName="min-[1024px]:w-[calc(100vw-280px)] w-full max-w-[90vw]"
        bodyClassName="flex flex-col p-4"
      >
        <div className="bg-surface rounded-xl border border-border overflow-hidden h-full">
          <StandardTable
            columns={alertCols}
            items={
              data?.alertItems?.filter(
                (a: any) => a.alertType === alertDrawer,
              ) || []
            }
            getRowKey={(row: any) => row.itemId}
            variant="spreadsheet"
            minWidth={800}
          />
        </div>
      </DrawerModal>
    </DashboardTemplate>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center text-xs">
      <div
        className="w-3 h-3 rounded-[3px] mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-[color:var(--muted-fg)]">{label}</span>
    </div>
  );
}
