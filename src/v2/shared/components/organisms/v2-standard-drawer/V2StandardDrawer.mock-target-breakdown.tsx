import React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { Car } from "lucide-react";

export const MockTargetBreakdownTable = () => (
  <DrawerSection title="CHI TIẾT PHÂN BỔ THEO ĐỐI TƯỢNG / CHUYẾN XE (20 ĐỐI TƯỢNG)">
    <div className="space-y-2 text-xs">
      <div className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between">
        <span className="text-muted-foreground">
          Đang hiển thị 4 chuyến xe tiêu biểu đại diện trong tổng số 20 chuyến
          chịu phí:
        </span>
        <span className="font-mono text-primary font-semibold">
          Tổng cộng: 74.001 đ
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 border-b border-border/60">
            <tr>
              <th className="py-2 px-3 font-semibold text-muted-foreground w-8">
                #
              </th>
              <th className="py-2 px-3 font-semibold text-muted-foreground">
                BIỂN SỐ XE
              </th>
              <th className="py-2 px-3 font-semibold text-muted-foreground">
                TÀI XẾ
              </th>
              <th className="py-2 px-3 font-semibold text-muted-foreground">
                MÃ CHUYẾN
              </th>
              <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
                CƯỚC GỐC
              </th>
              <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
                CHIẾT KHẤU
              </th>
              <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
                THÀNH TIỀN
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <tr>
              <td className="py-2 px-3 text-muted-foreground">1</td>
              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-primary" />
                51H-999.88
              </td>
              <td className="py-2 px-3">Trần Văn Hùng (VF e34)</td>
              <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                01M40Q654AZ3A7QY1
              </td>
              <td className="py-2 px-3 text-right font-mono">58.744 đ</td>
              <td className="py-2 px-3 text-right font-mono text-destructive">
                -5.556 đ
              </td>
              <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                63.444 đ
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-muted-foreground">2</td>
              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-primary" />
                29B-123.45
              </td>
              <td className="py-2 px-3">Lê Hoàng Nam (VF 8)</td>
              <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                01M40Q654AZ3A7QY2
              </td>
              <td className="py-2 px-3 text-right font-mono">4.219 đ</td>
              <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                -
              </td>
              <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                4.557 đ
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-muted-foreground">3</td>
              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-primary" />
                60A-777.34
              </td>
              <td className="py-2 px-3">Phạm Quốc Dũng (VF 5)</td>
              <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                01M40Q654AZ3A7QY3
              </td>
              <td className="py-2 px-3 text-right font-mono">3.000 đ</td>
              <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                -
              </td>
              <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                3.240 đ
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-muted-foreground">4</td>
              <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-primary" />
                43A-555.90
              </td>
              <td className="py-2 px-3">Nguyễn Minh Trí (VF 9)</td>
              <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                01M40Q654AZ3A7QY4
              </td>
              <td className="py-2 px-3 text-right font-mono">2.556 đ</td>
              <td className="py-2 px-3 text-right font-mono text-destructive">
                -444 đ
              </td>
              <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                2.760 đ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DrawerSection>
);
