import React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { TrendingUp, FileCheck } from "lucide-react";

export const MockItemsCategoryBreakdown = () => (
  <DrawerSection title="CƠ CẤU PHÂN LOẠI DANH MỤC HÀNG HÓA & DỊCH VỤ">
    <div className="space-y-3 text-xs">
      <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">
            1. Cước phí vận tải hành khách Taxi điện
          </span>
          <span className="font-mono text-primary font-bold">
            58.744 đ (92.6%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="bg-primary h-full rounded-full w-[92.6%]" />
        </div>
        <div className="text-[11px] text-muted-foreground">
          Áp dụng thuế suất GTGT 8% • Mã ngành vận tải hành khách đường bộ.
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">
            2. Phí dịch vụ nền tảng kết nối ứng dụng
          </span>
          <span className="font-mono text-emerald-600 font-bold">
            4.219 đ (6.1%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full w-[6.1%]" />
        </div>
        <div className="text-[11px] text-muted-foreground">
          Áp dụng thuế suất GTGT 8% • Phí trung gian kết nối người dùng.
        </div>
      </div>

      <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">
            3. Chiết khấu thương mại & Voucher khuyến mãi
          </span>
          <span className="font-mono text-destructive font-bold">
            -5.556 đ (-7.5%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="bg-destructive h-full rounded-full w-[7.5%]" />
        </div>
        <div className="text-[11px] text-muted-foreground">
          Giảm trừ doanh thu trực tiếp trước tính thuế theo quy định.
        </div>
      </div>
    </div>
  </DrawerSection>
);

export const MockAnalysisVarianceTab = () => (
  <DrawerSection title="BIẾN ĐỘNG CHI PHÍ & PHÂN TÍCH SO SÁNH">
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1">
          <div className="text-muted-foreground text-[11px]">
            Biến động so kỳ trước
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +10.3%
          </div>
          <div className="text-[10px] text-muted-foreground">
            Tháng trước: 62.100 đ
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1">
          <div className="text-muted-foreground text-[11px]">
            Đơn giá bình quân/chuyến
          </div>
          <div className="text-lg font-bold font-mono text-foreground">
            63.444 đ
          </div>
          <div className="text-[10px] text-muted-foreground">
            Tăng +4.2% do cước giờ cao điểm
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1">
          <div className="text-muted-foreground text-[11px]">
            Tỷ lệ chiết khấu
          </div>
          <div className="text-lg font-bold font-mono text-primary">7.5%</div>
          <div className="text-[10px] text-muted-foreground">
            Đúng định mức hợp đồng khung
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
        <FileCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-xs">
            Hóa đơn đã được AI đối soát hoàn tất 100%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-0.5">
            Không phát hiện sai lệch đơn giá giữa hóa đơn thuế điện tử và bảng
            kê chuyến xe nội bộ từ hệ thống GSM.
          </div>
        </div>
      </div>
    </div>
  </DrawerSection>
);
