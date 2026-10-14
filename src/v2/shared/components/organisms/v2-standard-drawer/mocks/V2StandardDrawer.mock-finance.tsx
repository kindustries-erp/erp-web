import React, { useState } from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerRow } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

export const MockFinancialsTab = () => {
  const [deducted, setDeducted] = useState(0);
  const [inputVal, setInputVal] = useState("50000");
  const total = 74001;
  const remaining = Math.max(0, total - deducted);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputVal.replace(/\D/g, ""), 10) || 0;
    setDeducted((prev) => Math.min(total, prev + val));
  };

  const handleReset = () => {
    setDeducted(0);
    setInputVal("50000");
  };

  return (
    <div className="space-y-4">
      <DrawerSection title="TỔNG HỢP GIÁ TRỊ THANH TOÁN">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <DrawerRow label="Tổng tiền hàng (chưa thuế)" value="68.519 đ" />
          <DrawerRow label="Chiết khấu thương mại" value="-5.556 đ" />
          <DrawerRow label="Tiền thuế GTGT (8%)" value="5.402 đ" />
          <DrawerRow label="Tổng tiền thanh toán" value="74.001 đ" />
        </div>
      </DrawerSection>

      <DrawerSection title="MÔ PHỎNG CẤN TRỪ CÔNG NỢ THỜI GIAN THỰC">
        <div className="p-3 rounded-lg border border-border/70 bg-surface/50 text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trạng thái thanh toán</span>
            {remaining === 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                Đã thanh toán đủ
              </span>
            ) : deducted > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/30">
                Đã cấn trừ một phần
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/30">
                Chưa thanh toán
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Đã cấn trừ công nợ</span>
            <span className="font-semibold text-emerald-600 font-mono">
              {deducted.toLocaleString("vi-VN")} đ
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Còn lại phải trả</span>
            <span
              className={`font-semibold font-mono ${
                remaining === 0 ? "text-muted-foreground" : "text-destructive"
              }`}
            >
              {remaining.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <form
            onSubmit={handleApply}
            className="pt-2 border-t border-border/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground font-mono"
              placeholder="Nhập số tiền..."
            />
            <V2Button
              size="sm"
              type="submit"
              variant="primary"
              className="text-xs"
            >
              Áp dụng cấn trừ
            </V2Button>
            {deducted > 0 && (
              <V2Button
                size="sm"
                type="button"
                variant="outline"
                onClick={handleReset}
                className="text-xs"
              >
                Đặt lại
              </V2Button>
            )}
          </form>
        </div>
      </DrawerSection>
    </div>
  );
};

export const MockAccountingTab = () => (
  <DrawerSection title="ĐỊNH KHOẢN BÚT TOÁN KẾ TOÁN">
    <div className="overflow-x-auto rounded-lg border border-border/70">
      <table className="w-full text-xs text-left">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="py-2 px-3 font-semibold text-muted-foreground">
              TK NỢ
            </th>
            <th className="py-2 px-3 font-semibold text-muted-foreground">
              TK CÓ
            </th>
            <th className="py-2 px-3 font-semibold text-muted-foreground">
              DIỄN GIẢI
            </th>
            <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
              SỐ TIỀN
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          <tr>
            <td className="py-2 px-3 font-mono font-medium text-primary">
              6427
            </td>
            <td className="py-2 px-3 font-mono text-muted-foreground">-</td>
            <td className="py-2 px-3">Chi phí vận chuyển & giao nhận GSM</td>
            <td className="py-2 px-3 text-right font-medium">68.599 đ</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-mono font-medium text-primary">
              1331
            </td>
            <td className="py-2 px-3 font-mono text-muted-foreground">-</td>
            <td className="py-2 px-3">Thuế GTGT đầu vào được khấu trừ 8%</td>
            <td className="py-2 px-3 text-right font-medium">5.402 đ</td>
          </tr>
          <tr>
            <td className="py-2 px-3 font-mono text-muted-foreground">-</td>
            <td className="py-2 px-3 font-mono font-medium text-emerald-600">
              331
            </td>
            <td className="py-2 px-3">Phải trả nhà cung cấp GSM Smart</td>
            <td className="py-2 px-3 text-right font-bold text-foreground">
              74.001 đ
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DrawerSection>
);
