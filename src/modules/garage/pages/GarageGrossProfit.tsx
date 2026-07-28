import React, { useMemo, useState } from "react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageGrossProfit } from "../hooks/useGarage";
import { Car, DownloadCloud, MoreHorizontal } from "lucide-react";
import { TableText } from "@/shared/components/DataTable/TableText";
import { GarageCaseSyncDrawer } from "../components/GarageCaseSyncDrawer";
import { GarageGrossProfitDetailDrawer } from "../components/GarageGrossProfitDetailDrawer";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useGarageStore } from "../store/garageStore";
import { money } from "@/shared/utils/format";
import { KpiCard } from "@/shared/components/KpiCard";

export function GarageGrossProfit() {
  const { selectedBranchId } = useGarageStore();

  const filterConfig = useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      search: true,
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});
  const {
    data: profitData,
    isLoading,
    isFetching,
    refetch,
  } = useGarageGrossProfit(
    selectedBranchId,
    filter.state.dateFrom || undefined,
    filter.state.dateTo || undefined,
  );

  const groups = profitData?.results?.Groups || [];
  const cases = groups.flatMap((g: any) => g.Items || []);

  const totalRevenue = profitData?.results?.TongCong?.DoanhThu || 0;
  const totalCost = profitData?.results?.TongCong?.ChiPhi || 0;
  const totalGrossProfit = profitData?.results?.TongCong?.LaiGop || 0;

  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [selectedGrossProfitData, setSelectedGrossProfitData] = useState<
    any | null
  >(null);

  const createActions = useMemo(
    () => [
      {
        groupLabel: "Thao tác",
        items: [
          {
            label: "Đồng bộ Lợi nhuận gộp",
            icon: <DownloadCloud className="w-4 h-4 text-indigo-600" />,
            onClick: () => setSyncDrawerOpen(true),
          },
        ],
      },
    ],
    [],
  );

  const columns = [
    {
      key: "caseCode",
      header: "Mã vụ việc",
      sortable: true,
      size: 200,
      cell: (item: any) => (
        <TableText
          text={item.VuViecCode}
          textClassName="font-medium text-primary text-left"
          enableCopy={true}
          onDrawerClick={() => setSelectedGrossProfitData(item)}
        />
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      sortable: true,
      cell: (item: any) => (
        <span className="font-semibold text-gray-800">
          {item.TenKhachHang || "-"}
        </span>
      ),
    },
    {
      key: "caseName",
      header: "Vụ việc",
      sortable: true,
      cell: (item: any) => (
        <span className="text-sm text-gray-600">{item.VuViecName || "-"}</span>
      ),
    },
    {
      key: "revenue",
      header: "Doanh thu",
      sortable: true,
      cell: (item: any) => (
        <span className="text-gray-900 font-semibold">
          {money(item.DoanhThu || 0)}
        </span>
      ),
    },
    {
      key: "cost",
      header: "Chi phí",
      sortable: true,
      cell: (item: any) => (
        <span className="text-red-600">{money(item.ChiPhi || 0)}</span>
      ),
    },
    {
      key: "grossProfit",
      header: "Lợi nhuận gộp",
      sortable: true,
      cell: (item: any) => (
        <span className="text-green-600 font-bold">
          {money(item.LoiNhuan || 0)}
        </span>
      ),
    },
    {
      key: "margin",
      header: "Biên lợi nhuận",
      sortable: true,
      cell: (item: any) => {
        const margin = item.DoanhThu
          ? (item.LoiNhuan / item.DoanhThu) * 100
          : 0;
        return <span>{margin.toFixed(2)}%</span>;
      },
    },
  ];

  return (
    <>
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
        icon={<Car className="w-5 h-5 text-slate-700" />}
        tableId="garage-gross-profit-table"
        items={cases}
        columns={columns}
        getRowKey={(item: any) => item.VuViecID}
        loading={isLoading || isFetching}
        onRefresh={() => refetch()}
        filterConfig={filterConfig}
        filter={filter}
        page={1}
        pageSize={100}
        total={cases.length}
        totalPages={1}
        onPage={() => {}}
        onPageSize={() => {}}
        createActions={createActions}
        rowActions={(item: any) => [
          {
            label: "Xem chi tiết",
            icon: <MoreHorizontal className="w-4 h-4" />,
            onClick: () => {
              setSelectedGrossProfitData(item);
            },
          },
        ]}
        summaryRow={{
          revenue: money(totalRevenue),
          cost: money(totalCost),
          grossProfit: money(totalGrossProfit),
        }}
      />
      <GarageCaseSyncDrawer
        open={syncDrawerOpen}
        onClose={() => setSyncDrawerOpen(false)}
        onSuccess={() => refetch()}
        mode="gross-profit"
        title="Đồng bộ Lợi nhuận gộp"
        description="Chọn khoảng thời gian để đồng bộ Lợi nhuận gộp từ hệ thống Kgara về ERP. Lưu ý: Nếu không chọn ngày, API có thể sẽ không trả về dữ liệu."
      />
      <GarageGrossProfitDetailDrawer
        grossProfitData={selectedGrossProfitData}
        isOpen={!!selectedGrossProfitData}
        onClose={() => setSelectedGrossProfitData(null)}
      />
    </>
  );
}
