import { useMemo } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import api from "@/core/api/axiosInstance";
import { Info } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";

export interface VinfastPartDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  itemCode: string;
  itemName: string;
  month: string;
  onOpenInvoice?: (id: string) => void;
}

export function VinfastPartDetailDrawer({
  open,
  onClose,
  itemCode,
  itemName,
  month,
  onOpenInvoice,
}: VinfastPartDetailDrawerProps) {
  const { t } = useTranslation("vinfast");

  const { data, isLoading } = useQuery({
    queryKey: ["vinfast-parts-details", itemCode, month],
    enabled: open && !!itemCode && !!month,
    queryFn: async () => {
      const dateFrom = `${month}-01`;
      const [y, m] = month.split("-");
      const d = new Date(parseInt(y), parseInt(m), 0).getDate();
      const dateTo = `${month}-${d}`;

      const res = await api.get("/api/v1/reports/vinfast-parts/details", {
        params: {
          dateFrom,
          dateTo,
          itemCode,
        },
      });
      return res.data;
    },
  });

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "invoiceDate",
        header: t("invoiceDate", "Ngày HĐ"),
        size: 100,
        headerClassName: "text-center",
        cell: (row) =>
          row.invoiceDate
            ? format(new Date(row.invoiceDate), "dd-MM-yyyy")
            : "—",
      },
      {
        key: "serialNo",
        header: t("serialNo", "Ký hiệu"),
        size: 120,
        headerClassName: "text-center",
        className: "text-muted-foreground text-left",
        cell: (row) => row.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: t("invoiceNo", "Số HĐ"),
        size: 100,
        headerClassName: "text-center",
        cell: (row) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
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
                  {row.status === "CANCELLED"
                    ? t("statusCancelled", "Đã hủy")
                    : t("statusDraft", "Nháp")}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "partnerName",
        header: t("partner", "Đối tác"),
        size: 200,
        headerClassName: "text-center",
        cell: (row) => (
          <Tooltip content={row.partnerName || ""}>
            <div
              className="whitespace-normal break-words w-full truncate max-w-[200px]"
              title={row.partnerName || ""}
            >
              {row.partnerName || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "taxCode",
        header: t("taxCode", "MST"),
        size: 120,
        headerClassName: "text-center",
        className: "text-muted-foreground text-xs text-left",
        cell: (row) => row.taxCode || "—",
      },
      {
        key: "description",
        header: t("description", "Diễn giải"),
        size: 250,
        headerClassName: "text-center",
        cell: (row) => (
          <Tooltip content={row.description || ""}>
            <div
              className="whitespace-normal break-words w-full truncate max-w-[250px]"
              title={row.description || ""}
            >
              {row.description || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "unit",
        header: t("unit", "ĐVT"),
        size: 80,
        headerClassName: "text-center",
      },
      {
        key: "qty",
        header: t("qty", "Số lượng"),
        size: 100,
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
        header: t("unitPrice", "Đơn giá"),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => money(row.unitPrice),
      },
      {
        key: "preVatAmount",
        header: t("preVatAmount", "Trước GTGT"),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => money(row.preVatAmount),
      },
      {
        key: "vatRate",
        header: t("vatRate", "Thuế suất"),
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
        header: t("vatAmount", "Thuế GTGT"),
        size: 120,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => money(row.vatAmount),
      },
      {
        key: "totalAmount",
        header: t("totalAmount", "Thành tiền"),
        size: 140,
        headerClassName: "text-center",
        className: "text-right font-medium text-emerald-700",
        cell: (row) => money(row.totalAmount),
      },
    ],
    [t, onOpenInvoice],
  );

  const buyData = useMemo(
    () =>
      data
        ?.filter((r: any) => r.direction === "IN")
        .map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.invoiceNo}-${r.direction}-${i}`,
        })) || [],
    [data],
  );
  const sellData = useMemo(
    () =>
      data
        ?.filter((r: any) => r.direction === "OUT")
        .map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r.invoiceNo}-${r.direction}-${i}`,
        })) || [],
    [data],
  );

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("partDetailTitle", "Chi tiết mã phụ tùng")}
      subtitle={`${itemCode} - ${itemName}`}
      icon={<Info className="w-5 h-5 text-blue-600" />}
      panelClassName="w-full md:w-[95vw] lg:w-[90vw] xl:w-[1200px] 2xl:w-[1400px]"
    >
      <div className="p-4 h-full flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            {t("inInvoices", "Hóa đơn Mua vào")}
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {buyData.length}
            </span>
          </h3>
          <StandardTable
            tableId="vinfast-parts-detail-in"
            variant="spreadsheet"
            minWidth={1000}
            enableColumnResizing={true}
            enableColumnVisibility={true}
            columns={columns as any}
            items={buyData}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(row: any) => row._rowKey}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
            {t("outInvoices", "Hóa đơn Bán ra")}
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {sellData.length}
            </span>
          </h3>
          <StandardTable
            tableId="vinfast-parts-detail-out"
            variant="spreadsheet"
            minWidth={1000}
            enableColumnResizing={true}
            enableColumnVisibility={true}
            columns={columns as any}
            items={sellData}
            loadingRows={isLoading ? 3 : 0}
            getRowKey={(row: any) => row._rowKey}
          />
        </div>
      </div>
    </DrawerModal>
  );
}
