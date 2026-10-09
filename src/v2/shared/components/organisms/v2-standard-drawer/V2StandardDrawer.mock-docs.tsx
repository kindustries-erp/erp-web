import React, { useState } from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Send } from "lucide-react";

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
