import { DrawerModal } from "@/shared/components/DrawerModal";
import { VinfastPartTrendChart } from "../VinfastPartsDashboardPage";
import { money } from "@/shared/utils/format";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { VinfastPartDashboardTableRow } from "@/shared/hooks/useVinfastPartsDashboardTable";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { StandardTable } from "@/shared/components/StandardTable";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { TableText } from "@/shared/components/DataTable/TableText";
import { format } from "date-fns";

function formatTaxInvoiceStatus(val?: number | null): string {
  switch (val) {
    case 1:
      return "Mới";
    case 2:
      return "Thay thế";
    case 3:
      return "Điều chỉnh";
    case 4:
      return "Bị thay thế";
    case 5:
      return "Bị điều chỉnh";
    case 6:
      return "Bị hủy";
    default:
      return "—";
  }
}

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

  const buyTotals = useMemo(
    () => ({
      qty: buyData.reduce((s, r) => s + (Number(r.qty) || 0), 0),
      preVatAmount: buyData.reduce(
        (s, r) => s + (Number(r.preVatAmount) || 0),
        0,
      ),
      vatAmount: buyData.reduce((s, r) => s + (Number(r.vatAmount) || 0), 0),
      totalAmount: buyData.reduce(
        (s, r) => s + (Number(r.totalAmount) || 0),
        0,
      ),
    }),
    [buyData],
  );

  const sellTotals = useMemo(
    () => ({
      qty: sellData.reduce((s, r) => s + (Number(r.qty) || 0), 0),
      preVatAmount: sellData.reduce(
        (s, r) => s + (Number(r.preVatAmount) || 0),
        0,
      ),
      vatAmount: sellData.reduce((s, r) => s + (Number(r.vatAmount) || 0), 0),
      totalAmount: sellData.reduce(
        (s, r) => s + (Number(r.totalAmount) || 0),
        0,
      ),
    }),
    [sellData],
  );

  const columns: DataTableColumn<any>[] = [
    {
      key: "stt",
      header: "STT",
      size: 50,
      headerClassName: "text-center",
      className: "text-center text-muted-foreground",
      cell: (row, index) => index,
    },
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
      size: 120,
      headerClassName: "text-center",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {onOpenInvoice && row.invoiceId ? (
            <TableText
              text={row.invoiceNo || "—"}
              enableCopy={true}
              tooltip={true}
              onDrawerClick={(e) => {
                e.stopPropagation();
                onOpenInvoice(row.invoiceId);
              }}
            />
          ) : (
            <TableText text={row.invoiceNo || "—"} enableCopy={true} />
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
      size: 200,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.partnerName || ""}>
          <div className="truncate max-w-[200px]" title={row.partnerName || ""}>
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
      key: "taxInvoiceStatus",
      header: "Trạng thái GDT",
      size: 130,
      enableResizing: true,
      headerClassName: "text-center",
      className: "text-center",
      cell: (row) => {
        const lbl = formatTaxInvoiceStatus(row.taxInvoiceStatus);
        if (row.taxInvoiceStatus == null)
          return <span className="text-muted-foreground text-xs">—</span>;
        let badgeClass = "w-[90px] border-slate-200 bg-slate-50 text-slate-700";
        switch (row.taxInvoiceStatus) {
          case 1:
            badgeClass =
              "w-[90px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";
            break;
          case 2:
          case 3:
          case 5:
            badgeClass =
              "w-[90px] border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
            break;
          case 4:
          case 6:
            badgeClass =
              "w-[90px] border-red-200 bg-red-50 text-red-700 hover:bg-red-100";
            break;
        }
        return (
          <Tooltip content={lbl}>
            <Badge variant="ghost" className={`border ${badgeClass}`}>
              <span className="truncate block max-w-full">{lbl}</span>
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      key: "description",
      header: "Diễn giải",
      size: 250,
      headerClassName: "text-center",
      cell: (row) => (
        <Tooltip content={row.description || ""}>
          <div className="truncate max-w-[250px]" title={row.description || ""}>
            {row.description || "—"}
          </div>
        </Tooltip>
      ),
    },
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
              chartHeight={200}
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
              containerClassName="max-h-[216px] overflow-y-auto"
              columns={columns as any}
              items={buyData}
              loading={isLoading}
              loadingRows={isLoading ? 3 : 0}
              getRowKey={(row: any) => row._rowKey}
              summaryRow={{
                partnerName: (
                  <span className="font-semibold text-right block">
                    Tổng cộng
                  </span>
                ),
                qty: (
                  <span className="font-semibold text-right block tabular-nums">
                    {Number(buyTotals.qty).toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                ),
                preVatAmount: (
                  <span className="font-semibold text-right block tabular-nums text-slate-700">
                    {money(buyTotals.preVatAmount)}
                  </span>
                ),
                vatAmount: (
                  <span className="font-semibold text-right block tabular-nums text-slate-700">
                    {money(buyTotals.vatAmount)}
                  </span>
                ),
                totalAmount: (
                  <span className="font-bold text-right block tabular-nums text-emerald-700">
                    {money(buyTotals.totalAmount)}
                  </span>
                ),
              }}
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
              containerClassName="max-h-[216px] overflow-y-auto"
              columns={columns as any}
              items={sellData}
              loading={isLoading}
              loadingRows={isLoading ? 3 : 0}
              getRowKey={(row: any) => row._rowKey}
              summaryRow={{
                partnerName: (
                  <span className="font-semibold text-right block">
                    Tổng cộng
                  </span>
                ),
                qty: (
                  <span className="font-semibold text-right block tabular-nums">
                    {Number(sellTotals.qty).toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                ),
                preVatAmount: (
                  <span className="font-semibold text-right block tabular-nums text-slate-700">
                    {money(sellTotals.preVatAmount)}
                  </span>
                ),
                vatAmount: (
                  <span className="font-semibold text-right block tabular-nums text-slate-700">
                    {money(sellTotals.vatAmount)}
                  </span>
                ),
                totalAmount: (
                  <span className="font-bold text-right block tabular-nums text-emerald-700">
                    {money(sellTotals.totalAmount)}
                  </span>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </DrawerModal>
  );
}
