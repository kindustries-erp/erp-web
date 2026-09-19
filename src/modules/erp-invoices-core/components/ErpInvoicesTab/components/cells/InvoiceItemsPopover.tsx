import React from "react";
import { fmtAmt } from "../../utils";

export interface InvoiceItemsPopoverProps {
  items?: any[];
}

export const InvoiceItemsPopover = React.memo(function InvoiceItemsPopover({
  items,
}: InvoiceItemsPopoverProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-3 max-h-[350px] w-[300px] text-slate-500 text-sm italic">
        Không có chi tiết mặt hàng.
      </div>
    );
  }

  const totalQuantity = items.reduce(
    (acc: number, item: any) => acc + (Number(item.quantity) || 0),
    0,
  );

  const totalPreVatAmount = items.reduce(
    (acc: number, item: any) => acc + (Number(item.preVatAmount) || 0),
    0,
  );

  const totalVatAmount = items.reduce((acc: number, item: any) => {
    const compVatAmt =
      Number(item.vatAmount) ||
      (Number(item.preVatAmount) || 0) * (Number(item.vatRate) || 0);
    return acc + compVatAmt;
  }, 0);

  const totalTotalAmount = items.reduce((acc: number, item: any) => {
    const compVatAmt =
      Number(item.vatAmount) ||
      (Number(item.preVatAmount) || 0) * (Number(item.vatRate) || 0);
    return acc + (Number(item.preVatAmount) || 0) + compVatAmt;
  }, 0);

  return (
    <div className="p-3 max-h-[350px] w-[620px] max-w-[90vw] overflow-auto flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
          Chi tiết mặt hàng ({items.length})
        </h4>
      </div>
      <div className="overflow-x-auto border border-slate-200/80 dark:border-zinc-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse min-w-[580px]">
          <thead className="bg-slate-100/90 dark:bg-zinc-800/90 sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-left">
                Tên mặt hàng
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-right w-[45px]">
                SL
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-left w-[45px]">
                ĐVT
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-right w-[85px]">
                Đơn giá
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-right w-[95px]">
                Tiền trước thuế
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-right w-[50px]">
                VAT
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-right w-[85px]">
                Tiền VAT
              </th>
              <th className="px-2 py-1.5 border-b text-slate-600 dark:text-slate-400 font-medium text-right w-[100px]">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {items.map((item: any, idx: number) => {
              const compVatAmt =
                Number(item.vatAmount) ||
                (Number(item.preVatAmount) || 0) * (Number(item.vatRate) || 0);
              const compTotalAmt =
                (Number(item.preVatAmount) || 0) + compVatAmt;
              return (
                <tr
                  key={item.id || idx}
                  className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-2 py-1.5 whitespace-normal break-words max-w-[170px] text-slate-800 dark:text-slate-200">
                    {item.description || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-400">
                    {item.quantity != null
                      ? Number(item.quantity).toLocaleString("vi-VN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 1,
                        })
                      : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-left whitespace-nowrap text-slate-500">
                    {item.unit || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-slate-700 dark:text-slate-300">
                    {fmtAmt(item.unitPrice?.toString())}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap font-medium tabular-nums text-slate-800 dark:text-slate-200">
                    {fmtAmt(item.preVatAmount?.toString())}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-slate-500">
                    {item.vatRate != null
                      ? `${(Number(item.vatRate) * 100).toFixed(0)}%`
                      : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap tabular-nums text-slate-700 dark:text-slate-300">
                    {fmtAmt(compVatAmt.toString())}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {fmtAmt(compTotalAmt.toString())}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100/90 dark:bg-zinc-800/90 sticky bottom-0 border-t border-slate-200 dark:border-zinc-700 font-semibold z-10">
            <tr>
              <td className="px-2 py-1.5 text-right text-slate-700 dark:text-slate-300">
                Tổng cộng
              </td>
              <td className="px-2 py-1.5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                {totalQuantity.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                })}
              </td>
              <td className="px-2 py-1.5" />
              <td className="px-2 py-1.5" />
              <td className="px-2 py-1.5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                {fmtAmt(totalPreVatAmount.toString())}
              </td>
              <td className="px-2 py-1.5" />
              <td className="px-2 py-1.5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                {fmtAmt(totalVatAmount.toString())}
              </td>
              <td className="px-2 py-1.5 text-right text-slate-900 dark:text-slate-100 tabular-nums font-bold">
                {fmtAmt(totalTotalAmount.toString())}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
});
