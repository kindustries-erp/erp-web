import React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerRow } from "@/v2/shared/components/molecules/v2-drawer-field";
import { Sparkles } from "lucide-react";

export const MockInvoiceTable = () => (
  <div className="overflow-x-auto rounded-lg border border-border/70">
    <table className="w-full text-xs text-left">
      <thead className="bg-muted/50 border-b border-border/60">
        <tr>
          <th className="py-2 px-3 font-semibold text-muted-foreground w-8">
            #
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground">
            DIỄN GIẢI
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-center">
            ĐVT
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
            SỐ LƯỢNG
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
            ĐƠN GIÁ
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-center">
            CHIẾT KHẤU
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-center">
            THUẾ SUẤT
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
            THUẾ GTGT
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
            TRƯỚC GTGT
          </th>
          <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
            THÀNH TIỀN
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        <tr>
          <td className="py-2 px-3 text-muted-foreground">1</td>
          <td className="py-2 px-3 font-medium">
            Cước phí vận chuyển mã 01M40Q654AZ3A7QY1HB49Z6SWJ
          </td>
          <td className="py-2 px-3 text-center">CHUYẾN</td>
          <td className="py-2 px-3 text-right">1</td>
          <td className="py-2 px-3 text-right">58.744 đ</td>
          <td className="py-2 px-3 text-center">-</td>
          <td className="py-2 px-3 text-center">8%</td>
          <td className="py-2 px-3 text-right">4.700 đ</td>
          <td className="py-2 px-3 text-right">58.744 đ</td>
          <td className="py-2 px-3 text-right font-medium">63.444 đ</td>
        </tr>
        <tr>
          <td className="py-2 px-3 text-muted-foreground">2</td>
          <td className="py-2 px-3 font-medium">
            Chiết khấu thương mại giảm giá mã 01M40Q654AZ3A7QY1HB49Z6SWJ
          </td>
          <td className="py-2 px-3 text-center">CHUYẾN</td>
          <td className="py-2 px-3 text-right">1</td>
          <td className="py-2 px-3 text-right text-destructive">-5.556 đ</td>
          <td className="py-2 px-3 text-center">-</td>
          <td className="py-2 px-3 text-center">8%</td>
          <td className="py-2 px-3 text-right text-destructive">-444 đ</td>
          <td className="py-2 px-3 text-right text-destructive">-5.556 đ</td>
          <td className="py-2 px-3 text-right font-medium text-destructive">
            -6.000 đ
          </td>
        </tr>
        <tr>
          <td className="py-2 px-3 text-muted-foreground">3</td>
          <td className="py-2 px-3 font-medium">
            Phí nền tảng mã 01M40Q654AZ3A7QY1HB49Z6SWJ
          </td>
          <td className="py-2 px-3 text-center">CHUYẾN</td>
          <td className="py-2 px-3 text-right">1</td>
          <td className="py-2 px-3 text-right">4.219 đ</td>
          <td className="py-2 px-3 text-center">-</td>
          <td className="py-2 px-3 text-center">8%</td>
          <td className="py-2 px-3 text-right">338 đ</td>
          <td className="py-2 px-3 text-right">4.219 đ</td>
          <td className="py-2 px-3 text-right font-medium">4.557 đ</td>
        </tr>
      </tbody>
      <tfoot className="bg-muted/30 border-t border-border font-semibold text-xs">
        <tr>
          <td colSpan={2} className="py-2 px-3">
            Tổng cộng:
          </td>
          <td className="py-2 px-3 text-center">-</td>
          <td className="py-2 px-3 text-right">3</td>
          <td className="py-2 px-3 text-right">-</td>
          <td className="py-2 px-3 text-center">-</td>
          <td className="py-2 px-3 text-center">-</td>
          <td className="py-2 px-3 text-right font-bold">5.402 đ</td>
          <td className="py-2 px-3 text-right font-bold">68.519 đ</td>
          <td className="py-2 px-3 text-right font-bold text-foreground">
            74.001 đ
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export const MockInvoiceRightPanel = () => (
  <>
    <DrawerSection title="THÔNG TIN CHUNG">
      <DrawerRow label="Số HĐ" value="# 65114302" copyable />
      <DrawerRow label="Ký hiệu" value="C26THD" copyable />
      <DrawerRow
        label="Bên bán"
        value="CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM"
        copyable
      />
      <DrawerRow label="MST" value="0110285067" copyable />
      <DrawerRow label="Chi nhánh" value="-" />
      <DrawerRow label="Ngày HĐ" value="03/10/2026" />
      <DrawerRow
        label="Ghi chú"
        value="Cước phí vận chuyển mã 01M40Q654AZ3A7QY1HB49Z6SWJ"
      />
      <DrawerRow label="Thẻ nhãn" value="-" />
    </DrawerSection>

    <DrawerSection title="THUỘC TÍNH MẶC ĐỊNH">
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-fg font-medium">
            Phân loại hóa đơn mua vào
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-fg bg-muted px-2 py-0.5 rounded">
              Mặc định
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              AI Phân loại
            </button>
          </div>
        </div>

        <div className="p-2.5 rounded-lg border border-border/70 bg-surface/60">
          <div className="font-medium text-foreground">
            [TK 6427] Giao nhận & Vận chuyển (...)
          </div>
          <div className="mt-1 text-[11px] text-muted-fg">
            Hạch toán: Nợ 6427 / Nợ 1331 / Có 331 (Giao nhận (Grab, 911, Bưu
            chính))
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-muted-fg font-medium">HĐ hợp lệ</span>
          <span className="text-[11px] text-muted-fg bg-muted px-2 py-0.5 rounded">
            Mặc định
          </span>
        </div>
      </div>
    </DrawerSection>
  </>
);
