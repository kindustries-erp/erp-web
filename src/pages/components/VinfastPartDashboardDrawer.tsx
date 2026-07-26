import { DrawerModal } from "@/shared/components/DrawerModal";
import { VinfastPartTrendChart } from "../VinfastPartsDashboardPage";
import { money } from "@/shared/utils/format";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { VinfastPartDashboardTableRow } from "@/shared/hooks/useVinfastPartsDashboardTable";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: VinfastPartDashboardTableRow | null;
  vehicleType: "CAR" | "MOTORBIKE";
  filterState: any;
  groupBy: string;
  onOpenInvoice?: (id: string) => void;
}

export function VinfastPartDashboardDrawer({
  open,
  onOpenChange,
  part,
  vehicleType,
  filterState,
  groupBy,
  onOpenInvoice,
}: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "vinfast-parts-details-drawer",
      part?.itemCode,
      vehicleType,
      filterState.dateFrom,
      filterState.dateTo,
    ],
    enabled: open && !!part?.itemCode,
    queryFn: async () => {
      const res = await api.get("/api/v1/reports/vinfast-parts/details", {
        params: {
          dateFrom: filterState.dateFrom,
          dateTo: filterState.dateTo,
          itemCode: part?.itemCode,
        },
      });
      const raw: any[] = res.data || [];
      return raw.filter((r) => r.vehicleType === vehicleType);
    },
  });

  const buyData = useMemo(
    () =>
      (data || [])
        .filter((r: any) => r.direction === "IN")
        .map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.invoiceNo}-IN-${i}`,
        })),
    [data],
  );
  const sellData = useMemo(
    () =>
      (data || [])
        .filter((r: any) => r.direction === "OUT")
        .map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.invoiceNo}-OUT-${i}`,
        })),
    [data],
  );

  const columns: DataTableColumn<any>[] = [
    {
      key: "invoiceDate",
      header: "Ngày HĐ",
      size: 100,
      headerClassName: "text-center",
      cell: (row) =>
        row.invoiceDate ? format(new Date(row.invoiceDate), "dd-MM-yyyy") : "—",
    },
    {
      key: "serialNo",
      header: "Ký hiệu",
      size: 100,
      headerClassName: "text-center",
      className: "text-muted-foreground text-left",
      cell: (row) => row.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: "Số HĐ",
      size: 90,
      headerClassName: "text-center",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {onOpenInvoice && row.invoiceId ? (
            <Button
              variant="link"
              onClick={(e) => {
                e.stopPropagation();
                onOpenInvoice(row.invoiceId);
              }}
              className="font-medium text-primary hover:underline p-0 h-auto"
            >
              {row.invoiceNo || "—"}
            </Button>
          ) : (
            <span className="font-medium text-primary">
              {row.invoiceNo || "—"}
            </span>
          )}
          {row.status && row.status !== "CONFIRMED" && (
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                row.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {row.status === "CANCELLED" ? "Đã hủy" : "Nháp"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "partnerName",
      header: "Đối tác",
      size: 180,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.partnerName || ""}>
          <div className="truncate max-w-[180px]" title={row.partnerName || ""}>
            {row.partnerName || "—"}
          </div>
        </Tooltip>
      ),
    },
    {
      key: "taxCode",
      header: "MST",
      size: 110,
      headerClassName: "text-center",
      className: "text-muted-foreground text-xs text-left",
      cell: (row) => row.taxCode || "—",
    },
    {
      key: "description",
      header: "Diễn giải",
      size: 220,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.description || ""}>
          <div className="truncate max-w-[220px]" title={row.description || ""}>
            {row.description || "—"}
          </div>
        </Tooltip>
      ),
    },
    { key: "unit", header: "ĐVT", size: 70, headerClassName: "text-center" },
    {
      key: "qty",
      header: "Số lượng",
      size: 90,
      headerClassName: "text-center",
      className: "text-right font-medium",
      cell: (row) =>
        Number(row.qty).toLocaleString("vi-VN", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
    },
    {
      key: "unitPrice",
      header: "Đơn giá",
      size: 110,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => money(row.unitPrice),
    },
    {
      key: "preVatAmount",
      header: "Trước GTGT",
      size: 120,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => money(row.preVatAmount),
    },
    {
      key: "vatRate",
      header: "Thuế suất",
      size: 80,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) =>
        row.vatRate != null
          ? `${(Number(row.vatRate) * 100).toFixed(0)}%`
          : "—",
    },
    {
      key: "vatAmount",
      header: "Thuế GTGT",
      size: 110,
      headerClassName: "text-center",
      className: "text-right",
      cell: (row) => money(row.vatAmount),
    },
    {
      key: "totalAmount",
      header: "Thành tiền",
      size: 130,
      headerClassName: "text-center",
      className: "text-right font-medium text-emerald-700",
      cell: (row) => money(row.totalAmount),
    },
  ];

  const vehicleLabel = vehicleType === "CAR" ? "Ô tô" : "Xe máy";

  return (
    <DrawerModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Chi tiết phụ tùng ${vehicleLabel}: ${part?.itemCode} - ${part?.itemName}`}
      panelClassName="min-[1024px]:w-[calc(100vw-280px)] w-full max-w-[90vw]"
      bodyClassName="flex flex-col p-4"
    >
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div>
          {part && (
            <VinfastPartTrendChart
              title={`${part.itemCode} — ${vehicleLabel}`}
              vehicleType={vehicleType}
              filterState={filterState}
              groupBy={groupBy}
              itemCode={part.itemCode}
            />
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-auto">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-slate-800 flex items-center gap-2">
              Hóa đơn Mua vào
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {buyData.length}
              </span>
            </h3>
            <StandardTable
              tableId={`vinfast-dash-detail-in-${part?.itemCode}`}
              variant="spreadsheet"
              minWidth={1000}
              enableColumnResizing={true}
              columns={columns as any}
              items={buyData}
              loadingRows={isLoading ? 3 : 0}
              getRowKey={(row: any) => row._rowKey}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-slate-800 flex items-center gap-2">
              Hóa đơn Bán ra
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {sellData.length}
              </span>
            </h3>
            <StandardTable
              tableId={`vinfast-dash-detail-out-${part?.itemCode}`}
              variant="spreadsheet"
              minWidth={1000}
              enableColumnResizing={true}
              columns={columns as any}
              items={sellData}
              loadingRows={isLoading ? 3 : 0}
              getRowKey={(row: any) => row._rowKey}
            />
          </div>
        </div>
      </div>
    </DrawerModal>
  );
}
