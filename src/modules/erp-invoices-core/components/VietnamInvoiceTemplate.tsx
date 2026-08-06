import { useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  invoice: ErpInvoice;
}

export function VietnamInvoiceTemplate({ invoice }: Props) {
  const { t } = useTranslation("erpInvoices");

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

        {/* Footer */}
        <div className="flex justify-between items-start pt-8 pb-20 font-bold text-center">
          <div className="flex-1">
            <p>{t("invoiceTemplate.buyerSigner", "NGƯỜI MUA HÀNG")}</p>
            <p className="font-normal text-sm italic mt-1 text-slate-600">
              {t("invoiceTemplate.signerHint", "(Ký, ghi rõ họ tên)")}
            </p>
          </div>
          <div className="flex-1 relative">
            <p>{t("invoiceTemplate.sellerSigner", "NGƯỜI BÁN HÀNG")}</p>
            <p className="font-normal text-sm italic mt-1 text-slate-600">
              {t("invoiceTemplate.signerHint", "(Ký, ghi rõ họ tên)")}
            </p>

            <div className="mt-8 mx-auto w-[320px] rounded-xl border border-emerald-300/70 bg-gradient-to-br from-white via-emerald-50/40 to-white p-3.5 text-slate-700 text-left shadow-[4px_10px_24px_-12px_rgba(5,150,105,0.45)] relative z-10">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-white">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {t("invoiceTemplate.stamp.valid", "ĐÃ KÝ SỐ HỢP LỆ")}
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-[0.06em]">
                  {t("invoiceTemplate.stamp.brand", "Hóa đơn điện tử")}
                </div>
              </div>

              <p
                className="font-bold text-sm uppercase mb-1.5 line-clamp-2 text-slate-800"
                title={norm(sellerName)}
              >
                {norm(sellerName)}
              </p>

              <div className="space-y-0.5 text-[11px] text-slate-600">
                <p>
                  {t("invoiceTemplate.stamp.signedDate", "Ký ngày")}: {dateParts.day}/{dateParts.month}/{dateParts.year}
                </p>
                <p>
                  {t("invoiceTemplate.stamp.invoiceNo", "Số hóa đơn")}: {invoiceNo || "---"}
                </p>
                <p>
                  {t("invoiceTemplate.stamp.serialNo", "Ký hiệu")}: {serialNo || "---"}
                </p>
              </div>

              <div className="pointer-events-none absolute right-2 bottom-2 inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white/90 p-1.5 shadow-sm">
                <svg
                  className="h-3.5 w-3.5 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
