import React from "react";
import { format } from "date-fns";
import { type CompanyProfile } from "@/core/api/companyProfileApi";

export interface GoodsReceiptPrintData {
  receiptNo: string;
  receiptDate: string;
  supplierName?: string;
  poNo?: string;
  remarks?: string;
  lines: Array<{
    itemId: string;
    itemCode?: string;
    itemName: string;
    qtyReceived: string;
    unitCost?: string;
  }>;
}

interface Props {
  companyProfile?: CompanyProfile | null;
  data: GoodsReceiptPrintData | null;
}

export const GoodsReceiptPrintTemplate = React.forwardRef<
  HTMLDivElement,
  Props
>(({ companyProfile, data }, ref) => {
  if (!data) return null;

  const date = data.receiptDate ? new Date(data.receiptDate) : new Date();

  return (
    <div
      ref={ref}
      className="bg-white text-black font-serif print:p-0"
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        padding: "10mm",
        fontSize: "14px",
        lineHeight: "1.5",
      }}
    >
      <style type="text/css" media="print">
        {`
            @page { size: A4 portrait; margin: 10mm; }
            html, body { background-color: white !important; }
            body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
          `}
      </style>

      <div className="flex justify-between items-start mb-6">
        <div className="max-w-[50%]">
          <div className="font-bold uppercase">
            {companyProfile?.company_name ||
              "Đơn vị: ............................"}
          </div>
          <div>
            {companyProfile?.address || "Địa chỉ: ............................"}
          </div>
          <div>Bộ phận: ............................</div>
        </div>
        <div className="text-center font-bold">
          <div className="text-lg">Mẫu số 01 - VT</div>
          <div className="text-sm font-normal italic">
            (Kèm theo Thông tư số 99/2025/TT-BTC <br />
            ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1">Phiếu Nhập Kho</h1>
        <div className="italic mb-2">
          Ngày {format(date, "dd")} tháng {format(date, "MM")} năm{" "}
          {format(date, "yyyy")}
        </div>
        <div className="flex justify-center gap-8 font-medium">
          <div>Số: {data.receiptNo}</div>
          <div>Nợ: ............</div>
          <div>Có: ............</div>
        </div>
      </div>

      <div className="mb-4 space-y-1">
        <div>
          - Họ và tên người giao:{" "}
          {data.supplierName ||
            ".........................................................................................."}
        </div>
        <div>
          - Theo .............................. số{" "}
          {data.poNo || ".............."} ngày ...... tháng ...... năm .........
          của ....................................
        </div>
        <div>
          - Nhập tại kho: ......................................................
          địa điểm ............................................................
        </div>
        <div>
          - Ghi chú:{" "}
          {data.remarks ||
            ".........................................................................................."}
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              rowSpan={2}
            >
              STT
            </th>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              rowSpan={2}
            >
              Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ sản phẩm, hàng
              hóa
            </th>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              rowSpan={2}
            >
              Mã số
            </th>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              rowSpan={2}
            >
              Đơn vị tính
            </th>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              colSpan={2}
            >
              Số lượng
            </th>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              rowSpan={2}
            >
              Đơn giá
            </th>
            <th
              className="border border-black p-1 text-center font-bold align-middle"
              rowSpan={2}
            >
              Thành tiền
            </th>
          </tr>
          <tr>
            <th className="border border-black p-1 text-center font-bold">
              Theo chứng từ
            </th>
            <th className="border border-black p-1 text-center font-bold">
              Thực nhập
            </th>
          </tr>
          <tr>
            <th className="border border-black p-1 text-center font-normal">
              A
            </th>
            <th className="border border-black p-1 text-center font-normal">
              B
            </th>
            <th className="border border-black p-1 text-center font-normal">
              C
            </th>
            <th className="border border-black p-1 text-center font-normal">
              D
            </th>
            <th className="border border-black p-1 text-center font-normal">
              1
            </th>
            <th className="border border-black p-1 text-center font-normal">
              2
            </th>
            <th className="border border-black p-1 text-center font-normal">
              3
            </th>
            <th className="border border-black p-1 text-center font-normal">
              4
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((line, idx) => {
            const qty = Number(line.qtyReceived) || 0;
            const cost = Number(line.unitCost) || 0;
            return (
              <tr key={idx}>
                <td className="border border-black p-1 text-center">
                  {idx + 1}
                </td>
                <td className="border border-black p-1">{line.itemName}</td>
                <td className="border border-black p-1 text-center">
                  {line.itemCode || line.itemId}
                </td>
                <td className="border border-black p-1 text-center"></td>
                <td className="border border-black p-1 text-right"></td>
                <td className="border border-black p-1 text-right">
                  {qty > 0 ? qty.toLocaleString("vi-VN") : ""}
                </td>
                <td className="border border-black p-1 text-right">
                  {cost > 0 ? cost.toLocaleString("vi-VN") : ""}
                </td>
                <td className="border border-black p-1 text-right">
                  {qty > 0 && cost > 0
                    ? (qty * cost).toLocaleString("vi-VN")
                    : ""}
                </td>
              </tr>
            );
          })}
          <tr>
            <td
              className="border border-black p-1 text-center font-bold"
              colSpan={4}
            >
              Cộng
            </td>
            <td className="border border-black p-1 text-center">x</td>
            <td className="border border-black p-1 text-center font-bold">
              {data.lines
                .reduce((sum, l) => sum + (Number(l.qtyReceived) || 0), 0)
                .toLocaleString("vi-VN")}
            </td>
            <td className="border border-black p-1 text-center">x</td>
            <td className="border border-black p-1 text-right font-bold">
              {data.lines
                .reduce(
                  (sum, l) =>
                    sum +
                    (Number(l.qtyReceived) || 0) * (Number(l.unitCost) || 0),
                  0,
                )
                .toLocaleString("vi-VN")}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6 space-y-1">
        <div>
          - Tổng số tiền (viết bằng chữ):
          ........................................................................................................................
        </div>
        <div>
          - Số chứng từ gốc kèm theo:
          ........................................................................................................................
        </div>
      </div>

      <div className="flex justify-end mb-2 pr-12">
        <div className="italic">
          Ngày {format(date, "dd")} tháng {format(date, "MM")} năm{" "}
          {format(date, "yyyy")}
        </div>
      </div>

      <div className="flex justify-between text-center pb-20">
        <div className="flex-1">
          <div className="font-bold mb-1">Người lập phiếu</div>
          <div className="italic text-sm">(Ký, họ tên)</div>
        </div>
        <div className="flex-1">
          <div className="font-bold mb-1">Người giao hàng</div>
          <div className="italic text-sm">(Ký, họ tên)</div>
        </div>
        <div className="flex-1">
          <div className="font-bold mb-1">Thủ kho</div>
          <div className="italic text-sm">(Ký, họ tên)</div>
        </div>
        <div className="flex-1">
          <div className="font-bold mb-1">Kế toán trưởng</div>
          <div className="italic text-sm">(Hoặc bộ phận có nhu cầu nhập)</div>
          <div className="italic text-sm">(Ký, họ tên)</div>
        </div>
        <div className="flex-1">
          <div className="font-bold mb-1">Giám đốc</div>
          <div className="italic text-sm">(Ký, họ tên)</div>
        </div>
      </div>
    </div>
  );
});
GoodsReceiptPrintTemplate.displayName = "GoodsReceiptPrintTemplate";
