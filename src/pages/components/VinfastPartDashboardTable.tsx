import { useState } from "react";
import { StandardTable } from "@/shared/components/StandardTable";
import { money } from "@/shared/utils/format";
import {
  VinfastPartDashboardTableRow,
  useVinfastPartsDashboardTable,
} from "@/shared/hooks/useVinfastPartsDashboardTable";

interface Props {
  filterState: any;
  vehicleType: "CAR" | "MOTORBIKE";
  title: string;
  onRowClick?: (row: VinfastPartDashboardTableRow) => void;
}

export function VinfastPartDashboardTable({
  filterState,
  vehicleType,
  title,
  onRowClick,
}: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useVinfastPartsDashboardTable(
    filterState,
    page,
    limit,
    vehicleType,
  );

  const columns: any[] = [
    {
      key: "itemCode",
      header: <div className="text-left font-semibold">Mã phụ tùng</div>,
      cell: (row: any) => (
        <div className="text-left font-medium">{row.itemCode}</div>
      ),
    },
    {
      key: "itemName",
      header: <div className="text-left font-semibold">Tên phụ tùng</div>,
      cell: (row: any) => (
        <div className="text-left max-w-[200px] truncate" title={row.itemName}>
          {row.itemName}
        </div>
      ),
    },
    {
      key: "qtyBought",
      header: <div className="text-right font-semibold">SL Mua</div>,
      cell: (row: any) => <div className="text-right">{row.qtyBought}</div>,
    },
    {
      key: "amountBought",
      header: <div className="text-right font-semibold">Tiền Mua</div>,
      cell: (row: any) => (
        <div className="text-right text-[#ea580c]">
          {money(row.amountBought)} đ
        </div>
      ),
    },
    {
      key: "qtySold",
      header: <div className="text-right font-semibold">SL Bán</div>,
      cell: (row: any) => <div className="text-right">{row.qtySold}</div>,
    },
    {
      key: "amountSold",
      header: <div className="text-right font-semibold">Tiền Bán</div>,
      cell: (row: any) => (
        <div className="text-right text-[#059669]">
          {money(row.amountSold)} đ
        </div>
      ),
    },
    {
      key: "profit",
      header: <div className="text-right font-semibold">Lợi nhuận</div>,
      cell: (row: any) => {
        const val = row.profit;
        return (
          <div
            className={`text-right font-semibold ${val < 0 ? "text-red-600" : "text-green-600"}`}
          >
            {money(val)} đ
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <h4 className="font-semibold text-sm text-slate-700 mb-2">{title}</h4>
      <div className="flex-1">
        <StandardTable
          columns={columns}
          items={data?.items || []}
          getRowKey={(row: any) => row.itemCode}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          page={page}
          pageSize={limit}
          loading={isLoading}
          minWidth={500}
          enableColumnResizing={false}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
}
