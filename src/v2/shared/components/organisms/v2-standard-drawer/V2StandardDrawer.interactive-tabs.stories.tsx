import React, { useState } from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerRow } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { History, Info, DollarSign } from "lucide-react";

import type { Meta } from "@storybook/react";

const meta: Meta<typeof V2StandardDrawer> = {
  title: "Components/Organisms/Drawer/V2StandardDrawer",
  component: V2StandardDrawer,
};

export default meta;

export const InteractiveTabContentSwitching = () => {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6">
      <V2Button onClick={() => setOpen(true)}>
        Mở Demo Chuyển Đổi Tab & Nội Dung
      </V2Button>

      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Mặt hàng: Bộ điều khiển trung tâm VCU-X9"
        subtitle="Mã SKU: VCU-ELEC-2026-X9 • Đang kinh doanh"
        size="lg"
        layout="1-column"
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            key: "overview",
            label: "Thông tin tổng quan",
            icon: <Info className="w-3.5 h-3.5" />,
          },
          {
            key: "pricing",
            label: "Giá bán & Tồn kho",
            icon: <DollarSign className="w-3.5 h-3.5" />,
          },
          {
            key: "history",
            label: "Lịch sử cập nhật",
            icon: <History className="w-3.5 h-3.5" />,
            badgeCount: 3,
          },
        ]}
        actions={[
          {
            label: "Đóng",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
        ]}
      >
        {({ activeTabKey }) => (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-center justify-between">
              <span>
                🎯 Tab đang kích hoạt thông qua Render Props:{" "}
                <strong>{activeTabKey}</strong>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Hiệu ứng chuyển tab mượt mà với animate-in fade-in-50
              </span>
            </div>

            {activeTabKey === "overview" && (
              <DrawerSection title="THÔNG TIN KỸ THUẬT">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <DrawerRow
                    label="Mã vật tư"
                    value="VCU-ELEC-2026-X9"
                    copyable
                  />
                  <DrawerRow
                    label="Nhóm danh mục"
                    value="Linh kiện điện tử cao cấp"
                  />
                  <DrawerRow label="Đơn vị tính" value="Bộ (SET)" />
                  <DrawerRow
                    label="Tiêu chuẩn chống nước"
                    value="IP67 Waterproof"
                  />
                </div>
              </DrawerSection>
            )}

            {activeTabKey === "pricing" && (
              <DrawerSection title="BẢNG GIÁ & ĐỊNH MỨC TỒN">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <DrawerRow label="Giá nhập gần nhất" value="1.850.000 đ" />
                  <DrawerRow label="Giá bán niêm yết" value="2.450.000 đ" />
                  <DrawerRow label="Tồn kho thực tế" value="128 Bộ" />
                  <DrawerRow label="Tồn kho khả dụng" value="95 Bộ" />
                </div>
              </DrawerSection>
            )}

            {activeTabKey === "history" && (
              <DrawerSection title="AUDIT TRAIL">
                <div className="text-xs space-y-2">
                  <div className="p-2.5 rounded border border-border/70 bg-card">
                    <div className="font-semibold text-foreground">
                      Cập nhật giá bán lẻ
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      02/10/2026 bởi Quản lý kho • Tăng 50.000 đ
                    </div>
                  </div>
                  <div className="p-2.5 rounded border border-border/70 bg-card">
                    <div className="font-semibold text-foreground">
                      Nhập kho đợt 2 (50 Bộ)
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      28/09/2026 theo PO-202609-088
                    </div>
                  </div>
                </div>
              </DrawerSection>
            )}
          </div>
        )}
      </V2StandardDrawer>
    </div>
  );
};
