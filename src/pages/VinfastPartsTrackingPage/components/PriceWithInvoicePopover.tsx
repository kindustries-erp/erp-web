import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import api from "@/core/api/axiosInstance";
import { money } from "@/shared/utils/format";
import { Popover } from "@/core/components/ui/Popover";

export interface PriceWithInvoicePopoverProps {
  price: number;
  itemCode: string;
  month: string;
  direction: "IN" | "OUT";
  onOpenInvoice?: (id: string) => void;
}

export function PriceWithInvoicePopover({
  price,
  itemCode,
  month,
  direction,
  onOpenInvoice,
}: PriceWithInvoicePopoverProps) {
  const { t } = useTranslation("vinfast");
  const [open, setOpen] = useState(false);
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

  const filteredData =
    data?.filter((r: any) => r.direction === direction) || [];

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="center"
      glass
      content={
        <div className="p-3 min-w-[700px] w-max max-h-[400px] overflow-auto text-sm text-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center h-20 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
              {t("loading", "Đang tải...")}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center text-gray-500 p-2">
              {t("noInvoices", "Không có hóa đơn")}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 font-semibold text-center">
                    {t("invoiceDate", "Ngày HĐ")}
                  </th>
                  <th className="py-1.5 font-semibold text-center">
                    {t("invoiceNo", "Số HĐ")}
                  </th>
                  <th className="py-1.5 font-semibold text-center">
                    {t("partner", "Đối tác")}
                  </th>
                  <th className="py-1.5 font-semibold text-center">
                    {t("qty", "Số lượng")}
                  </th>
                  <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                    {t("preVatAmount", "Trước thuế GTGT")}
                  </th>
                  <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                    {t("vatRate", "Thuế suất")}
                  </th>
                  <th className="py-1.5 font-semibold text-center whitespace-nowrap">
                    {t("vatAmount", "Thuế GTGT")}
                  </th>
                  <th className="py-1.5 font-semibold text-center">
                    {t("totalAmount", "Thành tiền")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => {
                      if (onOpenInvoice && row.invoiceId) {
                        onOpenInvoice(row.invoiceId);
                        setOpen(false);
                      }
                    }}
                  >
                    <td className="py-1.5 whitespace-nowrap">
                      {row.invoiceDate}
                    </td>
                    <td className="py-1.5 whitespace-nowrap">
                      {row.invoiceNo}
                    </td>
                    <td
                      className="py-1.5 truncate max-w-[150px]"
                      title={row.partnerName}
                    >
                      {row.partnerName || "—"}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {Number(row.qty).toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {money(row.preVatAmount)}
                    </td>
                    <td className="py-1.5 text-right">
                      {row.vatRate != null
                        ? `${Number(row.vatRate) * 100}%`
                        : "—"}
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {money(row.vatAmount)}
                    </td>
                    <td className="py-1.5 text-right font-medium text-emerald-700">
                      {money(row.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-300 bg-gray-50">
                  <td
                    colSpan={3}
                    className="py-2 text-right font-semibold text-slate-700"
                  >
                    {t("total", "Tổng cộng:")}
                  </td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {filteredData
                      .reduce(
                        (acc: number, cur: any) => acc + (Number(cur.qty) || 0),
                        0,
                      )
                      .toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                  </td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {money(
                      filteredData.reduce(
                        (acc: number, cur: any) =>
                          acc + (Number(cur.preVatAmount) || 0),
                        0,
                      ),
                    )}
                  </td>
                  <td></td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {money(
                      filteredData.reduce(
                        (acc: number, cur: any) =>
                          acc + (Number(cur.vatAmount) || 0),
                        0,
                      ),
                    )}
                  </td>
                  <td className="py-2 text-right font-bold text-slate-700">
                    {money(
                      filteredData.reduce(
                        (acc: number, cur: any) =>
                          acc + (Number(cur.totalAmount) || 0),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      }
    >
      <span className="cursor-pointer font-medium text-slate-700 underline decoration-dotted decoration-slate-400 hover:text-slate-900">
        {money(price)}
      </span>
    </Popover>
  );
}
