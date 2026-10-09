import React from "react";
import { CheckCircle2 } from "lucide-react";

export const MockInvoicePdfCanvas = ({ zoom }: { zoom: number }) => (
  <div className="overflow-x-auto p-4 rounded-xl border border-border/80 bg-zinc-200/50 dark:bg-zinc-950 flex justify-center">
    <div
      style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top" }}
      className="w-full max-w-[650px] bg-white text-zinc-900 rounded shadow-md p-6 border border-zinc-300 text-xs transition-transform duration-200 space-y-4"
    >
      {/* Header */}
      <div className="text-center border-b border-zinc-200 pb-3">
        <div className="font-bold text-[10px] text-zinc-600 uppercase tracking-widest">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </div>
        <div className="text-[9px] text-zinc-500">
          Độc lập - Tự do - Hạnh phúc
        </div>
        <div className="mt-2 text-base font-extrabold tracking-tight text-zinc-900">
          HÓA ĐƠN GIÁ TRỊ GIA TĂNG
        </div>
        <div className="text-[10px] text-zinc-500">
          (Bản thể hiện của hóa đơn điện tử)
        </div>
        <div className="mt-1 font-mono text-[11px] text-zinc-700">
          Ký hiệu: <strong>C26THD</strong> • Số: <strong>65114302</strong> •
          Ngày: 03/10/2026
        </div>
      </div>

      {/* Seller / Buyer info */}
      <div className="grid grid-cols-2 gap-4 text-[11px] py-1 border-b border-zinc-200">
        <div>
          <div className="font-semibold text-zinc-800">Đơn vị bán hàng:</div>
          <div>CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM</div>
          <div>MST: 0110285067</div>
        </div>
        <div>
          <div className="font-semibold text-zinc-800">Đơn vị mua hàng:</div>
          <div>CÔNG TY CỔ PHẦN LIOUNI INDUSTRIES</div>
          <div>MST: 0317899999</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-[10px] border border-zinc-300 text-left">
        <thead className="bg-zinc-100 font-semibold border-b border-zinc-300">
          <tr>
            <th className="p-1.5 border-r border-zinc-300">STT</th>
            <th className="p-1.5 border-r border-zinc-300">Tên dịch vụ</th>
            <th className="p-1.5 border-r border-zinc-300 text-center">ĐVT</th>
            <th className="p-1.5 border-r border-zinc-300 text-right">
              Số lượng
            </th>
            <th className="p-1.5 border-r border-zinc-300 text-right">
              Đơn giá
            </th>
            <th className="p-1.5 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          <tr>
            <td className="p-1.5 border-r border-zinc-300">1</td>
            <td className="p-1.5 border-r border-zinc-300 font-medium">
              Cước vận chuyển GSM Taxi
            </td>
            <td className="p-1.5 border-r border-zinc-300 text-center">
              Chuyến
            </td>
            <td className="p-1.5 border-r border-zinc-300 text-right">1</td>
            <td className="p-1.5 border-r border-zinc-300 text-right font-mono">
              58.744 đ
            </td>
            <td className="p-1.5 text-right font-mono">58.744 đ</td>
          </tr>
          <tr>
            <td className="p-1.5 border-r border-zinc-300">2</td>
            <td className="p-1.5 border-r border-zinc-300 text-red-600 font-medium">
              Chiết khấu thương mại giảm giá
            </td>
            <td className="p-1.5 border-r border-zinc-300 text-center">
              Chuyến
            </td>
            <td className="p-1.5 border-r border-zinc-300 text-right">1</td>
            <td className="p-1.5 border-r border-zinc-300 text-right font-mono text-red-600">
              -5.556 đ
            </td>
            <td className="p-1.5 text-right font-mono text-red-600">
              -5.556 đ
            </td>
          </tr>
          <tr>
            <td className="p-1.5 border-r border-zinc-300">3</td>
            <td className="p-1.5 border-r border-zinc-300 font-medium">
              Phí dịch vụ nền tảng
            </td>
            <td className="p-1.5 border-r border-zinc-300 text-center">
              Chuyến
            </td>
            <td className="p-1.5 border-r border-zinc-300 text-right">1</td>
            <td className="p-1.5 border-r border-zinc-300 text-right font-mono">
              4.219 đ
            </td>
            <td className="p-1.5 text-right font-mono">4.219 đ</td>
          </tr>
        </tbody>
        <tfoot className="bg-zinc-50 font-bold border-t border-zinc-300">
          <tr>
            <td colSpan={5} className="p-1.5 text-right">
              Tổng tiền thanh toán (bao gồm 8% thuế GTGT):
            </td>
            <td className="p-1.5 text-right font-mono text-emerald-700">
              74.001 đ
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signature badge */}
      <div className="flex justify-end pt-3">
        <div className="border border-emerald-600/60 rounded-lg p-2.5 bg-emerald-50 text-[10px] text-emerald-800 space-y-0.5">
          <div className="flex items-center gap-1 font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ĐÃ KÝ ĐIỆN TỬ HỢP LỆ
          </div>
          <div>Người ký: CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM</div>
          <div className="font-mono text-[9px] text-emerald-600">
            Thời gian ký: 03/10/2026 14:32:10 GMT+7
          </div>
        </div>
      </div>
    </div>
  </div>
);
