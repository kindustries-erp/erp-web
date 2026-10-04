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
import { Badge } from "@/v2/shared/ui/badge";
import { FileText, Wallet, Network, History } from "lucide-react";

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

export const TwoColumnsDocument = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button onClick={() => setOpen(true)}>
        Mở Drawer 2 Cột (Size XL)
      </V2Button>
      <V2StandardFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        layout="2-columns"
        size="xl"
        title="Phiếu Xuất Kho XK-20261004-002"
        titleExtra={<Badge variant="outline">Đang giao</Badge>}
        subtitle="Chi nhánh Nam Sài Gòn"
        actions={[
          {
            label: "Hủy phiếu",
            onClick: () => setOpen(false),
            variant: "danger",
            align: "left",
          },
          {
            label: "Đóng",
            onClick: () => setOpen(false),
            variant: "secondary",
          },
          {
            label: "Xác nhận xuất",
            onClick: () => setOpen(false),
            primary: true,
          },
        ]}
        leftPanel={
          <div className="space-y-3">
            <DrawerSection title="Chi Tiết Vật Tư Xuất Kho">
              <div className="p-3 bg-surface/50 rounded-lg text-xs text-muted-fg">
                Bảng danh sách 15 mặt hàng linh kiện xuất lắp ráp.
              </div>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <div className="space-y-3">
            <DrawerSection title="Thông Tin Chung">
              <DrawerRow label="Mã Phiếu" value="XK-20261004-002" copyable />
              <DrawerRow label="Người Tạo" value="Trần Thị B" />
              <DrawerRow label="Kho Xuất" value="Kho Tổng NSG" />
            </DrawerSection>
            <DrawerSection
              title="Thuộc Tính Bổ Sung"
              collapsible
              defaultCollapsed
            >
              <DrawerRow label="Mã Đơn PO" value="PO-9921" copyable />
            </DrawerSection>
          </div>
        }
      />
    </div>
  );
};

export const MultiFacetTabsDocument = () => {
  const [open, setOpen] = useState(false);

  const tabs = [
    {
      key: "details",
      label: "Chi Tiết Phiếu",
      icon: <FileText className="w-3.5 h-3.5" />,
      content: (
        <DrawerSection title="Nội Dung Phiếu">
          <p className="text-xs text-muted-fg">
            Xem trước chứng từ chi tiết...
          </p>
        </DrawerSection>
      ),
    },
    {
      key: "financials",
      label: "Tài Chính & Dòng Tiền",
      icon: <Wallet className="w-3.5 h-3.5" />,
      badgeCount: 2,
      content: (
        <DrawerSection title="Đối Soát Dòng Tiền">
          <p className="text-xs text-muted-fg">
            Chi tiết 2 giao dịch cấn trừ ngân hàng...
          </p>
        </DrawerSection>
      ),
    },
    {
      key: "traceability",
      label: "Chứng Từ Liên Kết",
      icon: <Network className="w-3.5 h-3.5" />,
      hideRightPanel: true,
      content: (
        <DrawerSection title="Traceability Graph (Bung 100% Width)">
          <div className="h-64 flex items-center justify-center bg-surface/40 rounded-lg border border-border/60 text-xs text-muted-fg">
            Canvas Traceability Graph hiển thị toàn bộ mạng lưới liên kết
          </div>
        </DrawerSection>
      ),
    },
    {
      key: "history",
      label: "Lịch Sử Thao Tác",
      icon: <History className="w-3.5 h-3.5" />,
      badgeCount: 3,
      content: (
        <DrawerSection title="Audit Timeline">
          <DrawerAuditTimeline
            items={[
              {
                id: "1",
                action: "Khởi tạo đơn hàng",
                actor: "Lio",
                timestamp: "09:00",
                variant: "success",
              },
              {
                id: "2",
                action: "Đính kèm hóa đơn VAT",
                actor: "Thu",
                timestamp: "10:15",
                variant: "default",
              },
            ]}
          />
        </DrawerSection>
      ),
    },
  ];

  return (
    <div>
      <V2Button onClick={() => setOpen(true)}>
        Mở Multi-Facet Tabs Drawer
      </V2Button>
      <V2StandardFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        layout="2-columns"
        size="xl"
        title="Hóa Đơn ERP: HD-00918"
        tabs={tabs}
        rightPanel={
          <DrawerSection title="Metadata Hóa Đơn">
            <DrawerRow label="Ký Hiệu" value="1C26TLL" />
            <DrawerRow label="Số HĐ" value="0001290" copyable />
          </DrawerSection>
        }
      />
    </div>
  );
};
