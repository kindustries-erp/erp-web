import { MoreHorizontal } from "lucide-react";
import { Popover } from "@/core/components/ui/Popover";
import { useQuery } from "@tanstack/react-query";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "../api/salesOrdersCoreApi";

export function DeliveryDetailPopover({ item }: { item: ErpSalesOrder }) {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-order-detail", item.id],
    queryFn: () => salesOrdersCoreApi.get(item.id),
    staleTime: 1000 * 60 * 5,
  });

  const itemAny = item as any;
  const displayDate = itemAny.deliveredDate;
  const dateStr = displayDate
    ? new Date(displayDate).toLocaleDateString("vi-VN")
    : "—";

  const hasSerialLifecycles = Boolean(data?.serialLifecycles?.length);

  return (
    <Popover
      content={
        <div className="p-3 max-h-[400px] max-w-[800px] max-w-[90vw] overflow-auto">
          <h4 className="font-semibold text-sm mb-3 text-slate-800 dark:text-slate-200">
            Chi tiết đợt giao hàng
          </h4>
          {isLoading ? (
            <div className="text-sm text-slate-500 py-2">Đang tải...</div>
          ) : hasSerialLifecycles ? (
            <table className="w-full text-sm text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium">
                    Số Seri
                  </th>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium">
                    Số Khung
                  </th>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium">
                    Số Máy
                  </th>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-center">
                    Ngày giao
                  </th>
                </tr>
              </thead>
              <tbody>
                {data!.serialLifecycles!.map((sl: any) => {
                  const deliveryDateStr = sl.deliveryDate
                    ? new Date(sl.deliveryDate).toLocaleDateString("vi-VN")
                    : "—";
                  return (
                    <tr
                      key={sl.id}
                      className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        {sl.serialNo || "—"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {sl.vinNo || "—"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {sl.engineNo || "—"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        {deliveryDateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : data?.goodsIssues && data.goodsIssues.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse min-w-[400px]">
              <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium">
                    Phiếu xuất
                  </th>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-center">
                    Ngày giao
                  </th>
                  <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium">
                    Xe / Biển số
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.goodsIssues.map((gi: any) => {
                  const firstLine = gi.lines?.[0] || {};
                  const vehicleInfo =
                    firstLine.vehicleVin ||
                    firstLine.vehicleId ||
                    gi.remarks ||
                    "—";
                  const deliveryConfirmDate =
                    gi.updatedAt || gi.createdAt || gi.issueDate;
                  return (
                    <tr
                      key={gi.id}
                      className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        {gi.issueNo}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        {deliveryConfirmDate
                          ? new Date(deliveryConfirmDate).toLocaleDateString(
                              "vi-VN",
                            )
                          : "—"}
                      </td>
                      <td className="px-2 py-2">{vehicleInfo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-slate-500 text-sm italic py-2">
              Chưa có chi tiết giao hàng.
            </div>
          )}
        </div>
      }
    >
      <div className="group relative flex w-full cursor-pointer hover:text-primary items-center justify-center h-full min-h-[24px]">
        <span>{dateStr}</span>
        <div className="absolute right-0 opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:text-primary" />
        </div>
      </div>
    </Popover>
  );
}
