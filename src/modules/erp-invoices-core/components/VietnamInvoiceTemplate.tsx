import { useMemo } from "react";
import { format } from "date-fns";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { normalizeOutInvoiceLineDisplay } from "../utils/outInvoiceDisplay";

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
    direction,
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

  const displayItems = useMemo(() => {
    const descriptionLineCount = String(description || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length;
    const invoiceLineCount = Math.max(
      (items || []).length,
      descriptionLineCount,
      1,
    );
    return (items || []).map((item) =>
      normalizeOutInvoiceLineDisplay(
        item as any,
        buyerTaxCode,
        direction,
        invoiceLineCount,
      ),
    );
  }, [buyerTaxCode, description, direction, items]);

  const formatNumber = (val: string | number | null | undefined) => {
    if (val == null) return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : new Intl.NumberFormat("vi-VN").format(num);
  };

  const norm = (str?: string | null) => (str ? str.normalize("NFC") : "---");

  return (
    <div
      className="w-full text-[15px] leading-relaxed text-slate-700"
      style={{ fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif' }}
    >
      <div className="w-full bg-surface border border-border p-5 md:p-8 card-shadow relative overflow-hidden rounded-[20px]">
        {/* Decorative Top Stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-700" />

        {/* Header */}
        <div className="flex justify-between items-start mb-8 mt-2">
          <div className="flex-1" />
          <div className="flex-auto text-center px-4">
            <h1 className="text-2xl font-semibold uppercase tracking-wide text-slate-800 mb-1 whitespace-nowrap">
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
        <div className="border-t border-b border-dashed border-slate-300 py-4 mb-5">
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
        <div className="mb-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="max-h-[440px] overflow-auto">
            <table className="w-full border-collapse border-0 text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                <tr className="text-center font-bold text-slate-700">
                  <th className="border border-slate-300 p-2.5 w-12">STT</th>
                  <th className="border border-slate-300 p-2.5">
                    Tên hàng hóa, dịch vụ
                  </th>
                  <th className="border border-slate-300 p-2.5 w-20">ĐVT</th>
                  <th className="border border-slate-300 p-2.5 w-20">
                    Số lượng
                  </th>
                  <th className="border border-slate-300 p-2.5 w-28">
                    Đơn giá
                  </th>
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
                {displayItems.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="even:bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="border border-slate-300 p-2.5 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 p-2.5">
                      {item.description
                        ? item.description.normalize("NFC")
                        : ""}
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
                    {formatNumber(
                      displayItems.reduce(
                        (acc, item) => acc + (Number(item.discountAmount) || 0),
                        0,
                      ) || discountAmount,
                    )}
                  </td>
                </tr>
                <tr className="font-bold bg-slate-50/80">
                  <td
                    colSpan={7}
                    className="border border-slate-300 p-3 text-right text-slate-800 text-base"
                  >
                    Tổng tiền thanh toán:
                  </td>
                  <td className="border border-slate-300 p-3 text-right text-slate-800 text-base">
                    {formatNumber(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
