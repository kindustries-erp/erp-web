import { useState } from "react";
import { PanelRightOpen, Check, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
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
  const [limit, setLimit] = useState(10);

  const CopyIconBtn = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded text-slate-500 ml-1"
        title="Copy"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    );
  };

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
      size: 150,
      cell: (row: any) => (
        <div className="flex items-center gap-1.5 group w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e: any) => {
              e.stopPropagation();
              onRowClick?.(row);
            }}
            className="h-5 w-5 p-0 opacity-40 hover:opacity-100 hover:bg-slate-200 transition-all flex-shrink-0"
            title="Mở chi tiết"
          >
            <PanelRightOpen className="w-3.5 h-3.5 text-slate-700" />
          </Button>
          <div className="flex items-center text-slate-700 flex-1 min-w-0">
            <span className="truncate" title={row.itemCode}>
              {row.itemCode}
            </span>
            <CopyIconBtn text={row.itemCode} />
          </div>
        </div>
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
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          onPageSize={setLimit}
          page={page}
          pageSize={limit}
          loading={isLoading}
          minWidth={500}
          enableColumnResizing={false}
          variant="spreadsheet"
        />
      </div>
    </div>
  );
}
