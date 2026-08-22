import React from "react";
import { fmtAmt } from "../../utils";

export interface InvoiceItemsPopoverProps {
  items?: any[];
}

export function InvoiceItemsPopover({ items }: InvoiceItemsPopoverProps) {
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
    <div className="p-3 max-h-[350px] w-[850px] max-w-[90vw] overflow-auto">
      <h4 className="font-semibold text-sm mb-2 text-slate-800">
        Chi tiết mặt hàng
      </h4>
      <table className="w-full text-sm text-left border-collapse min-w-[700px]">
        <thead className="bg-slate-100/60 sticky top-0 backdrop-blur-sm">
          <tr>
            <th className="px-2 py-1 border-b text-slate-600 font-medium">
              Tên mặt hàng
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
              SL
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-left">
              ĐVT
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
              Đơn giá
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
              Thành tiền trước thuế
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
              Thuế suất
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
              Thuế VAT
            </th>
            <th className="px-2 py-1 border-b text-slate-600 font-medium text-right">
              Thành tiền
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => {
            const compVatAmt =
              Number(item.vatAmount) ||
              (Number(item.preVatAmount) || 0) * (Number(item.vatRate) || 0);
            const compTotalAmt = (Number(item.preVatAmount) || 0) + compVatAmt;
            return (
              <tr
                key={item.id || idx}
                className="border-b last:border-0 hover:bg-slate-50"
              >
                <td className="px-2 py-1 whitespace-normal break-words max-w-[200px]">
                  {item.description || "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {item.quantity != null
                    ? Number(item.quantity).toLocaleString("vi-VN", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })
                    : "—"}
                </td>
                <td className="px-2 py-1 text-left whitespace-nowrap">
                  {item.unit || "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {fmtAmt(item.unitPrice?.toString())}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap font-medium">
                  {fmtAmt(item.preVatAmount?.toString())}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {item.vatRate != null
                    ? `${(Number(item.vatRate) * 100).toFixed(0)}%`
                    : "—"}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  {fmtAmt(compVatAmt.toString())}
                </td>
                <td className="px-2 py-1 text-right whitespace-nowrap font-semibold text-slate-800">
                  {fmtAmt(compTotalAmt.toString())}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="table-footer-glass sticky bottom-0 border-t border-border shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
          <tr>
            <td className="px-2 py-2 font-semibold text-right text-slate-700">
              Tổng cộng
            </td>
            <td className="px-2 py-2 font-semibold text-right text-slate-700">
              {totalQuantity.toLocaleString("vi-VN", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </td>
            <td className="px-2 py-2" />
            <td className="px-2 py-2" />
            <td className="px-2 py-2 font-semibold text-right text-slate-700">
              {fmtAmt(totalPreVatAmount.toString())}
            </td>
            <td className="px-2 py-2" />
            <td className="px-2 py-2 font-semibold text-right text-slate-700">
              {fmtAmt(totalVatAmount.toString())}
            </td>
            <td className="px-2 py-2 font-semibold text-right text-slate-800">
              {fmtAmt(totalTotalAmount.toString())}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
