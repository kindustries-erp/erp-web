import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2StandardFormDrawer } from "./V2StandardFormDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  DrawerField,
  DrawerRow,
} from "@/v2/shared/components/molecules/v2-drawer-field";
import { DrawerAuditTimeline } from "@/v2/shared/components/molecules/v2-drawer-audit-timeline";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { Badge } from "@/v2/shared/ui/badge";
import { FileText, Wallet, History, CheckCircle } from "lucide-react";

const meta: Meta<typeof V2StandardFormDrawer> = {
  title: "V2/Organisms/V2StandardFormDrawer",
  component: V2StandardFormDrawer,
  tags: ["autodocs"],
};

export default meta;

export const SingleColumnSimple = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button onClick={() => setOpen(true)}>
        Mở Drawer 1 Cột (Size SM)
      </V2Button>
      <V2StandardFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        layout="1-column"
        size="sm"
        title="Cấu Hình Hồ Sơ Người Dùng"
        subtitle="Quản lý thông tin cá nhân và mật khẩu"
        actions={[
          { label: "Hủy", onClick: () => setOpen(false), variant: "secondary" },
          { label: "Cập nhật", onClick: () => setOpen(false), primary: true },
        ]}
      >
        <DrawerSection title="Thông Tin Cơ Bản">
          <DrawerField label="Họ và Tên" required>
            <input
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-xs"
              defaultValue="Nguyễn Văn A"
            />
          </DrawerField>
          <DrawerField label="Email liên hệ">
            <input
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-xs"
              defaultValue="admin@liouni.com"
            />
          </DrawerField>
        </DrawerSection>
      </V2StandardFormDrawer>
    </div>
  );
};

export const ErpInvoiceDetailGoldenSimulation = () => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <V2Button onClick={() => setOpen(true)}>
        Mở ERP Invoice Detail Drawer (Golden V1 Parity)
      </V2Button>
      <V2StandardFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        layout="2-columns"
        size="xl"
        title="Hóa Đơn Điện Tử: 1C26TLL - 0001290"
        titleExtra={
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Đã Phát Hành
            </Badge>
            <Badge variant="secondary">Đã Cấn Trừ Đủ</Badge>
          </div>
        }
        subtitle="Người mua: Công ty Cổ phần Công nghệ Klotus • Ký ngày: 04/10/2026"
        footerLeft={
          <V2Text variant="body-sm" className="font-semibold text-foreground">
            Tổng thanh toán:{" "}
            <span className="text-primary font-bold">165,000,000 đ</span>
          </V2Text>
        }
        actions={[
          {
            label: "Tải XML",
            variant: "outline",
            align: "left",
            onClick: () => alert("Tải XML GDT"),
          },
          {
            label: "In PDF",
            variant: "secondary",
            align: "left",
            onClick: () => alert("In PDF Hóa Đơn"),
          },
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
          <>
            <DrawerSection title="Thông Tin Người Mua & Xuất Hóa Đơn">
              <DrawerRow label="Mã Số Thuế" value="0315892341" copyable />
              <DrawerRow
                label="Tên Đơn Vị"
                value="Công ty Cổ phần Công nghệ Klotus"
              />
              <DrawerRow
                label="Địa Chỉ"
                value="Số 12 Đào Trí, Phường Phú Mỹ, Quận 7, TP.HCM"
              />
              <DrawerRow
                label="Hình Thức Thanh Toán"
                value="Chuyển khoản (TM/CK)"
              />
            </DrawerSection>

            <DrawerSection title="Danh Mục Hàng Hóa / Dịch Vụ (3 Mặt Hàng)">
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border/60">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-muted-foreground">
                        #
                      </th>
                      <th className="py-2 px-3 font-semibold text-muted-foreground">
                        Tên Mặt Hàng
                      </th>
                      <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
                        SL
                      </th>
                      <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
                        Đơn Giá
                      </th>
                      <th className="py-2 px-3 font-semibold text-muted-foreground text-right">
                        Thành Tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="py-2 px-3 text-muted-foreground">1</td>
                      <td className="py-2 px-3 font-medium">
                        Pin Lithium Iron Phosphate 72V 45Ah
                      </td>
                      <td className="py-2 px-3 text-right">5 bộ</td>
                      <td className="py-2 px-3 text-right">18,000,000 đ</td>
                      <td className="py-2 px-3 text-right font-medium">
                        90,000,000 đ
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-muted-foreground">2</td>
                      <td className="py-2 px-3 font-medium">
                        Động Cơ Điện Hub Motor 3000W
                      </td>
                      <td className="py-2 px-3 text-right">5 cái</td>
                      <td className="py-2 px-3 text-right">8,000,000 đ</td>
                      <td className="py-2 px-3 text-right font-medium">
                        40,000,000 đ
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-muted-foreground">3</td>
                      <td className="py-2 px-3 font-medium">
                        Bộ Điều Tốc ECU Thông Minh Gen-3
                      </td>
                      <td className="py-2 px-3 text-right">5 cái</td>
                      <td className="py-2 px-3 text-right">4,000,000 đ</td>
                      <td className="py-2 px-3 text-right font-medium">
                        20,000,000 đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DrawerSection>
          </>
        }
        rightPanel={
          <>
            <DrawerSection title="Tổng Quan Tài Chính">
              <DrawerRow label="Tiền Chưa Thuế" value="150,000,000 đ" />
              <DrawerRow label="Thuế Suất GTGT" value="10%" />
              <DrawerRow label="Tiền Thuế GTGT" value="15,000,000 đ" />
              <DrawerRow label="Tổng Thanh Toán" value="165,000,000 đ" />
              <DrawerRow label="Đã Cấn Trừ" value="165,000,000 đ" />
              <DrawerRow label="Còn Lại" value="0 đ" />
            </DrawerSection>

            <DrawerSection title="Thông Tin Cơ Quan Thuế">
              <DrawerRow label="Ký Hiệu Mẫu" value="1C26TLL" />
              <DrawerRow label="Số Hóa Đơn" value="0001290" copyable />
              <DrawerRow label="Mã GDT" value="2304918204918-01" copyable />
              <DrawerRow label="Thời Gian Ký" value="04/10/2026 14:30:25" />
            </DrawerSection>
          </>
        }
        relatedTabs={[
          {
            key: "netoff",
            label: "Chứng Từ Cấn Trừ",
            icon: <Wallet className="w-3.5 h-3.5" />,
            badgeCount: 1,
            content: (
              <div className="text-xs space-y-2">
                <V2Text variant="body-sm" className="font-semibold">
                  Bút toán đối soát sao kê:
                </V2Text>
                <div className="p-2.5 rounded-lg border border-border/70 bg-surface/50 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-foreground">
                      UNC-20261004-BIDV-089 (BIDV Cấn trừ HĐ)
                    </div>
                    <div className="text-[11px] text-muted-fg">
                      Ngày khớp: 04/10/2026 15:10:00
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">
                    165,000,000 đ
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "audit",
            label: "Lịch Sử Thao Tác",
            icon: <History className="w-3.5 h-3.5" />,
            badgeCount: 3,
            content: (
              <DrawerAuditTimeline
                items={[
                  {
                    id: "1",
                    action: "Khởi tạo dự thảo hóa đơn từ đơn hàng SO-0012",
                    actor: "Kế toán viên (Thu)",
                    timestamp: "04/10 09:15",
                    variant: "default",
                  },
                  {
                    id: "2",
                    action: "Ký số token HSM và gửi tổng cục thuế",
                    actor: "Hệ thống tự động",
                    timestamp: "04/10 14:30",
                    variant: "success",
                  },
                  {
                    id: "3",
                    action: "Khớp lệnh cấn trừ tự động với sao kê BIDV",
                    actor: "Smart Net-off Engine",
                    timestamp: "04/10 15:10",
                    variant: "success",
                  },
                ]}
              />
            ),
          },
          {
            key: "xml",
            label: "Tệp Đính Kèm & XML GDT",
            icon: <FileText className="w-3.5 h-3.5" />,
            badgeCount: 2,
            content: (
              <div className="text-xs space-y-2">
                <div className="p-2.5 rounded-lg border border-border/70 bg-surface/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>hoadon-1C26TLL-0001290.xml (Bản gốc GDT)</span>
                  </div>
                  <V2Button variant="outline" size="xs">
                    Tải về
                  </V2Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
