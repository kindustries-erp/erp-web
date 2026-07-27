import React, { useMemo } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageGrossProfit } from "../hooks/useGarage";
import { Car } from "lucide-react";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useGarageStore } from "../store/garageStore";
import { GarageBranchSelector } from "../components/GarageBranchSelector";
import { useTranslation } from "react-i18next";
import { money } from "@/shared/utils/format";
import { KpiCard } from "@/shared/components/KpiCard";

export function GarageGrossProfit() {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();

  const filterConfig = useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      search: true,
      custom: [],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const { data: profitData, isLoading, refetch } = useGarageGrossProfit(
    selectedBranchId,
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined
  );

  const groups = profitData?.results?.Groups || [];
  const cases = groups.flatMap((g: any) => g.Items || []);
  
  const totalRevenue = profitData?.results?.TongCong?.DoanhThu || 0;
  const totalCost = profitData?.results?.TongCong?.ChiPhi || 0;
  const totalGrossProfit = profitData?.results?.TongCong?.LaiGop || 0;

  const columns = [
    {
      key: "caseCode",
      header: "Mã vụ việc",
      sortable: true,
      cell: (item: any) => <span className="font-medium text-blue-600">{item.VuViecCode}</span>,
    },
    {
      key: "info",
      header: "Thông tin",
      sortable: true,
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{item.TenKhachHang || "-"}</span>
          <span className="text-xs text-gray-500">{item.VuViecName || "-"}</span>
        </div>
      ),
    },
    {
      key: "revenue",
      header: "Doanh thu",
      sortable: true,
      cell: (item: any) => <span className="text-gray-900 font-semibold">{money(item.DoanhThu || 0)}</span>,
    },
    {
      key: "cost",
      header: "Chi phí",
      sortable: true,
      cell: (item: any) => <span className="text-red-600">{money(item.ChiPhi || 0)}</span>,
    },
    {
      key: "grossProfit",
      header: "Lợi nhuận gộp",
      sortable: true,
      cell: (item: any) => <span className="text-green-600 font-bold">{money(item.LoiNhuan || 0)}</span>,
    },
    {
      key: "margin",
      header: "Biên lợi nhuận",
      sortable: true,
      cell: (item: any) => {
        const margin = item.DoanhThu ? (item.LoiNhuan / item.DoanhThu) * 100 : 0;
        return <span>{margin.toFixed(2)}%</span>;
      },
    },
  ];

  return (
    <SpreadsheetPageTemplate
      topNode={
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard
            compact
            loading={isLoading}
            label="Tổng doanh thu"
            value={money(totalRevenue)}
          />
          <KpiCard
            compact
            loading={isLoading}
            label="Tổng chi phí"
            value={money(totalCost)}
          />
          <KpiCard
            compact
            loading={isLoading}
            label="Tổng lợi nhuận gộp"
            value={money(totalGrossProfit)}
          />
        </div>
      }
      title="Báo cáo lợi nhuận gộp"
      desc="Phân tích doanh thu và chi phí theo từng vụ việc Kgara"
      icon={<Car className="w-5 h-5 text-blue-600" />}
      tableId="garage-gross-profit-table"
      items={cases}
      columns={columns}
      getRowKey={(item: any) => item.VuViecID}
      loading={isLoading}
      onRefresh={() => refetch()}
      filterConfig={filterConfig}
      filter={filter}
      customActionsNode={<GarageBranchSelector />}
      page={1}
      pageSize={100}
      total={cases.length}
      totalPages={1}
      onPage={() => {}}
      onPageSize={() => {}}
    />
  );
}
