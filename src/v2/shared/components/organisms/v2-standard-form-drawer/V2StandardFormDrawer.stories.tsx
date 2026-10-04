import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2StandardFormDrawer } from "./V2StandardFormDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  DrawerField,
  DrawerRow,
} from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui/badge";
import {
  FileText,
  History,
  CreditCard,
  Link2,
  BookOpen,
  RefreshCw,
  FileSpreadsheet,
  Paperclip,
  Sparkles,
} from "lucide-react";

const meta: Meta<typeof V2StandardFormDrawer> = {
  title: "V2/Organisms/V2StandardFormDrawer",
  component: V2StandardFormDrawer,
  tags: ["autodocs"],
};

export default meta;

export const SingleColumnSimple = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 flex flex-col items-start gap-4">
      <V2Button onClick={() => setOpen(true)}>Mở Single Column Drawer</V2Button>
      <V2StandardFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Biểu mẫu tạo danh mục sản phẩm"
        subtitle="Cấu hình nhanh các trường thông tin cơ bản"
        layout="1-column"
        actions={[
          {
            label: "Hủy bỏ",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Lưu thay đổi",
            primary: true,
            onClick: () => setOpen(false),
          },
        ]}
      >
        <div className="space-y-4">
          <DrawerSection title="Thông tin cơ bản">
            <DrawerField label="Mã danh mục" required>
              <input
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                placeholder="VD: CAT-001"
              />
            </DrawerField>
            <DrawerField label="Tên danh mục" required>
              <input
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                placeholder="VD: Linh kiện phụ tùng xe máy điện"
              />
            </DrawerField>
          </DrawerSection>
        </div>
      </V2StandardFormDrawer>
    </div>
  );
};

export const ErpInvoiceDetailGoldenSimulation = () => {
  const [open, setOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState("detail");

  return (
    <div className="p-6">
      <V2Button onClick={() => setOpen(true)}>Mở Chi Tiết Hóa Đơn GSM</V2Button>

      <V2StandardFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Thông tin nội bộ: 65114302"
        titleExtra={
          <Badge
            variant="outline"
            className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
          >
            Mới
          </Badge>
        }
        subtitle="Người mua: CÔNG TY CỔ PHẦN DI CHUYỂN XANH VÀ THÔNG MINH GSM • Kỳ ngày: 03/10/2026"
        size="full"
        tabs={[
          {
            key: "details",
            label: "Chi tiết",
            icon: <FileText className="w-3.5 h-3.5" />,
          },
          {
            key: "financials",
            label: "Tài chính",
            icon: <CreditCard className="w-3.5 h-3.5" />,
          },
          {
            key: "linked_docs",
            label: "Chứng từ liên kết",
            icon: <Link2 className="w-3.5 h-3.5" />,
          },
          {
            key: "accounting",
            label: "Hạch toán kế toán",
            icon: <BookOpen className="w-3.5 h-3.5" />,
          },
          {
            key: "history",
            label: "Lịch sử & Kiểm duyệt",
            icon: <History className="w-3.5 h-3.5" />,
            badgeCount: 1,
          },
        ]}
        leftTabs={[
          {
            key: "detail",
            label: "Chi tiết",
          },
          {
            key: "target",
            label: "Chi tiết theo đối tượng",
            badgeCount: 20,
          },
          {
            key: "items",
            label: "Chi tiết HHDV",
          },
          {
            key: "analysis",
            label: "Biến động & Phân tích",
          },
        ]}
        activeLeftTabKey={activeLeftTab}
        onLeftTabChange={setActiveLeftTab}
        leftTabExtra={
          <div className="flex items-center gap-2">
            <V2Button
              variant="outline"
              size="xs"
              className="text-xs h-7 px-2.5 gap-1.5"
              onClick={() => alert("Xem trước HĐ thuần")}
            >
              <FileText className="w-3.5 h-3.5 text-muted-fg" />
              Xem trước HĐ thuần
            </V2Button>
            <V2Button
              variant="outline"
              size="xs"
              className="text-xs h-7 px-2.5 gap-1.5"
              onClick={() => alert("Tài liệu & PDF")}
            >
              <Paperclip className="w-3.5 h-3.5 text-muted-fg" />
              Tài liệu & PDF
            </V2Button>
          </div>
        }
        actionGroups={[
          {
            groupLabel: "ĐỒNG BỘ",
            items: [
              {
                key: "sync-gdt",
                label: "Đồng bộ từ GDT",
                icon: <RefreshCw className="w-3.5 h-3.5" />,
                onClick: () => alert("Đang đồng bộ từ Tổng cục thuế (GDT)..."),
              },
            ],
          },
          {
            groupLabel: "XUẤT DỮ LIỆU",
            items: [
              {
                key: "export-excel",
                label: "Xuất Excel hóa đơn",
                icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
                onClick: () => alert("Đang xuất file Excel hóa đơn..."),
              },
            ],
          },
        ]}
        actions={[
          {
            label: "Đóng",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Cập nhật ghi chú",
            primary: true,
            onClick: () => setOpen(false),
          },
        ]}
        leftPanel={
          <DrawerSection title="DANH SÁCH CHI TIẾT HÀNG HÓA & DỊCH VỤ">
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
                    <td className="py-2 px-3 text-right font-medium">
                      63.444 đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-muted-foreground">2</td>
                    <td className="py-2 px-3 font-medium">
                      Chiết khấu thương mại giảm giá mã
                      01M40Q654AZ3A7QY1HB49Z6SWJ
                    </td>
                    <td className="py-2 px-3 text-center">CHUYẾN</td>
                    <td className="py-2 px-3 text-right">1</td>
                    <td className="py-2 px-3 text-right text-destructive">
                      -5.556 đ
                    </td>
                    <td className="py-2 px-3 text-center">-</td>
                    <td className="py-2 px-3 text-center">8%</td>
                    <td className="py-2 px-3 text-right text-destructive">
                      -444 đ
                    </td>
                    <td className="py-2 px-3 text-right text-destructive">
                      -5.556 đ
                    </td>
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
                    <td className="py-2 px-3 text-right font-medium">
                      4.557 đ
                    </td>
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
          </DrawerSection>
        }
        rightPanel={
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
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
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
                    Hạch toán: Nợ 6427 / Nợ 1331 / Có 331 (Giao nhận (Grab, 911,
                    Bưu chính))
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
        }
      />
    </div>
  );
};
