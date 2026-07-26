import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { VinfastPartDashboardTable } from "./components/VinfastPartDashboardTable";
import { VinfastPartDashboardDrawer } from "./components/VinfastPartDashboardDrawer";
import { VinfastPartDashboardTableRow } from "@/shared/hooks/useVinfastPartsDashboardTable";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalSidebar,
  ErpInvoiceInternalMain,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "@/modules/erp-invoices-core/components/ErpInvoicePdfUpload";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";

export function VinfastPartsDashboardPage() {
  const queryClient = useQueryClient();

  const filterConfig = React.useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "groupBy",
          label: "Chu kỳ",
          placeholder: "Chọn chu kỳ",
          options: [
            { value: "month", label: "Theo tháng" },
            { value: "week", label: "Theo tuần" },
          ],
          initialValue: "month",
        },
      ],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});
  const groupBy = filter.state.custom.groupBy || "month";

  const [selectedPart, setSelectedPart] =
    React.useState<VinfastPartDashboardTableRow | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = React.useState<
    "CAR" | "MOTORBIKE"
  >("CAR");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const formHook = useErpInvoiceForm(() => {});

  const handleRowClick = React.useCallback(
    (row: VinfastPartDashboardTableRow, vehicleType: "CAR" | "MOTORBIKE") => {
      setSelectedPart(row);
      setSelectedVehicleType(vehicleType);
      setIsDrawerOpen(true);
    },
    [],
  );

  const { data: allData, isLoading: isLoadingAll } = useQuery({
    queryKey: [
      "vinfast-parts-dashboard",
      "all",
      filter.state.dateFrom,
      filter.state.dateTo,
      groupBy,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.state.dateFrom)
        params.append("dateFrom", filter.state.dateFrom);
      if (filter.state.dateTo) params.append("dateTo", filter.state.dateTo);
      if (groupBy) params.append("groupBy", groupBy as string);
      const res = await api.get(
        `/api/v1/reports/vinfast-parts-dashboard?${params}`,
      );
      return res.data;
    },
  });

  const summary = allData?.summary || { totalBuy: 0, totalSell: 0, profit: 0 };

  return (
    <DashboardTemplate
      title="Tổng quan phụ tùng"
      desc="Báo cáo tổng hợp tình hình mua bán phụ tùng Vinfast"
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isLoadingAll}
      onRefresh={() => {
        queryClient.invalidateQueries({
          queryKey: ["vinfast-parts-dashboard"],
        });
      }}
    >
      <div className="flex flex-col gap-8 mb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="Tổng mua">
            <p className="text-2xl font-bold mt-2 text-[#ea580c]">
              {money(summary.totalBuy)} đ
            </p>
          </Panel>
          <Panel title="Tổng bán">
            <p className="text-2xl font-bold mt-2 text-[#059669]">
              {money(summary.totalSell)} đ
            </p>
          </Panel>
          <Panel title="Lợi nhuận">
            <p className="text-2xl font-bold mt-2 text-[#1e293b]">
              {money(summary.profit)} đ
            </p>
          </Panel>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Biến động Mua / Bán phụ tùng
          </h3>

          <div className="mb-4">
            <VinfastPartTrendChart
              title="Tất cả phụ tùng (Tổng hợp)"
              vehicleType="all"
              filterState={filter.state}
              groupBy={groupBy as string}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <VinfastPartTrendChart
              title="Phụ tùng Ô tô"
              vehicleType="CAR"
              filterState={filter.state}
              groupBy={groupBy as string}
            />
            <VinfastPartTrendChart
              title="Phụ tùng Xe máy"
              vehicleType="MOTORBIKE"
              filterState={filter.state}
              groupBy={groupBy as string}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="h-[500px]">
            <VinfastPartDashboardTable
              filterState={filter.state}
              vehicleType="CAR"
              title="Chi tiết Phụ tùng Ô tô"
              onRowClick={(row) => handleRowClick(row, "CAR")}
            />
          </div>
          <div className="h-[500px]">
            <VinfastPartDashboardTable
              filterState={filter.state}
              vehicleType="MOTORBIKE"
              title="Chi tiết Phụ tùng Xe máy"
              onRowClick={(row) => handleRowClick(row, "MOTORBIKE")}
            />
          </div>
        </div>
      </div>

      <VinfastPartDashboardDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setTimeout(() => setSelectedPart(null), 300);
        }}
        part={selectedPart}
        vehicleType={selectedVehicleType}
        filterState={filter.state}
        groupBy={groupBy as string}
        onOpenInvoice={(id) => formHook.openInternal({ id } as any)}
      />

      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={formHook.closeDrawer}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        rightPanel={
          <div className="flex flex-col gap-5">
            <ErpInvoiceInternalSidebar
              form={formHook.form}
              editMode={formHook.editMode}
              fieldSet={(key: string, value: any) =>
                formHook.setForm((prev) => ({ ...prev, [key]: value }))
              }
              invoiceId={formHook.detailInvoice?.id ?? null}
              pendingTagIds={formHook.pendingTagIds}
              onPendingTagsChange={formHook.setPendingTagIds}
              direction={formHook.detailInvoice?.direction || "IN"}
              detailInvoice={formHook.detailInvoice}
              onRefreshDetail={formHook.handleSyncDetail}
              pdfSlot={
                <ErpInvoicePdfUpload
                  invoiceId={formHook.detailInvoice?.id ?? null}
                  pdfFiles={formHook.detailInvoice?.pdfFiles ?? null}
                  pdfFileKey={formHook.detailInvoice?.pdfFileKey ?? null}
                  editMode={formHook.editMode}
                />
              }
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <ErpInvoiceInternalMain
            form={formHook.form}
            editMode={formHook.editMode}
            fieldSet={(key: string, value: any) =>
              formHook.setForm((prev) => ({ ...prev, [key]: value }))
            }
            direction={formHook.detailInvoice?.direction || "IN"}
            detailInvoice={formHook.detailInvoice}
            postingState={formHook.postingState}
            pendingUnpost={formHook.pendingUnpost}
            onUnpost={() => formHook.setPendingUnpost(true)}
            onRefreshDetail={() => {
              if (formHook.detailInvoice?.id) {
                formHook.openInternal({ id: formHook.detailInvoice.id } as any);
              }
            }}
            invoicePreview={
              formHook.detailInvoice ? (
                <div className="flex justify-center bg-slate-100 p-8 min-h-full">
                  <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
                </div>
              ) : undefined
            }
          />
        </div>
      </ErpInvoiceInternalDrawer>
    </DashboardTemplate>
  );
}

export function VinfastPartTrendChart({
  title,
  vehicleType,
  filterState,
  groupBy,
  itemCode,
}: {
  title: string;
  vehicleType: string;
  filterState: any;
  groupBy: string;
  itemCode?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "vinfast-parts-dashboard",
      vehicleType,
      filterState.dateFrom,
      filterState.dateTo,
      groupBy,
      itemCode,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (vehicleType && vehicleType !== "all")
        params.append("vehicleType", vehicleType);
      if (groupBy) params.append("groupBy", groupBy);
      if (itemCode) params.append("itemCode", itemCode);
      const res = await api.get(
        `/api/v1/reports/vinfast-parts-dashboard?${params}`,
      );
      return res.data;
    },
  });

  const trend = data?.trend || [];
  const trendLabels = trend.map((t: any) => t.month);
  const trendBuy = trend.map((t: any) => t.totalBuy);
  const trendSell = trend.map((t: any) => t.totalSell);
  const trendProfit = trend.map((t: any) => t.profit);

  const colorRevenue = "#059669"; // Emerald 600 (Bán)
  const colorExpense = "#ea580c"; // Orange 600 (Mua)
  const lineProfit = "#1e293b"; // Slate 800 (Lợi nhuận)

  return (
    <Panel title={title}>
      <div className="relative h-[300px]">
        {!isLoading && trendLabels.length > 0 ? (
          <BarChart
            labels={trendLabels}
            yCallback={(v) => money(Number(v))}
            datasets={[
              {
                type: "line",
                data: trendProfit,
                color: "transparent",
                borderColor: lineProfit,
                borderWidth: 2,
                fill: false,
                label: "Lợi nhuận",
              },
              {
                type: "bar",
                data: trendBuy,
                color: colorExpense,
                label: "Tổng mua",
              },
              {
                type: "bar",
                data: trendSell,
                color: colorRevenue,
                label: "Tổng bán",
              },
            ]}
          />
        ) : isLoading ? (
          <ChartSkeleton type="bar" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
            Chưa có dữ liệu
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-[10px] justify-center">
        <LegendItem color={colorExpense} label="Mua vào" />
        <LegendItem color={colorRevenue} label="Bán ra" />
        <LegendItem color={lineProfit} label="Lợi nhuận" isLine={true} />
      </div>
    </Panel>
  );
}

function LegendItem({
  color,
  label,
  isLine,
}: {
  color: string;
  label: string;
  isLine?: boolean;
}) {
  return (
    <div className="flex items-center text-xs">
      {isLine ? (
        <div className="w-4 h-[2px] mr-2" style={{ backgroundColor: color }} />
      ) : (
        <div
          className="w-3 h-3 rounded-[3px] mr-2"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-[color:var(--muted-fg)] font-medium">{label}</span>
    </div>
  );
}
