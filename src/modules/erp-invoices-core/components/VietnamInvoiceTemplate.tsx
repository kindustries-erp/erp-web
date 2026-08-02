import { useMemo } from "react";
import { format } from "date-fns";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  invoice: ErpInvoice;
}

export function VietnamInvoiceTemplate({ invoice }: Props) {
  const {
    invoiceDate,
    invoiceNo,
    serialNo,
    sellerName,
    sellerTaxCode,
    sellerAddress,
    sellerBank,
    buyerName,
    buyerPersonalName,
    buyerCccd,
    buyerTaxCode,
    buyerAddress,
    preVatAmount,
    vatAmount,
    discountAmount,
    totalAmount,
    items,
    description,
  } = invoice;

  const dateParts = useMemo(() => {
    if (!invoiceDate) return { day: "...", month: "...", year: "..." };
    try {
      const d = new Date(invoiceDate);
      return {
        day: format(d, "dd"),
        month: format(d, "MM"),
        year: format(d, "yyyy"),
      };
    } catch {
      return { day: "...", month: "...", year: "..." };
    }
  }, [invoiceDate]);

  const formatNumber = (val: string | number | null | undefined) => {
    if (val == null) return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : new Intl.NumberFormat("vi-VN").format(num);
  };

  const norm = (str?: string | null) => (str ? str.normalize("NFC") : "---");

  return (
    <div className="w-full bg-slate-100 py-12 px-4 flex justify-center font-sans text-[15px] leading-relaxed text-slate-900">
      <div className="w-full max-w-4xl bg-white p-10 shadow-2xl ring-1 ring-slate-900/5 relative overflow-hidden">
        {/* Decorative Top Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-700" />

        {/* Header */}
        <div className="flex justify-between items-start mb-8 mt-2">
          <div className="flex-1" />
          <div className="flex-auto text-center px-4">
            <h1 className="text-2xl font-bold uppercase tracking-wide text-red-700 mb-1 whitespace-nowrap">
              Hóa Đơn Giá Trị Gia Tăng
            </h1>
            <p className="italic text-sm text-slate-600">
              Ngày {dateParts.day} tháng {dateParts.month} năm {dateParts.year}
            </p>
          </div>
          <div className="flex-1 text-right text-sm">
            <p>
              Ký hiệu:{" "}
              <span className="font-semibold">{serialNo || "---"}</span>
            </p>
            <p>
              Số: <span className="font-semibold">{invoiceNo || "---"}</span>
            </p>
          </div>
        </div>

        {/* Seller */}
        <div className="border-t border-b border-dashed border-slate-200 py-4 mb-5">
          <p>
            Tên người bán:{" "}
            <span className="font-bold uppercase">{norm(sellerName)}</span>
          </p>
          <p>Mã số thuế: {norm(sellerTaxCode)}</p>
          <p>Địa chỉ: {norm(sellerAddress)}</p>
          {sellerBank && <p>Số tài khoản: {norm(sellerBank)}</p>}
        </div>

        {/* Buyer */}
        <div className="mb-6 space-y-1">
          <p>
            Họ tên người mua hàng:{" "}
            <span className="font-medium">{norm(buyerPersonalName)}</span>
          </p>
          {buyerCccd && <p>CCCD người mua: {norm(buyerCccd)}</p>}
          <p>
            Tên đơn vị:{" "}
            <span className="font-medium uppercase">{norm(buyerName)}</span>
          </p>
          <p>Mã số thuế: {norm(buyerTaxCode)}</p>
          <p>Địa chỉ: {norm(buyerAddress)}</p>
          {description && (
            <div>
              <p>Diễn giải chung:</p>
              <ul className="list-disc pl-8 mt-1 space-y-0.5">
                {description
                  .split(/\\n|\n/)
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, idx) => (
                    <li key={idx}>{norm(line)}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-center font-bold text-slate-700">
                <th className="border border-slate-300 p-2.5 w-12">STT</th>
                <th className="border border-slate-300 p-2.5">
                  Tên hàng hóa, dịch vụ
                </th>
                <th className="border border-slate-300 p-2.5 w-20">ĐVT</th>
                <th className="border border-slate-300 p-2.5 w-20">Số lượng</th>
                <th className="border border-slate-300 p-2.5 w-28">Đơn giá</th>
                <th className="border border-slate-300 p-2.5 w-20">
                  Chiết khấu
                </th>
                <th className="border border-slate-300 p-2.5 w-20">
                  Thuế suất
                </th>
                <th className="border border-slate-300 p-2.5 w-32">
                  Thành tiền chưa có thuế GTGT
                </th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item, index) => (
                <tr
                  key={item.id || index}
                  className="even:bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <td className="border border-slate-300 p-2.5 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-slate-300 p-2.5">
                    {item.description ? item.description.normalize("NFC") : ""}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    {item.unit ? item.unit.normalize("NFC") : ""}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-right">
                    {item.quantity ? formatNumber(item.quantity) : ""}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-right">
                    {item.unitPrice ? formatNumber(item.unitPrice) : ""}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-right">
                    {formatNumber(item.discountAmount)}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-center">
                    {item.vatRate != null
                      ? `${Number(item.vatRate) * 100}%`
                      : ""}
                  </td>
                  <td className="border border-slate-300 p-2.5 text-right">
                    {formatNumber(item.preVatAmount)}
                  </td>
                </tr>
              ))}
              {/* Totals */}
              <tr className="font-medium bg-slate-50/30">
                <td
                  colSpan={7}
                  className="border border-slate-300 p-2.5 text-right"
                >
                  Tổng cộng tiền chưa thuế:
                </td>
                <td className="border border-slate-300 p-2.5 text-right">
                  {formatNumber(preVatAmount)}
                </td>
              </tr>
              <tr className="font-medium bg-slate-50/30">
                <td
                  colSpan={7}
                  className="border border-slate-300 p-2.5 text-right"
                >
                  Tổng tiền thuế:
                </td>
                <td className="border border-slate-300 p-2.5 text-right">
                  {formatNumber(vatAmount)}
                </td>
              </tr>
              <tr className="font-medium bg-slate-50/30">
                <td
                  colSpan={7}
                  className="border border-slate-300 p-2.5 text-right"
                >
                  Tổng chiết khấu:
                </td>
                <td className="border border-slate-300 p-2.5 text-right">
                  {formatNumber(discountAmount)}
                </td>
              </tr>
              <tr className="font-bold bg-slate-50/80">
                <td
                  colSpan={7}
                  className="border border-slate-300 p-3 text-right text-red-700 text-base"
                >
                  Tổng tiền thanh toán:
                </td>
                <td className="border border-slate-300 p-3 text-right text-red-700 text-base">
                  {formatNumber(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-start pt-8 pb-20 font-bold text-center">
          <div className="flex-1">
            <p>NGƯỜI MUA HÀNG</p>
            <p className="font-normal text-sm italic mt-1 text-slate-600">
              (Ký, ghi rõ họ tên)
            </p>
          </div>
          <div className="flex-1 relative">
            <p>NGƯỜI BÁN HÀNG</p>
            <p className="font-normal text-sm italic mt-1 text-slate-600">
              (Ký, ghi rõ họ tên)
            </p>

            <div className="mt-8 mx-auto w-72 border-2 border-red-600 rounded-lg p-3 text-red-700 text-left bg-white shadow-sm transform -rotate-2 relative z-10">
              <p
                className="font-bold text-sm uppercase mb-1 line-clamp-2"
                title={norm(sellerName)}
              >
                Ký bởi: {norm(sellerName)}
              </p>
              <p className="text-xs">
                Ký ngày: {dateParts.day}/{dateParts.month}/{dateParts.year}
              </p>
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <svg
                  className="w-20 h-20"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <circle cx="50" cy="50" r="45" />
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    className="text-[16px] font-bold tracking-widest"
                  >
                    HỢP LỆ
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
