import React, { useState } from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerRow } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import {
  Sparkles,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Car,
  TrendingUp,
  Send,
  FileCheck,
} from "lucide-react";

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

export const MockLinkedDocsTab = () => (
  <DrawerSection title="MẠNG LƯỚI CHỨNG TỪ LIÊN QUAN">
    <div className="space-y-2.5 text-xs">
      <div className="p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
        <div>
          <div className="font-semibold text-foreground">
            Phiếu nhập kho NK-2026-001
          </div>
          <div className="text-muted-foreground text-[11px]">
            Ngày lập: 03/10/2026 • Kho Nam Sài Gòn
          </div>
        </div>
        <span className="text-primary font-medium cursor-pointer hover:underline">
          Xem chứng từ →
        </span>
      </div>
      <div className="p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
        <div>
          <div className="font-semibold text-foreground">
            Phiếu dịch vụ Garage GR-PDV-102
          </div>
          <div className="text-muted-foreground text-[11px]">
            Xe: 51H-999.88 • GSM Taxi
          </div>
        </div>
        <span className="text-primary font-medium cursor-pointer hover:underline">
          Xem chứng từ →
        </span>
      </div>
    </div>
  </DrawerSection>
);

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

export const MockHistoryTab = () => {
  const [logs, setLogs] = useState([
    {
      id: "1",
      title: "Đồng bộ tự động từ Tổng cục thuế (GDT)",
      time: "03/10/2026 14:32:10 • Hệ thống AI Core Hub",
      desc: "Xác thực mã tra cứu XML hợp lệ, chữ ký số NCC hợp lệ.",
      color: "bg-emerald-500",
    },
    {
      id: "2",
      title: "Phê duyệt hóa đơn thuế",
      time: "03/10/2026 15:10:05 • Nguyễn Văn Kế Toán",
      desc: "Kiểm tra trùng khớp với Phiếu nhập kho NK-2026-001.",
      color: "bg-primary",
    },
  ]);
  const [note, setNote] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN")} • Bạn (Admin)`;
    setLogs([
      ...logs,
      {
        id: String(Date.now()),
        title: "Ghi chú kiểm duyệt",
        time: timeStr,
        desc: note.trim(),
        color: "bg-indigo-500",
      },
    ]);
    setNote("");
  };

  return (
    <DrawerSection title="NHẬT KÝ THAO TÁC & AUDIT LOGS (TOÀN CẢNH)">
      <div className="space-y-4">
        <form
          onSubmit={handleAddNote}
          className="p-3 rounded-lg border border-border/70 bg-muted/20 flex gap-2"
        >
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú kiểm tra hoặc phản hồi..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
          />
          <V2Button
            size="sm"
            type="submit"
            variant="primary"
            className="gap-1 text-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Gửi ghi chú
          </V2Button>
        </form>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border text-xs">
          {logs.map((item) => (
            <div
              key={item.id}
              className="relative animate-in fade-in-50 duration-200"
            >
              <div
                className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${item.color} border-2 border-background`}
              />
              <div className="font-semibold text-foreground">{item.title}</div>
              <div className="text-[11px] text-muted-foreground">
                {item.time}
              </div>
              <div className="mt-1 p-2 rounded bg-muted/40 text-muted-foreground text-[11px]">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DrawerSection>
  );
};

export const MockInvoicePdfPreview = () => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-3">
      {/* PDF Controls Toolbar */}
      <div className="flex items-center justify-between p-2 rounded-lg border border-border/70 bg-muted/40 text-xs">
        <div className="flex items-center gap-2">
          <V2Button
            size="icon-sm"
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </V2Button>
          <span className="font-mono text-muted-foreground">
            Trang {page} / 2
          </span>
          <V2Button
            size="icon-sm"
            variant="ghost"
            disabled={page === 2}
            onClick={() => setPage(2)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </V2Button>
        </div>

        <div className="flex items-center gap-1.5">
          <V2Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </V2Button>
          <span className="font-mono text-muted-foreground w-12 text-center">
            {zoom}%
          </span>
          <V2Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </V2Button>
          <div className="h-4 w-px bg-border mx-1" />
          <V2Button size="sm" variant="outline" className="gap-1 text-xs">
            <Printer className="w-3.5 h-3.5" />
            In
          </V2Button>
          <V2Button size="sm" variant="outline" className="gap-1 text-xs">
            <Download className="w-3.5 h-3.5" />
            Tải PDF
          </V2Button>
        </div>
      </div>

      {/* Simulated A4 PDF Canvas */}
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
              <div className="font-semibold text-zinc-800">
                Đơn vị bán hàng:
              </div>
              <div>CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM</div>
              <div>MST: 0110285067</div>
            </div>
            <div>
              <div className="font-semibold text-zinc-800">
                Đơn vị mua hàng:
              </div>
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
                <th className="p-1.5 border-r border-zinc-300 text-center">
                  ĐVT
                </th>
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
              <div>
                Người ký: CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM
              </div>
              <div className="font-mono text-[9px] text-emerald-600">
                Thời gian ký: 03/10/2026 14:32:10 GMT+7
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
