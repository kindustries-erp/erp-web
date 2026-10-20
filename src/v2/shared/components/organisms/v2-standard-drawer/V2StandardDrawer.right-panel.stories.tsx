import React, { useState } from "react";
import { V2StandardDrawer } from "./V2StandardDrawer";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import type { Meta } from "@storybook/react";

const meta: Meta<typeof V2StandardDrawer> = {
  title: "Components/Organisms/Drawer/V2StandardDrawer",
  component: V2StandardDrawer,
};

export default meta;

export const RightPanelCollapseAnimationDemo = () => {
  const [open, setOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customerName, setCustomerName] = useState("Công ty TNHH Vận Tải Xanh");
  const [internalNote, setInternalNote] = useState(
    "Khách hàng VIP, ưu tiên giao phụ tùng trước 10h sáng.",
  );

  return (
    <div className="p-6">
      <V2Button onClick={() => setOpen(true)}>
        Mở Demo Expand/Collapse Right Column
      </V2Button>

      <V2StandardDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Hồ sơ đối tác: KH-VIP-099"
        subtitle="Kiểm tra tương tác thu gọn / mở rộng cột phải và giữ nguyên form state"
        size="xl"
        layout="2-columns"
        collapsibleRightPanel={true}
        isRightPanelCollapsed={isCollapsed}
        onRightPanelCollapseChange={setIsCollapsed}
        actions={[
          {
            label: "Đóng",
            variant: "secondary",
            onClick: () => setOpen(false),
          },
          {
            label: "Lưu dữ liệu",
            primary: true,
            onClick: () => alert(`Đã lưu: ${customerName}`),
          },
        ]}
        leftPanel={
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Trạng thái cột phải:{" "}
                <strong
                  className={
                    isCollapsed ? "text-amber-600" : "text-emerald-600"
                  }
                >
                  {isCollapsed
                    ? "Đã thu gọn (100% full width)"
                    : "Đang mở rộng (2 cột)"}
                </strong>
              </span>
              <V2Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <>
                    <PanelRightOpen className="w-3.5 h-3.5" />
                    Mở rộng cột phải
                  </>
                ) : (
                  <>
                    <PanelRightClose className="w-3.5 h-3.5" />
                    Thu gọn cột phải
                  </>
                )}
              </V2Button>
            </div>

            <DrawerSection title="THÔNG TIN KHÁCH HÀNG">
              <DrawerField label="Tên khách hàng" required>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                />
              </DrawerField>
              <DrawerField label="Số điện thoại" required>
                <input
                  defaultValue="0988 123 456"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                />
              </DrawerField>
              <DrawerField label="Địa chỉ xuất hóa đơn">
                <input
                  defaultValue="Tầng 12, Tòa nhà Liouni Tower, Quận 7, TP.HCM"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground"
                />
              </DrawerField>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <DrawerSection title="GHI CHÚ NỘI BỘ (CỘT PHẢI)">
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px]">
                Dữ liệu trong cột này được giữ nguyên vẹn kể cả khi bạn thu gọn
                và mở rộng lại nhờ cơ chế CSS transition không unmount DOM.
              </p>
              <textarea
                rows={4}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface text-foreground resize-none"
              />
              <div className="p-2 rounded bg-muted/50 text-[11px] text-muted-foreground">
                💡 Bạn cũng có thể bấm biểu tượng Chevron ở góc phải Header để
                thu gọn / mở rộng.
              </div>
            </div>
          </DrawerSection>
        }
      />
    </div>
  );
};
